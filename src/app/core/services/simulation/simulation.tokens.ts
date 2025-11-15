import {InjectionToken} from '@angular/core';

export const DEFAULT_DEVICES_NUMBER = new InjectionToken<number>(
  'DEFAULT_DEVICES_NUMBER',
  {
    factory: () => 3
  }
);

export const DEFAULT_SOURCES_NUMBER = new InjectionToken<number>(
  'DEFAULT_SOURCES_NUMBER',
  {
    factory: () => 3
  }
);

export const DEFAULT_BUFFER_CAPACITY = new InjectionToken<number>(
  'DEFAULT_BUFFER_CAPACITY',
  {
    factory: () => 3
  }
);

export const DEFAULT_SIMULATION_END_TIME = new InjectionToken<number>(
  'DEFAULT_SIMULATION_END_TIME',
  {
    factory: () => 100
  }
);

export const USE_AUTOCONFIGURATION = new InjectionToken<boolean>(
  'USE_AUTOCONFIGURATION',
  {
    factory: () => false
  }
);
