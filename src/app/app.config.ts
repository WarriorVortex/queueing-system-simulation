import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideDisciplines, provideRules} from '@app/providers';
import {SIMULATION_PARAMS} from '@app/services/simulation';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideDisciplines(),
    provideRules(),
    {
      provide: SIMULATION_PARAMS,
      useValue: { autoconfig: true }
    },
  ]
};
