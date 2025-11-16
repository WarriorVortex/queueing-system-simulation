import {Device} from '@app/models';
import {SpecialSimulationEvent} from './special-simulation-event';
import EventMetadata from '../../metadata';

export class DeviceRelease extends SpecialSimulationEvent {
  constructor(
    time: number,
    public readonly device: Device
  ) {
    super(time);
  }
}

EventMetadata.writeType(DeviceRelease, 'deviceRelease');
