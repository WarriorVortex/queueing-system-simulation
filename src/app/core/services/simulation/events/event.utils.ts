import {SimulationEventType} from './event-type';
import {
  BufferingEvent,
  DeviceRelease,
  RequestAppearance,
  RequestGeneration,
  RequestRejection,
  ServiceStart,
  SimulationEnd,
  SimulationEvent, SpecialSimulationEvent,
} from './types';
import {Device, Request} from '@app/models';
import EventMetadata from './metadata';

export default class EventUtils {
  private static readonly EventFactory = {
    'buffering': ([ time, request ]) => new BufferingEvent(time, request),
    'requestGeneration': ([ time, generated ]) => new RequestGeneration(time, generated),
    'rejection': ([ time, rejected ]) => new RequestRejection(time, rejected),
    'serviceStart': ([ time, device ]) => new ServiceStart(time, device),
    'deviceRelease': ([ time, device ]) => new DeviceRelease(time, device),
    'requestAppearance': ([ time, device ]) => new RequestAppearance(time, device),
    'simulationEnd': ([ time  ]) => new SimulationEnd(time),
  } satisfies Record<SimulationEventType, (...args: any[]) => SimulationEvent>;

  static create(type: 'buffering', time: number, request: Request): BufferingEvent;
  static create(type: 'requestGeneration', time: number, generated: Request): RequestGeneration;
  static create(type: 'rejection', time: number, rejected: Request): RequestRejection;
  static create(type: 'serviceStart', time: number, device: Device): ServiceStart;
  static create(type: 'deviceRelease', time: number, device: Device): DeviceRelease;
  static create(type: 'requestAppearance', time: number, request: Request): RequestAppearance;
  static create(type: 'simulationEnd', time: number): SimulationEnd;

  static create(type: SimulationEventType, time: number, ...params: unknown[]): SimulationEvent {
    return EventUtils.EventFactory[type]([time, ...params]);
  }

  static hasType(event: SimulationEvent, type: 'buffering'): event is BufferingEvent;
  static hasType(event: SimulationEvent, type: 'requestGeneration'): event is RequestGeneration;
  static hasType(event: SimulationEvent, type: 'rejection'): event is RequestRejection;
  static hasType(event: SimulationEvent, type: 'serviceStart'): event is ServiceStart;
  static hasType(event: SimulationEvent, type: 'deviceRelease'): event is DeviceRelease;
  static hasType(event: SimulationEvent, type: 'requestAppearance'): event is RequestAppearance;
  static hasType(event: SimulationEvent, type: 'simulationEnd'): event is SimulationEnd;

  static hasType(event: SimulationEvent, type: SimulationEventType): boolean {
    return EventUtils.getType(event) === type;
  }

  static getType(event: SimulationEvent): SimulationEventType | undefined {
    return EventMetadata.readType(event);
  }

  static compareEvents(first: SimulationEvent, second: SimulationEvent) {
    const diff = first.time - second.time;
    if (diff !== 0) {
      return diff;
    }
    if (first instanceof RequestAppearance) {
      return -1;
    }
    if (second instanceof RequestAppearance) {
      return 1;
    }
    return 0;
  }

  static isSpecialEvent(event: SimulationEvent): event is SpecialSimulationEvent {
    return event instanceof SpecialSimulationEvent;
  }
}

export const {
  create: createEvent,
  hasType: hasEventType,
  getType: getEventType,
  compareEvents,
  isSpecialEvent
} = EventUtils;
