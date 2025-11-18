export type SimulationErrorCause = 'not-started' | 'finished';

export interface SimulationErrorOptions extends ErrorOptions {
  cause: SimulationErrorCause;
}

export class SimulationRunnerError extends Error {
  override readonly cause: SimulationErrorCause;

  constructor(message: string, options: SimulationErrorOptions) {
    super(message, options);
    this.cause = options.cause;
  }
}
