import {RequestIntervalRule} from '@app/models/rules';

export const calculateInterval: RequestIntervalRule = () => {
  const { a, b } = IntervalRuleParams;
  const x = a + Math.random() * (b - a);
  return (x - a) / (b - a);
}

export const IntervalRuleParams = {
  a: 10,
  b: 20,
}
