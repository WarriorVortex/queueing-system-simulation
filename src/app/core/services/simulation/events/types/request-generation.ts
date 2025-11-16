import {SimulationEvent} from './simulation-event';
import {Request} from '@app/models';
import EventMetadata from '../metadata';

export class RequestGeneration extends SimulationEvent {
  constructor(
    time: number,
    public readonly generated: Request
  ) {
    super(time);
  }
}

EventMetadata.writeType(RequestGeneration, 'requestGeneration');
