import {
  BufferingEvent,
  DeviceRelease, RequestAppearance,
  RequestGeneration,
  RequestRejection,
  ServiceStart, SimulationEnd, SimulationEventType
} from '@app/services/simulation';

type EventMap = {
  buffering: BufferingEvent;
  requestGeneration: RequestGeneration;
  rejection: RequestRejection;
  serviceStart: ServiceStart;
  deviceRelease: DeviceRelease;
  requestAppearance: RequestAppearance;
  simulationEnd: SimulationEnd;
};

export type FormatMessageConfig = {
  [K in SimulationEventType]: (event: EventMap[K]) => string;
};
