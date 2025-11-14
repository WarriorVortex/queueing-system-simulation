import {InjectionToken} from '@angular/core';

export const StateStorage = new InjectionToken<Storage>(
  'STATE_STORAGE',
  {
    factory: () => localStorage
  }
);
