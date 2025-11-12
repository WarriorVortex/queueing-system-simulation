import { Buffer } from '../buffer';
import {Request} from '../request';
import {RequestRejectionError} from './request-rejection-error';
import {BufferingDiscipline, RejectionDiscipline} from '../disciplines';

export class BufferingDispatcher {
  constructor(
    private readonly buffer: Buffer,
    private readonly bufferingDiscipline: BufferingDiscipline,
    private readonly rejectedDiscipline: RejectionDiscipline,
  ) {}

  public putInBuffer(request: Request): Request {
    if (this.buffer.isFull) {
      const rejected = this.rejectedDiscipline(request, this.buffer);
      throw new RequestRejectionError(rejected);
    }

    return this.bufferingDiscipline(request, this.buffer);
  }
}
