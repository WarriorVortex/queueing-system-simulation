import {ServiceTimeRule} from '@app/models/rules';
import {signal} from '@angular/core';

export const calculateServiceTime: ServiceTimeRule = () => {
  const { lambda } = ServiceTimeParams;
  const random = Math.random();
  return Math.log(1 - random) / -lambda();
}

export const ServiceTimeParams = {
  lambda: signal(1),
}
