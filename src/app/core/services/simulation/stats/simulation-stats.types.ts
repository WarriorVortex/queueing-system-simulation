import {Source} from '@app/models';

export interface SummaryStats {
  flowIntensity: number,
  averageServiceTime: number,
  rejectionRate: number,
  devicesWorkload: number,
}

export interface SourceStats {
  sourceId: typeof Source.prototype.id,
  totalGenerated: number,
  totalServiced: number,
  totalRejected: number,
  rejectionRate: number,
}

export type SourceSummaryStats = Omit<SourceStats, 'sourceId'>;
