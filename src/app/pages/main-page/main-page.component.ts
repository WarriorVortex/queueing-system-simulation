import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, signal} from '@angular/core';
import {
  hasEventType,
  SimulationMessageService,
  SimulationService,
  SimulationStatsService
} from '@app/services/simulation';
import {FormsModule} from '@angular/forms';
import {REQUEST_INTERVAL_RULE_PARAMS, SERVICE_TIME_RULE_PARAMS} from '@app/services/entity';
import {
  BufferBlockComponent,
  DevicesBlockComponent,
  EventsCalendarComponent,
  LogBlockComponent,
  SourcesStatsBlockComponent,
  SummaryStatsBlockComponent
} from '@app/components';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, filter, Subscription} from 'rxjs';
import {IntervalParams, ServiceTimeParams} from '@app/pages/main-page/rule-params.types';
import {QueryParamsService} from '@app/services/query-params';

@Component({
  selector: 'app-main-page',
  imports: [
    FormsModule,
    EventsCalendarComponent,
    LogBlockComponent,
    EventsCalendarComponent,
    BufferBlockComponent,
    DevicesBlockComponent,
    SummaryStatsBlockComponent,
    SourcesStatsBlockComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnDestroy {
  private changeDetector = inject(ChangeDetectorRef);
  private simulation = inject(SimulationService);
  private simulationMessage = inject(SimulationMessageService);
  private simulationStats = inject(SimulationStatsService);
  private queryParams = inject(QueryParamsService);

  protected currentStep = this.simulation.currentStep;
  protected currentTime = this.simulation.currentTime;

  private _messages: string[] = [];

  protected simulationStep = signal(10);

  protected simulationInterval = signal(0);
  protected simulationEndTime = this.simulation.simulationEndTime;
  protected sourcesNumber = this.simulation.sourcesNumber;
  protected devicesNumber = this.simulation.devicesNumber;
  protected bufferCapacity = this.simulation.bufferCapacity;
  protected intervalParams = inject(REQUEST_INTERVAL_RULE_PARAMS) as unknown as IntervalParams;
  protected serviceTimeParams = inject(SERVICE_TIME_RULE_PARAMS) as unknown as ServiceTimeParams;

  protected isStarted = this.simulation.isStarted;
  protected isEnded = this.simulation.isEnded;
  private subscription: Subscription | undefined;

  constructor() {
    this.initChangeOnEvent();
    this.initOnSimulationEndMessage();
    this.queryParams.bind(this.reactiveParams, { write: true, read: true, parseFn: Number });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private get reactiveParams() {
    return {
      'interval': this.simulationInterval,
      'end_time': this.simulationEndTime,
      'sources_number': this.sourcesNumber,
      'devices_number': this.devicesNumber,
      'buffer_capacity': this.bufferCapacity,
      'a': this.intervalParams.a,
      'b': this.intervalParams.b,
      'lambda': this.serviceTimeParams.lambda,
    };
  }

  private initChangeOnEvent() {
    this.simulationMessage.pipe(
      takeUntilDestroyed()
    ).subscribe(message => {
      this._messages.push(message);
      this.changeDetector.markForCheck();
    });
  }

  private initOnSimulationEndMessage() {
    this.simulation.pipe(
      filter(event => hasEventType(event, 'simulationEnd')),
      debounceTime(200),
      takeUntilDestroyed()
    ).subscribe(() => alert('Симуляция была завершена!'));
  }

  protected get devices() {
    return this.simulation.devices;
  }

  protected get sources() {
    return this.simulation.sources;
  }

  protected get bufferCells() {
    const { buffer } = this.simulation;
    return buffer?.cells ?? [];
  }

  protected get messages() {
    return [...this._messages];
  }

  protected startSimulation() {
    this.simulation.configureSimulation();
    this.subscription?.unsubscribe();
    this.simulationStats.reload();
    this._messages = [];
    this._messages.push(`Параметры моделирования заданы`);
    this._messages.push(`Старт моделирования`);
    this.simulation.startSimulation();
  }

  protected simulateNextStep() {
    this.checkStepAvailable();
    this.simulation.nextStep();
  }

  protected simulateAllSteps(delay?: number) {
    this.checkStepAvailable();
    this.subscription?.unsubscribe();
    this.subscription = this.simulation.fullSimulate(delay);
  }

  protected simulateNSteps(n: number, delay?: number) {
    this.checkStepAvailable();
    this.subscription?.unsubscribe();
    this.subscription = this.simulation.nextNSteps(n, delay);
  }

  private checkStepAvailable() {
    if (!this.isStarted()) {
      alert('Симуляция не запущена!');
      throw new Error('Simulation not started');
    }
    if (this.isEnded()) {
      alert('Симуляция была завершена!');
      throw new Error('Simulation has already finished');
    }
  }
}
