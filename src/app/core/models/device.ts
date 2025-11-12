import {Request} from './request';
import {ServiceTimeRule} from './rules';

export class Device {
  private currentRequest: Request | null = null;
  private freeTime: number | null = null;

  constructor(
    public readonly id: number,
    private readonly calculateServiceTime: ServiceTimeRule
  ) {}

  public get isBusy(): boolean {
    return this.currentRequest !== null;
  }

  public startService(request: Request, currentTime: number): void {
    this.currentRequest = request;
    this.freeTime = currentTime + this.calculateServiceTime(request, currentTime);
  }

  public finishService(): Request {
    const servicedRequest = this.currentRequest!;
    this.currentRequest = null;
    this.freeTime = null;
    return servicedRequest;
  }

  public get serviceEndTime() {
    return this.freeTime;
  }
}
