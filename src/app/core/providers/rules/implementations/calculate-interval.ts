import {RequestIntervalRule} from '@app/models/rules';

let a = 10;
let b = 20;

export const calculateInterval: RequestIntervalRule = () => {
  const x = a + Math.random() * (b - a);
  return (x - a) / (b - a);
}
