import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {SimulationMessageService, SimulationService} from '@app/services/simulation';
import {FormsModule} from '@angular/forms';
import {REQUEST_INTERVAL_RULE_PARAMS, SERVICE_TIME_RULE_PARAMS} from '@app/services/entity';
import {EventsCalendarComponent, LogBlockComponent} from '@app/components';

@Component({
  selector: 'app-main-page',
  imports: [
    FormsModule,
    EventsCalendarComponent,
    LogBlockComponent,
    EventsCalendarComponent
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

  private readonly _messages: string[] = [];

  protected simulationStep = signal(10);
  protected simulationEndTime = this.simulation.simulationEndTime;
  protected sourcesNumber = this.simulation.sourcesNumber;
  protected devicesNumber = this.simulation.devicesNumber;
  protected bufferCapacity = this.simulation.bufferCapacity;
  protected intervalParams = inject(REQUEST_INTERVAL_RULE_PARAMS) as { a: number, b: number };
  protected serviceTimeParams = inject(SERVICE_TIME_RULE_PARAMS) as { lambda: number };

  protected isConfigured = this.simulation.isConfigured;

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
    return this.isConfigured()
      ? this.simulation.devices
      : [];
  }

  protected get sources() {
    return this.isConfigured()
      ? this.simulation.sources
      : [];
  }

  protected get messages() {
    return [...this._messages];
  }

  protected startSimulation() {
    this.simulation.configureSimulation();
    this._messages.push(`Параметры моделирования заданы`);
    this._messages.push(`Старт моделирования`);
    this.simulation.startSimulation();
  }

  protected simulateNextStep() {
    this.simulation.processStep();
  }

  protected simulateAllSteps() {
    this.simulation.processAllSteps();
  }

  protected simulateNSteps(n: number) {
    this.simulation.processNSteps(n);
  }
}
