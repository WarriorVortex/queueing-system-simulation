import { Request } from './request';
import {RequestIntervalRule} from './rules';

export class Source {
  constructor(
    private readonly id: number,
    private readonly calculateInterval: RequestIntervalRule
  ) {}

  public generate(currentTime: number): Request {
    const nextInterval = this.calculateInterval(currentTime);
    return new Request(this.id, currentTime + nextInterval);
  }
}
