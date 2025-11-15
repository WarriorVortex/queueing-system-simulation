import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {SimulationMessageService, SimulationService} from '@app/services/simulation';
import {FormsModule} from '@angular/forms';

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

  constructor() {
    this.simulation.configureSimulation();
    this.simulationMessage
      .subscribe(message => {
        this.messages.push(message);
        this.changeDetector.markForCheck();
      });
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
