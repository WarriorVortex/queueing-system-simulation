import {Request} from '@app/models';

export type ServiceTimeRule = (request?: Request, currentTime?: number) => number;
