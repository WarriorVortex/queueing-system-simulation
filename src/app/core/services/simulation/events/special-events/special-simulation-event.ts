import {SimulationEvent} from '../simulation-event';

export class SpecialSimulationEvent extends SimulationEvent {
  public isPast: boolean = false;
}
