import {SimulationEvent} from './simulation-event';
import {Request} from '@app/models';

export class RequestGeneration extends SimulationEvent {
  constructor(
    time: number,
    public readonly generated: Request
  ) {
    super(time);
  }
}
