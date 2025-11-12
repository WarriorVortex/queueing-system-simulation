import {Request} from '../request';

export type ServiceTimeRule = (request?: Request, currentTime?: number) => number;
