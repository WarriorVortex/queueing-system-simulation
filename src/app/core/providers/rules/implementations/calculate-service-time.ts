import {ServiceTimeRule} from '@app/models/rules';

export const calculateServiceTime: ServiceTimeRule = () => {
  const { lambda } = ServiceTimeParams;
  const x = Math.random();
  return 1 - Math.exp(-lambda * x);
}

export const ServiceTimeParams = {
  lambda: 1,
}
