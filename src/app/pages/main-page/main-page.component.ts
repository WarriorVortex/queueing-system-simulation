import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  isDevMode,
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
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, filter} from 'rxjs';
import {QueryParamsService} from '@app/services/query-params';
import {IntervalParams, ServiceTimeParams} from './rule-params.types';
import SIMULATION_PARAMS, {NumericParam, SimulationParam} from './simulation-params.config';
import {EnvironmentService} from '@app/services/environment';
import {TimelineDiagramComponent} from 'src/app/components/timeline/timeline-diagram';

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
    SourcesStatsBlockComponent,
    TimelineDiagramComponent
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
  private isFinished = this.simulation.isFinished;

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

  protected usedBlocks = {
    'use_params': {
      key: 'A',
      signal: signal(true)
    },
    'use_control': {
      key: 'S',
      signal: signal(true)
    },
    'use_buffer': {
      key: 'D',
      signal: signal(true),
    },
    'use_devices': {
      key: 'F',
      signal: signal(true),
    },
    'use_diagram': {
      key: 'G',
      signal: signal(true)
    },
    'use_event_calendar': {
      key: 'H',
      signal: signal(true)
    },
    'use_source_stats': {
      key: 'J',
      signal: signal(true)
    },
    'use_summary_stats': {
      key: 'K',
      signal: signal(true)
    },
    'use_logs': {
      key: 'L',
      signal: signal(true)
    },
  } as const;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (document.activeElement?.tagName === 'INPUT') {
      return;
    }

    const pressedKey = event.key.toUpperCase();
    switch (pressedKey) {
      case 'Q':
        this.startSimulation();
        break;
      case 'W':
        this.simulateNextStep();
        break;
      case 'E':
        this.simulateAllSteps();
        break;
      case 'R':
        this.simulateNSteps(this.simulationStep());
        break;
      case 'T':
        Object.entries(this.usedBlocks)
          .forEach(([_, { signal }]) => signal.set(true))
        break;
    }
    Object.entries(this.usedBlocks)
      .forEach(([_, { key, signal }]) => {
        if (key === pressedKey) {
          signal.update(value => !value)
        }
      });
  }

  constructor() {
    this.simulationRunner.configure({ interval: this.simulationInterval });
    if (!this.environment.hasProcess('electron')) {
      this.queryParams.bind(this.reactiveParams, { parseFn: this.parseNumericParam.bind(this) });
      this.queryParams.bind(this.usedBlocksParams, { parseFn: this.parseBoolean.bind(this) });
    }

    this.initMessageReceiver();
    this.initOnSimulationEndMessage();
    this.initOnConfigEffect();
    if (isDevMode()) {
      this.initStatsLogging();
    }
  }

  ngOnDestroy() {
    this.simulationRunner.stop();
  }

  private parseNumericParam(value: string, key: string) {
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

  private parseBoolean(value: string): boolean {
    return value === 'true';
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

  private get usedBlocksParams(): Record<string, WritableSignal<boolean>> {
    const entries = Object.entries(this.usedBlocks)
      .map(([param, { signal }]) => ([param, signal]));
    return Object.fromEntries(entries);
  }

  private initStatsLogging() {
    let count = 0;
    toObservable(this.simulation.isFinished).pipe(
      filter(value => value),
      takeUntilDestroyed()
    ).subscribe(() => {
      console.table({
        '№ эксперимента': ++count,
        'Приборы': this.devicesNumber(),
        'Интенсивность': this.serviceTimeParams.lambda(),
        'Размер буфера': this.bufferCapacity(),
        'Процент отказов': this.simulationStats.summaryStats().rejectionRate * 100
      });
    })
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

  protected get logsShowNumber() {
    return Math.min(7, this._messages.length);
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
    return this.isFinished()
      ? this._messages
      : [...this._messages];
  }

  protected startSimulation() {
    this.simulation.configure();
    this.simulation.start();
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

  protected simulateNSteps(n: number) {
    this.runWithErrorHandling(() => this.simulationRunner.runNSteps(n));
  }

  protected simulateAllSteps() {
    this.runWithErrorHandling(() => this.simulationRunner.runAllSteps());
  }
}
