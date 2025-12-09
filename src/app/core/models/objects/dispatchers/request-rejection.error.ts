import {Request} from '../request';

export class RequestRejectionError extends Error {
  constructor(
    public readonly rejected: Request,
    message: string = 'Request was rejected'
  ) {
    super(message);
  }
}
