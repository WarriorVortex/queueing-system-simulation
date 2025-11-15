import {SimulationEvent} from './simulation-event';
import {Device} from '@app/models';

export class ServiceStart extends SimulationEvent {
  constructor(
    time: number,
    public readonly device: Device,
  ) {
    super(time);
  }
}
