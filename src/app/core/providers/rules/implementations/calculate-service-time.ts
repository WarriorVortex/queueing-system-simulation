import {ServiceTimeRule} from '@app/models/rules';

let lambda = 1;

export const calculateServiceTime: ServiceTimeRule = () => {
  const x = Math.random();
  return 1 - Math.exp(-lambda * x);
}
