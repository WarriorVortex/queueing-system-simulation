import {Request} from '@app/models'
import {SpecialSimulationEvent} from "./special-simulation-event";

export class RequestAppearance extends SpecialSimulationEvent {
  constructor(
    time: number,
    public readonly request: Request
  ) {
    super(time);
  }
}
