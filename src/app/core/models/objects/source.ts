import { Request } from './request';
import {RequestIntervalRule} from '../rules';

export class Source {
  private generatedNumber = 1;
  private nextRequestArrivalTime: number | null = null;

  constructor(
    public readonly id: number,
    private readonly calculateInterval: RequestIntervalRule
  ) {}

  public generate(currentTime: number): Request {
    const nextInterval = this.calculateInterval(currentTime);
    this.nextRequestArrivalTime = currentTime + nextInterval;
    return new Request(this.generatedNumber++, this.id, this.nextRequestArrivalTime);
  }

  public get nextArrivalTime(): number | null {
    return this.nextRequestArrivalTime;
  }

  public get isActive() {
    return this.nextArrivalTime !== null;
  }
}
