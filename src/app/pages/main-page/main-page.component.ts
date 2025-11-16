import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {SimulationMessageService, SimulationService} from '@app/services/simulation';
import {FormsModule} from '@angular/forms';
import {REQUEST_INTERVAL_RULE_PARAMS, SERVICE_TIME_RULE_PARAMS} from '@app/services/entity';

@Component({
  selector: 'app-main-page',
  imports: [
    FormsModule
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

  protected messages: string[] = [];

  protected simulationStep = signal(10);
  protected sourcesNumber = this.simulation.sourcesNumber;
  protected devicesNumber = this.simulation.devicesNumber;
  protected bufferCapacity = this.simulation.bufferCapacity;
  protected intervalParams = inject(REQUEST_INTERVAL_RULE_PARAMS) as { a: number, b: number };
  protected serviceTimeParams = inject(SERVICE_TIME_RULE_PARAMS) as { lambda: number };

  constructor() {
    this.simulationMessage
      .subscribe(message => {
        this.messages.push(message);
        this.changeDetector.markForCheck();
      });
  }

  protected startSimulation() {
    this.messages.push(`Параметры моделирования заданы`);
    this.simulation.configureSimulation();
    this.messages.push(`Старт моделирования`);
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
