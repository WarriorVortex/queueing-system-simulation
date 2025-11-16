import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideDisciplines, provideRules} from '@app/providers';
import {SIMULATION_PARAMS, SimulationParams} from '@app/services/simulation';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideDisciplines(),
    provideRules(),
    {
      provide: SIMULATION_PARAMS,
      useValue: { autoconfig: true }
    }
  ]
};
