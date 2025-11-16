import {inject, Injectable} from '@angular/core';
import {SimulationService} from '../simulation.service';
import {filter, map, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {getEventType, SimulationEvent,} from '../events';
import {FORMAT_MESSAGE_CONFIG} from '@app/services/simulation';

@Injectable({
  providedIn: 'root'
})
export class SimulationMessageService extends Observable<string> {
  private simulation = inject(SimulationService);
  private readonly formatMessage = inject(FORMAT_MESSAGE_CONFIG);

  constructor() {
    super(subscriber => {
      const subscription = this.simulation.simulationEvent$.pipe(
        map(this.formMessage.bind(this)),
        filter(message => message !== undefined),
        takeUntilDestroyed()
      ).subscribe(subscriber);

      return subscription.unsubscribe;
    });
  }

  private formMessage(event: SimulationEvent): string | undefined {
    const eventType = getEventType(event);
    if (eventType === undefined) {
      return undefined;
    }
    return this.formatMessage[eventType]?.(event as any);
  }
}
