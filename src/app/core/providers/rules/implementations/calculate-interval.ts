import {RequestIntervalRule} from '@app/models/rules';

export const calculateInterval: RequestIntervalRule = () => {
  const { a, b } = IntervalRuleParams;
  const random = Math.random();
  return a + random * (b - a);
}

export const IntervalRuleParams = {
  a: 10,
  b: 20,
}
