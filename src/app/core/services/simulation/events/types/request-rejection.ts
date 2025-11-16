import {SimulationEvent} from './simulation-event';
import {Request} from '@app/models';
import EventMetadata from '../metadata';

export class RequestRejection extends SimulationEvent {
  constructor(
    time: number,
    public readonly rejected: Request
  ) {
    super(time);
  }
}

EventMetadata.writeType(RequestRejection, 'rejection');
