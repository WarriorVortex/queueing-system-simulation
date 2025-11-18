import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {SimulationStatsService} from '@app/services/simulation';
import {DecimalPipe, PercentPipe} from '@angular/common';

@Component({
  selector: 'app-summary-stats-block',
  imports: [
    DecimalPipe,
    PercentPipe
  ],
  templateUrl: './summary-stats-block.component.html',
  styleUrl: './summary-stats-block.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStatsBlockComponent {
  private statsService = inject(SimulationStatsService);
  protected summaryStats = this.statsService.summaryStats;
}
