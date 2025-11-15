import {InjectionToken} from '@angular/core';
import DefaultFormatMessage from './default-format-message.config';
import {
  BufferingEvent,
  DeviceRelease, RequestAppearance,
  RequestGeneration,
  RequestRejection,
  ServiceStart, SimulationEnd
} from '@app/services/simulation';

export interface FormatMessageConfig {
  'buffering': (event: BufferingEvent) => string,
  'requestGeneration': (event: RequestGeneration) => string,
  'rejection': (event: RequestRejection) => string,
  'serviceStart': (event: ServiceStart) => string,
  'deviceRelease': (event: DeviceRelease) => string,
  'requestAppearance': (event: RequestAppearance) => string,
  'simulationEnd': (event: SimulationEnd) => string,
}

export const FORMAT_MESSAGE_CONFIG = new InjectionToken<FormatMessageConfig>(
  'FORMAT_MESSAGE_CONFIG',
  {
    factory: () => DefaultFormatMessage
  }
);
