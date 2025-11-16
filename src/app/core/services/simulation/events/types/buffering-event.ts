import {SimulationEvent} from './simulation-event';
import {Request} from '@app/models';
import EventMetadata from '../metadata';

export class BufferingEvent extends SimulationEvent {
  constructor(
    time: number,
    public readonly request: Request,
  ) {
    super(time);
  }
}

EventMetadata.writeType(BufferingEvent, 'buffering')
