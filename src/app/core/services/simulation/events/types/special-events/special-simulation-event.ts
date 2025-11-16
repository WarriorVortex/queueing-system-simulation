import {SimulationEvent} from '../simulation-event';

export abstract class SpecialSimulationEvent extends SimulationEvent {
  public isPast: boolean = false;
  public step: number | undefined;
}
