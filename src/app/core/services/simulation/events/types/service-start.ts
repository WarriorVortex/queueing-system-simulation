import {SimulationEvent} from './simulation-event';
import {Device} from '@app/models';
import EventMetadata from '../metadata';

export class ServiceStart extends SimulationEvent {
  constructor(
    time: number,
    public readonly device: Device,
  ) {
    super(time);
  }
}

EventMetadata.writeType(ServiceStart, 'serviceStart');
