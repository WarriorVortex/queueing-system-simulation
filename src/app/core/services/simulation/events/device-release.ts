import {SimulationEvent} from './simulation-event';
import {Device} from '@app/models';

export class DeviceRelease extends SimulationEvent {
  constructor(
    time: number,
    public readonly device: Device
  ) {
    super(time);
  }
}
