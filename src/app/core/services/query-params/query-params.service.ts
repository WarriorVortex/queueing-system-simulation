import {DestroyRef, effect, inject, Injectable, Injector} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ParseFn, QueryParamsBindOptions, ReactiveParams, StringifyFn} from './query-params.types';

const self = (value: any) => value;

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  public bind(reactiveParams: ReactiveParams, options?: QueryParamsBindOptions) {
    const {
      write = false,
      read = true,
      stringifyFn = self,
      parseFn = self
    } = options ?? {};

    if (write) {
      this.bindOnWrite(reactiveParams, stringifyFn);
    }
    if (read) {
      this.bindOnRead(reactiveParams, parseFn);
    }
  }

  private bindOnWrite(reactiveParams: ReactiveParams, stringify: StringifyFn = self) {
    const { injector } = this;
    effect(() => {
      const entries = Object.entries(reactiveParams).map(
        ([key, value]) => ([key, stringify(value())])
      );
      const queryParams: Params = Object.fromEntries(entries);
      this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
    }, { injector });
  }

  private bindOnRead(reactiveParams: ReactiveParams, parse: ParseFn = self) {
    this.activatedRoute.queryParams.pipe(
      tap(params => {
        for (const [key, value] of Object.entries(params)) {
          const reactiveParam = reactiveParams[key];
          if (reactiveParam && 'set' in reactiveParam) {
            reactiveParam.set(parse(value));
          }
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
