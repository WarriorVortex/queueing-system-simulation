import {Request} from '../request';

export class RequestRejectionError extends Error {
  constructor(
    public readonly rejectedRequest: Request,
    message: string = 'Request was rejected'
  ) {
    super(message);
  }
}
