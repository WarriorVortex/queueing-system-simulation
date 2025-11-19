import {Provider} from '@angular/core';
import {
  BUFFERING_DISCIPLINE,
  DEVICE_SELECTION_DISCIPLINE,
  REJECTION_DISCIPLINE,
  REQUEST_SELECTION_DISCIPLINE
} from '@app/services/entity';
import {bufferRequest, rejectRequest, selectDevice, SelectDeviceData, selectRequest} from './implementations';
import {ON_RELOAD_SIMULATION} from '@app/services/simulation';

export function provideDisciplines(): Provider[] {
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
      useValue: rejectRequest
    },
    {
      provide: ON_RELOAD_SIMULATION,
      useValue: [ SelectDeviceData.reload ],
    }
  ];
}

