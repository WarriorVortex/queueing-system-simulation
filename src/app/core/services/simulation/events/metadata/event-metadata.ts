import 'reflect-metadata';
import { SimulationEvent } from '../types/simulation-event';
import {SimulationEventType} from '../event-type';

export default class EventMetadata {
  private static readonly EVENT_TYPE_METADATA = 'metadata:event-type';

  static writeType(eventClass: any, type: SimulationEventType): void {
    Reflect.defineMetadata(EventMetadata.EVENT_TYPE_METADATA, type, eventClass);
  }

  static readType(eventObj: SimulationEvent | Function): SimulationEventType | undefined {
    const constructor = typeof eventObj !== 'function'
      ? eventObj.constructor
      : eventObj;
    return Reflect.getOwnMetadata(EventMetadata.EVENT_TYPE_METADATA, constructor);
  }
}

export const {
  writeType: writeEventType,
  readType: readEventType,
} = EventMetadata;
