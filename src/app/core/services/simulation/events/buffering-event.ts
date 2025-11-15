import {SimulationEvent} from './simulation-event';
import {Request} from '@app/models';

export class BufferingEvent extends SimulationEvent {
  constructor(
    time: number,
    public readonly request: Request,
  ) {
    super(time);
  }
}
