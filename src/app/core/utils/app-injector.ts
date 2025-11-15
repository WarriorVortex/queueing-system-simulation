import {inject, Injector, ProviderToken, runInInjectionContext} from '@angular/core';

export default class AppInjector {
  private static _appInjector: Injector | undefined;

  private constructor() {}

  public static capture(appInjector?: Injector): Injector {
    if (this._appInjector !== undefined) {
      console.warn('AppInjector has already been created');
      return this._appInjector;
    }
    this._appInjector = inject(Injector, { optional: true }) ?? appInjector;

    if (this._appInjector === undefined) {
      throw new Error('AppInjector has not been created');
    }
    return this._appInjector;
  }

  public static provide<T>(token: ProviderToken<T>): T {
    return runInInjectionContext(this._appInjector!, () => inject(token));
  }
}

export const {
  capture: captureAppInjector,
  provide: provideInjectable
} = AppInjector;
