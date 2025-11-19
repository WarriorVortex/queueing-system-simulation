import {InjectionToken} from '@angular/core';

export const ON_RELOAD_SIMULATION = new InjectionToken<VoidFunction[]>(
  'ON_RELOAD_SIMULATION',
  {
    factory: () => [],
  },
);

export interface SimulationParams {
  devicesNumber?: number,
  sourcesNumber?: number,
  bufferCapacity?: number,
  endTime?: number,
  autoconfig?: boolean,
}

export const SIMULATION_PARAMS = new InjectionToken<SimulationParams>(
  'DEFAULT_SIMULATION_PARAMS',
  {
    factory: () => DEFAULT_PARAMS
  }
);

const DEFAULT_PARAMS: Required<SimulationParams> = {
  devicesNumber: 3,
  sourcesNumber: 3,
  bufferCapacity: 3,
  endTime: 100,
  autoconfig: false,
};
export default DEFAULT_PARAMS;
