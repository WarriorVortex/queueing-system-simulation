import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, HostListener,
  inject,
  OnDestroy,
  signal,
  WritableSignal
} from '@angular/core';
import {
  hasEventType,
  SimulationMessageService,
  SimulationRunnerError,
  SimulationRunnerService,
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
import {debounceTime, filter} from 'rxjs';
import {IntervalParams, ServiceTimeParams} from '@app/pages/main-page/rule-params.types';
import {QueryParamsService} from '@app/services/query-params';
import SIMULATION_PARAMS, {NumericParam, SimulationParam} from './simulation-params.config';
import {EnvironmentService} from '@app/services/environment';

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
  private queryParams = inject(QueryParamsService);
  private environment = inject(EnvironmentService);

  private simulation = inject(SimulationService);
  private simulationMessage = inject(SimulationMessageService);
  private simulationStats = inject(SimulationStatsService);
  private simulationRunner = inject(SimulationRunnerService);

  protected currentStep = this.simulation.currentStep;
  protected currentTime = this.simulation.currentTime;
  protected isStarted = this.simulation.isStarted;

  private _messages: string[] = [];

  protected simulationStep = signal(10);
  protected simulationInterval = signal(0);

  protected simulationEndTime = this.simulation.simulationEndTime;
  protected sourcesNumber = this.simulation.sourcesNumber;
  protected devicesNumber = this.simulation.devicesNumber;
  protected bufferCapacity = this.simulation.bufferCapacity;
  protected intervalParams = inject(REQUEST_INTERVAL_RULE_PARAMS) as unknown as IntervalParams;
  protected serviceTimeParams = inject(SERVICE_TIME_RULE_PARAMS) as unknown as ServiceTimeParams;

  private readonly numericParams = SIMULATION_PARAMS;

  constructor() {
    this.simulationRunner.configure({ interval: this.simulationInterval });
    if (!this.environment.hasProcess('electron')) {
      this.queryParams.bind(this.reactiveParams, {parseFn: this.parseParam.bind(this)});
    }

    this.initMessageReceiver();
    this.initOnSimulationEndMessage();
    this.initOnConfigEffect();
  }

  ngOnDestroy() {
    this.simulationRunner.stop();
  }

  private parseParam(value: string, key: string) {
    const {
      min = -Infinity,
      max = Infinity,
      isInteger = false,
    } = this.numericParams[key as SimulationParam] as NumericParam;
    const parseNumber = isInteger
      ? Number.parseInt
      : Number.parseFloat;
    const result = parseNumber(value);
    return Math.min(Math.max(result, min), max);
  }

  private get reactiveParams(): Record<SimulationParam, WritableSignal<number>> {
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

  private initMessageReceiver() {
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

  private initOnConfigEffect() {
    this.simulation.onConfig$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.simulationRunner.stop();
      this.simulationStats.reload();
      this._messages = [];
      this._messages.push(`Параметры моделирования заданы`);
      this._messages.push(`Старт моделирования`);
    });
  }

  protected get devices() {
    return this.simulation.devices;
  }

  protected get sources() {
    return this.simulation.sources;
  }

  protected get bufferCells() {
    const { queue = [] } = this.simulation.buffer ?? {};
    return [...queue];
  }

  protected get messages() {
    return [...this._messages];
  }

  protected startSimulation() {
    this.simulation.configureSimulation();
    this.simulation.startSimulation();
  }

  private runWithErrorHandling(func: VoidFunction) {
    try {
      func();
    } catch (err) {
      if (err instanceof SimulationRunnerError) {
        switch (err.cause) {
          case 'not-started':
            alert('Симуляция не запущена!');
            break;
          case 'finished':
            alert('Симуляция была завершена!');
            break;
        }
      }
    }
  }

  protected simulateNextStep() {
    this.runWithErrorHandling(() => this.simulationRunner.processNextStep());
  }

  protected simulateNSteps(n: number = 1) {
    this.runWithErrorHandling(() => this.simulationRunner.runNSteps(n));
  }

  protected simulateAllSteps() {
    this.runWithErrorHandling(() => this.simulationRunner.runAllSteps());
  }
}
