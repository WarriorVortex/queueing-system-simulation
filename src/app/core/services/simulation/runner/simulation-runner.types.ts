import {WritableSignal} from '@angular/core';

export interface SimulationRunnerConfig {
  interval: WritableSignal<number> | number
  onStep?: VoidFunction;
}
