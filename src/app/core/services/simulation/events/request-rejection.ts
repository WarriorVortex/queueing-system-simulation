import {SimulationEvent} from './simulation-event';
import {Request} from '@app/models';

export class RequestRejection extends SimulationEvent {
  constructor(
    time: number,
    public readonly rejected: Request
  ) {
    super(time);
  }
}
