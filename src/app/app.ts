import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SimulationService} from '@app/services/simulation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private simulationService = inject(SimulationService);

  constructor() {
    this.simulationService.startSimulation();
    while (!this.simulationService.isSimulationEnd()) {
      this.simulationService.processStep();
    }
    console.log(this.simulationService.currentTime());
    console.log(this.simulationService.rejectionQueue.length);
  }

  protected nextStep() {
    const service = this.simulationService;
    service.processStep();
    console.log(service.currentTime());
    console.log([...service.eventQueue]);
  }
}
