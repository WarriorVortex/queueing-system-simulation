import {EnvironmentProviders, inject, provideAppInitializer, Provider} from '@angular/core';
import {
  BUFFERING_DISCIPLINE,
  DEVICE_SELECTION_DISCIPLINE,
  REJECTION_DISCIPLINE,
  REQUEST_SELECTION_DISCIPLINE
} from '@app/services/entity';
import {
  bufferRequest,
  rejectRequest,
  reloadLastIndex,
  selectDevice,
  selectRequest
} from './implementations';
import {SimulationService} from '@app/services/simulation';

export function provideDisciplines(): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: DEVICE_SELECTION_DISCIPLINE,
      useFactory: () => selectDevice,
    },
    {
      provide: REQUEST_SELECTION_DISCIPLINE,
      useValue: selectRequest
    },
    {
      provide: BUFFERING_DISCIPLINE,
      useValue: bufferRequest
    },
    {
      provide: REJECTION_DISCIPLINE,
      useValue: rejectRequest,
    },
    provideAppInitializer(() => {
      const simulation = inject(SimulationService)
      simulation.onReload$
        .subscribe(reloadLastIndex);
    }),
  ];
}

