import {inject, Injectable} from '@angular/core';
import {SimulationService} from '../simulation.service';
import {map, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  BufferingEvent,
  DeviceRelease,
  RequestAppearance,
  RequestGeneration,
  RequestRejection,
  ServiceStart,
  SimulationEvent,
} from '../events';
import {Request} from '@app/models';
import {isSpecialEvent} from '@app/services/simulation';

@Injectable({
  providedIn: 'root'
})
export class SimulationMessageService {
  private simulationService = inject(SimulationService);
  private currentStep = this.simulationService.currentStep;
  public readonly message$: Observable<string>;

  constructor() {
    this.message$ = this.simulationService.simulationEvent$.pipe(
      map(this.formMessage.bind(this)),
      takeUntilDestroyed()
    );
  }

  private formMessage(event: SimulationEvent): string {
    let message = this.formMessageText(event);
    if (isSpecialEvent(event)) {
      const step = this.currentStep();
      message =  `Шаг ${step}: ${message}`;
    }
    return message;
  }

  private formMessageText(event: SimulationEvent): string {
    if (event instanceof BufferingEvent) {
      const { request } = event;
      return `Заявка ${this.formatId(request)} поставлена в буфер`;
    }
    if (event instanceof RequestGeneration) {
      const { generated } = event;
      return `Заявка ${this.formatId(generated)} была сгенерирована (поступит при t = ${generated.arrivalTime})`;
    }
    if (event instanceof RequestRejection) {
      const { rejected } = event;
      return `Заявке ${this.formatId(rejected)} было отказано в обслуживании`;
    }
    if (event instanceof ServiceStart) {
      const { device } = event;
      let message = `Заявка ${this.formatId(device.servicedRequest!)} поступила в на прибор ${device.id}`;
      message += `(будет обслужена к t = ${device.serviceEndTime})`;
      return message;
    }
    if (event instanceof DeviceRelease) {
      const { device } = event;
      return `Прибор ${device.id} был освобождён`;
    }
    if (event instanceof RequestAppearance) {
      const { request } = event;
      return `Заявка ${this.formatId(request)} поступила от источника`;
    }
    return `Конец моделирования (t = ${event.time})`
  }

  private formatId(request: Request) {
    const { id, sourceId } = request;
    return `${sourceId}-${id}`;
  }
}
