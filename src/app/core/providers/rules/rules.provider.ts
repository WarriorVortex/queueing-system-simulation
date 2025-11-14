import {Provider} from '@angular/core';
import {REQUEST_INTERVAL_RULE, SERVICE_TIME_RULE} from '@app/services/entity';
import {calculateInterval, calculateServiceTime} from './implementations';

export function provideRules(): Provider[] {
  return [
    {
      provide: REQUEST_INTERVAL_RULE,
      useValue: calculateInterval
    },
    {
      provide: SERVICE_TIME_RULE,
      useValue: calculateServiceTime
    }
  ];
}
