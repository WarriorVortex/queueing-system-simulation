import {RequestAppearance, SimulationEvent} from './events';

export default class SimulationUtils {
  private constructor() {}

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
}

export const {
  compareEvents
} = SimulationUtils;
