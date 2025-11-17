import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {SimulationService} from '../simulation.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Source} from '@app/models';
import {SourceStats, SourceSummaryStats, SummaryStats} from './simulation-stats.types';
import {hasEventType, SimulationEvent} from '@app/services/simulation';

type FlatSourceStats = Omit<SourceStats, 'sourceId' | 'rejectionRate'>;
const DEFAULT_STATS: FlatSourceStats = {
  totalGenerated: 0,
  totalServiced: 0,
  totalRejected: 0
}

@Injectable({
  providedIn: 'root'
})
export class SimulationStatsService {
  private simulation = inject(SimulationService);

  private sources!: Source[];
  private readonly indexedSourcesStats = new Map<number, WritableSignal<FlatSourceStats>>();

  private readonly indexedServiceStarts = new Map<number, number>();
  private readonly summaryServiceTime = signal(0);
  private readonly currentTime = this.simulation.currentTime;

  public readonly sourcesStats: Signal<SourceStats[]>;
  public readonly sourceSummaryStats: Signal<SourceSummaryStats>;
  public readonly summaryStats: Signal<SummaryStats>;

  constructor() {
    this.reload();
    this.initEventEffect();
    this.sourcesStats = this.computeSourcesStats();
    this.sourceSummaryStats = this.computeSourceSummaryStats();
    this.summaryStats = this.computeSummaryStats();
  }

  private initEventEffect() {
    this.simulation.pipe(
      takeUntilDestroyed()
    ).subscribe(event => {
      if (hasEventType(event, 'serviceStart')) {
        const { time, device: { id } } = event;
        this.indexedServiceStarts.set(id, time);
        return;
      }
      if (hasEventType(event, 'deviceRelease')) {
        const { time, device: { id } } = event;
        const serviceStart = this.indexedServiceStarts.get(id)!;
        const serviceTime = time - serviceStart;
        this.summaryServiceTime.update(value => value + serviceTime);
      }
      const sourceId = this.getSourceId(event);
      if (!sourceId) {
        return;
      }
      this.indexedSourcesStats.get(sourceId)
        ?.update(value => this.modifyStatsWithEvent(value, event));
    });
  }

  private computeSummaryStats(): Signal<SummaryStats> {
    return computed(() => {
      const { totalServiced, rejectionRate } = this.sourceSummaryStats();
      const summaryServiceTime = this.summaryServiceTime();
      const averageServiceTime = summaryServiceTime / totalServiced;
      const flowIntensity = 1 / averageServiceTime;
      const devicesWorkload = summaryServiceTime / this.currentTime();

      return {
        averageServiceTime,
        flowIntensity,
        rejectionRate,
        devicesWorkload
      };
    });
  }

  private computeSourcesStats(): Signal<SourceStats[]> {
    return computed(() =>
      [...this.indexedSourcesStats.entries()]
        .map(([sourceId, stats]) => ({ sourceId, ...stats() }))
        .map(stats => {
          const { totalRejected, totalGenerated } = stats;
          const rejectionRate = totalRejected / totalGenerated;
          return { ...stats, rejectionRate };
        })
    );
  }

  private computeSourceSummaryStats(): Signal<SourceSummaryStats> {
    return computed(() => {
      const stats = [...this.indexedSourcesStats.values()]
        .map(stats => ({ ...stats()}))
        .reduce(this.sumSourceStats.bind(this), DEFAULT_STATS);
      const { totalGenerated, totalRejected } = stats;
      const rejectionRate = totalRejected / totalGenerated;
      return { ...stats, rejectionRate };
    });
  }

  private sumSourceStats(first: FlatSourceStats, second: FlatSourceStats): FlatSourceStats {
    let { totalServiced, totalGenerated, totalRejected } = first;
    totalServiced += second.totalServiced;
    totalGenerated += second.totalGenerated;
    totalRejected += second.totalRejected;
    return { totalGenerated, totalRejected, totalServiced };
  }

  private getSourceId(event: SimulationEvent) {
    if (hasEventType(event, 'rejection')) {
      return event.rejected.sourceId;
    } else if (hasEventType(event, 'requestAppearance')) {
      return event.request.sourceId;
    } else if (hasEventType(event, 'deviceRelease')) {
      return event.serviced.sourceId;
    }
    return undefined;
  }

  private modifyStatsWithEvent(stats: FlatSourceStats, event: SimulationEvent): FlatSourceStats {
    let { totalGenerated, totalRejected, totalServiced } = stats;
    if (hasEventType(event, 'rejection')) {
      ++totalRejected;
    } else if (hasEventType(event, 'requestAppearance')) {
      ++totalGenerated;
    } else if (hasEventType(event, 'deviceRelease')) {
      ++totalServiced;
    }
    return { totalGenerated, totalRejected, totalServiced };
  }

  public reload() {
    this.summaryServiceTime.set(0);
    this.reloadSources();
    this.reloadDevices();
  }

  private reloadDevices() {
    this.indexedServiceStarts.clear();
  }

  private reloadSources() {
    this.sources = this.simulation.sources;
    this.indexedSourcesStats.clear();
    for (const { id } of this.sources) {
      this.indexedSourcesStats.set(id, signal({ ...DEFAULT_STATS }));
    }
  }
}
