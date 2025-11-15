import {inject, Injectable} from '@angular/core';
import {SimulationService} from '../simulation.service';
import {map, Observable, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  BufferingEvent,
  DeviceRelease,
  RequestAppearance,
  RequestGeneration,
  RequestRejection,
  ServiceStart,
  SimulationEnd,
  SimulationEvent,
} from '../events';
import {FORMAT_MESSAGE_CONFIG} from '@app/services/simulation';

@Injectable({
  providedIn: 'root'
})
export class SimulationMessageService {
  private simulationService = inject(SimulationService);
  private readonly formatMessage = inject(FORMAT_MESSAGE_CONFIG);
  public readonly message$: Observable<string>;

  constructor() {
    this.message$ = this.simulationService.simulationEvent$.pipe(
      map(this.formMessage.bind(this)),
      takeUntilDestroyed()
    );
  }

  private formMessage(event: SimulationEvent): string {
    if (event instanceof BufferingEvent) {
      return this.formatMessage['buffering'](event);
    }
    if (event instanceof RequestGeneration) {
      return this.formatMessage['requestGeneration'](event);
    }
    if (event instanceof RequestRejection) {
      return this.formatMessage['rejection'](event);
    }
    if (event instanceof ServiceStart) {
      return this.formatMessage['serviceStart'](event);
    }
    if (event instanceof DeviceRelease) {
      return this.formatMessage['deviceRelease'](event);
    }
    if (event instanceof RequestAppearance) {
      return this.formatMessage['requestAppearance'](event);
    }
    if (event instanceof SimulationEnd) {
      return this.formatMessage['simulationEnd'](event);
    }
    return `Неизвестное событие: ${JSON.stringify(event)}`;
  }
}
