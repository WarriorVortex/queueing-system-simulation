import {ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, signal} from '@angular/core';
import {SimulationMessageService, SimulationService} from '@app/services/simulation';
import {FormsModule} from '@angular/forms';
import {REQUEST_INTERVAL_RULE_PARAMS, SERVICE_TIME_RULE_PARAMS} from '@app/services/entity';
import {BufferBlockComponent, DevicesBlockComponent, EventsCalendarComponent, LogBlockComponent} from '@app/components';

@Component({
  selector: 'app-main-page',
  imports: [
    FormsModule,
    EventsCalendarComponent,
    LogBlockComponent,
    EventsCalendarComponent,
    BufferBlockComponent,
    DevicesBlockComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {
  private changeDetector = inject(ChangeDetectorRef);
  private simulation = inject(SimulationService);
  private simulationMessage = inject(SimulationMessageService);

  protected currentStep = this.simulation.currentStep;
  protected currentTime = this.simulation.currentTime;

  private _messages: string[] = [];

  protected simulationStep = signal(10);

  protected simulationInterval = signal(0);
  protected simulationEndTime = this.simulation.simulationEndTime;
  protected sourcesNumber = this.simulation.sourcesNumber;
  protected devicesNumber = this.simulation.devicesNumber;
  protected bufferCapacity = this.simulation.bufferCapacity;
  protected intervalParams = inject(REQUEST_INTERVAL_RULE_PARAMS) as { a: number, b: number };
  protected serviceTimeParams = inject(SERVICE_TIME_RULE_PARAMS) as { lambda: number };

  protected isStarted = this.simulation.isStarted;
  protected isEnded = this.simulation.isEnded;

  constructor() {
    this.initChangeOnEvent();
  }

  private initChangeOnEvent() {
    this.simulationMessage
      .subscribe(message => {
        this._messages.push(message);
        this.changeDetector.markForCheck();
      });
  }

  protected get devices() {
    return this.simulation.devices;
  }

  protected get sources() {
    return this.simulation.sources;
  }

  protected get bufferCells() {
    return [...this.simulation.buffer.cells];
  }

  protected get messages() {
    return [...this._messages];
  }

  protected startSimulation() {
    this.simulation.configureSimulation();
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
    this.simulation.fullSimulate(delay);
  }

  protected simulateNSteps(n: number, delay?: number) {
    this.checkStepAvailable();
    this.simulation.nextNSteps(n, delay);
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
