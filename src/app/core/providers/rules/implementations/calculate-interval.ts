import {RequestIntervalRule} from '@app/models/rules';
import {signal} from '@angular/core';

export const calculateInterval: RequestIntervalRule = () => {
  const { a, b } = IntervalRuleParams;
  const random = Math.random();
  return a() + random * (b() - a());
}

export const IntervalRuleParams = {
  a: signal(10),
  b: signal(20),
}
