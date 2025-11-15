import {RequestAppearance, SimulationEvent, SpecialSimulationEvent} from './events';

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

  static isSpecialEvent(event: SimulationEvent): event is SpecialSimulationEvent {
    return event instanceof SpecialSimulationEvent;
  }
}

export const {
  compareEvents,
  isSpecialEvent
} = SimulationUtils;
