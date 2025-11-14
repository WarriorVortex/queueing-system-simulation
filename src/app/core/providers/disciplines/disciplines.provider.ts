import {Provider} from '@angular/core';
import {
  BUFFERING_DISCIPLINE,
  DEVICE_SELECTION_DISCIPLINE,
  REJECTION_DISCIPLINE,
  REQUEST_SELECTION_DISCIPLINE
} from '@app/services/entity';
import {bufferRequest, rejectRequest, selectDevice, selectRequest} from './implementations';

export function provideDisciplines(): Provider[] {
  return [
    {
      provide: DEVICE_SELECTION_DISCIPLINE,
      useValue: selectDevice
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
    }
  ];
}

