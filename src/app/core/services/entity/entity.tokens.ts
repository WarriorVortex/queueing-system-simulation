import {InjectionToken} from '@angular/core';
import {
  BufferingDiscipline,
  DeviceSelectionDiscipline,
  RejectionDiscipline,
  RequestSelectionDiscipline
} from '@app/models/disciplines';
import {RequestIntervalRule, ServiceTimeRule} from '@app/models/rules';

export const DEVICE_SELECTION_DISCIPLINE = new InjectionToken<DeviceSelectionDiscipline>(
  'DEVICE_SELECTION_DISCIPLINE',
);

export const REQUEST_SELECTION_DISCIPLINE = new InjectionToken<RequestSelectionDiscipline>(
  'REQUEST_SELECTION_DISCIPLINE',
);

export const BUFFERING_DISCIPLINE = new InjectionToken<BufferingDiscipline>(
  'BUFFERING_DISCIPLINE',
);

export const REJECTION_DISCIPLINE = new InjectionToken<RejectionDiscipline>(
  'BUFFERING_DISCIPLINE',
);

export const REQUEST_INTERVAL_RULE = new InjectionToken<RequestIntervalRule>(
  'REQUEST_INTERVAL_RULE',
);

export const SERVICE_TIME_RULE = new InjectionToken<ServiceTimeRule>(
  'SERVICE_TIME_RULE',
);
