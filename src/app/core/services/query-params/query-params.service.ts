import {DestroyRef, effect, inject, Injectable, Injector, Signal, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import READ_WRITE_CONFIG, {
  InputReactiveParams,
  OutputReactiveParams,
  ParseFn,
  QueryParamsBindOptions,
  ReadWriteConfig,
  StringifyFn
} from './query-params.types';
import Helpers, {BindProcessed, InnerReactiveParams, OuterReactiveParams} from './query-params.helpers';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  public bind(reactiveParams: InputReactiveParams, options?: QueryParamsBindOptions) {
    const {
      write = READ_WRITE_CONFIG.write,
      read = READ_WRITE_CONFIG.read,
      stringifyFn = Helpers.stringify,
      parseFn = Helpers.parse
    } = options ?? {};
    if (!read && !write) {
      return {};
    }

    const config = { write, read };
    const processed = this.processReactiveParams(reactiveParams, config);
    const { inner, outer } = processed
    const params = { ...inner, ...outer };

    if (write) {
      this.bindOnWrite(params, stringifyFn);
    }
    if (read) {
      this.bindOnRead(params, parseFn);
    }

    const signals = { inner, outer, initial: reactiveParams};
    return this.processBindReturn(signals, config);
  }

  private processReactiveParams(reactiveParams: InputReactiveParams, config: ReadWriteConfig) {
    const inner: InnerReactiveParams = {};
    const outer: OuterReactiveParams = {};
    const { write } = config;

    for (const [key, value] of Object.entries(reactiveParams)) {
      if (value === null) {
        inner[key] = signal<unknown>(undefined);
      } else if (write && !Helpers.isWritable(value)) {
        inner[key] = signal<unknown>(value());
        effect(() => {
          const signal = inner[key] as WritableSignal<unknown>;
          signal.set(value());
        }, { injector: this.injector });
      } else {
        outer[key] = value;
      }
    }

    return { inner, outer };
  }

  private processBindReturn(signals: BindProcessed, config: ReadWriteConfig): OutputReactiveParams {
    const { write, read } = config;
    const { inner, outer, initial } = signals;

    const entries = Object.entries(initial)
      .map(([key, value]) => {
        const isExisted = value !== null;
        const isWritable = isExisted && Helpers.isWritable(value);
        let signal: WritableSignal<unknown> | Signal<unknown>;
        if (write && isExisted && !isWritable) {
          signal = inner[key]; // Can be also outer, now works like linked signal
        } else if (write && !isExisted) {
          signal = inner[key];
        } else if (write && isExisted && isWritable) {
          signal = outer[key];
        } else if (read && !isExisted) {
          signal = inner[key].asReadonly();
        } else if (read && isExisted && !isWritable) {
          signal = outer[key];
        } else if (read && isExisted && isWritable) {
          signal = (outer[key] as WritableSignal<unknown>).asReadonly();
        } else {
          signal = inner[key];
        }
        return [key, signal];
      });
    return Object.fromEntries(entries);
  }

  private bindOnWrite(reactiveParams: OutputReactiveParams, stringify: StringifyFn) {
    const { injector } = this;
    effect(() => {
      const entries = Object.entries(reactiveParams).map(
        ([key, value]) => {
          const string = stringify(value(), key);
          return [key, string];
        }
      );
      const queryParams: Params = Object.fromEntries(entries);
      this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
    }, { injector });
  }

  private bindOnRead(reactiveParams: OutputReactiveParams, parse: ParseFn) {
    this.activatedRoute.queryParams.pipe(
      tap(params => {
        for (const [key, value] of Object.entries(params)) {
          const reactiveParam = reactiveParams[key];
          if (reactiveParam && Helpers.isWritable(reactiveParam)) {
            const parsed = parse(value, key);
            reactiveParam.set(parsed);
          }
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
