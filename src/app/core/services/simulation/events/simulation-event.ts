export class SimulationEvent {
  public isPast: boolean = false;

  constructor(
    public readonly time: number
  ) {}
}
