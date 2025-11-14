import { Request } from './request';
import {RequestIntervalRule} from '../rules';

export class Source {
  constructor(
    public readonly id: number,
    private readonly calculateInterval: RequestIntervalRule
  ) {}

  public generate(currentTime: number): Request {
    const nextInterval = this.calculateInterval(currentTime);
    return new Request(this.id, currentTime + nextInterval);
  }
}
