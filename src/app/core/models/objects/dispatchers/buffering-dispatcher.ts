import { Buffer } from '../buffer';
import {Request} from '../request';
import {RequestRejectionError} from './request-rejection.error';
import {BufferingDiscipline, RejectionDiscipline} from '@app/models/disciplines';

export class BufferingDispatcher {
  constructor(
    private readonly buffer: Buffer,
    private readonly bufferRequest: BufferingDiscipline,
    private readonly rejectRequest: RejectionDiscipline,
  ) {}

  public putInBuffer(currentTime: number, request: Request): void {
    if (this.buffer.isFull) {
      const rejected = !this.buffer.isEmpty
        ? this.rejectRequest(request, this.buffer, currentTime)
        : request;
      throw new RequestRejectionError(rejected);
    }

    this.bufferRequest(request, this.buffer, currentTime);
  }
}
