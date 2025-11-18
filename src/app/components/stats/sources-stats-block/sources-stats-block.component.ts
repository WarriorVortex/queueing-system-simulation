import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {SimulationStatsService} from '@app/services/simulation';
import {PercentPipe} from '@angular/common';

@Component({
  selector: 'app-sources-stats-block',
  imports: [
    PercentPipe
  ],
  templateUrl: './sources-stats-block.component.html',
  styleUrl: './sources-stats-block.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesStatsBlockComponent {
  private statsService = inject(SimulationStatsService);
  protected sourcesStats = this.statsService.sourcesStats;
  protected sourceSummaryStats = this.statsService.sourceSummaryStats;
}
