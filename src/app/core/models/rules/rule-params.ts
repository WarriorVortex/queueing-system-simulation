import {WritableSignal} from '@angular/core';

export type RuleParams = Record<string | symbol, unknown | WritableSignal<unknown>>;
