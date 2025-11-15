import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SimulationMessageService, SimulationService} from '@app/services/simulation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private simulationService = inject(SimulationService);
  private simulationMessageService = inject(SimulationMessageService);
  protected currentStep = this.simulationService.currentStep;

  constructor() {
    this.simulationService.configureSimulation();
    this.simulationService.startSimulation();
    this.simulationMessageService.message$.subscribe(console.log);
  }

  protected nextStep() {
    const service = this.simulationService;
    service.processStep();
  }
}
