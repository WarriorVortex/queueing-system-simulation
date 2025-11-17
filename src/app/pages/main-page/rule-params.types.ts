import {WritableSignal} from '@angular/core';

export interface IntervalParams {
  a: WritableSignal<number>,
  b: WritableSignal<number>,
}

export interface ServiceTimeParams {
  lambda: WritableSignal<number>,
}
