import {Provider} from '@angular/core';
import {
  REQUEST_INTERVAL_RULE,
  REQUEST_INTERVAL_RULE_PARAMS,
  SERVICE_TIME_RULE,
  SERVICE_TIME_RULE_PARAMS
} from '@app/services/entity';
import {calculateInterval, calculateServiceTime, IntervalRuleParams, ServiceTimeParams} from './implementations';

export function provideRules(): Provider[] {
  return [
    {
      provide: REQUEST_INTERVAL_RULE,
      useValue: calculateInterval
    },
    {
      provide: REQUEST_INTERVAL_RULE_PARAMS,
      useValue: IntervalRuleParams
    },
    {
      provide: SERVICE_TIME_RULE,
      useValue: calculateServiceTime
    },
    {
      provide: SERVICE_TIME_RULE_PARAMS,
      useValue: ServiceTimeParams
    }
  ];
}
