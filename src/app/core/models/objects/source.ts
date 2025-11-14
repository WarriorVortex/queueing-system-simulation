import { Request } from './request';
import {RequestIntervalRule} from '../rules';

export class Source {
  private generatedNumber = 1;

  constructor(
    public readonly id: number,
    private readonly calculateInterval: RequestIntervalRule
  ) {}

  public generate(currentTime: number): Request {
    const nextInterval = this.calculateInterval(currentTime);
    return new Request(this.generatedNumber++, this.id, currentTime + nextInterval);
  }
}
