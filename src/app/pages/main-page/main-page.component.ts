import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {SimulationMessageService, SimulationService} from '@app/services/simulation';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-main-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {
  private changeDetector = inject(ChangeDetectorRef);
  private simulationService = inject(SimulationService);
  private simulationMessageService = inject(SimulationMessageService);

  protected currentStep = this.simulationService.currentStep;
  protected currentTime = this.simulationService.currentTime;

  protected messages: string[] = [];

  constructor() {
    this.simulationService.configureSimulation();
    this.simulationService.startSimulation();
    this.simulationMessageService.message$
      .subscribe(message => {
        this.messages.push(message);
        this.changeDetector.markForCheck();
      });
  }

  protected nextStep() {
    const service = this.simulationService;
    service.processStep();
  }
}
