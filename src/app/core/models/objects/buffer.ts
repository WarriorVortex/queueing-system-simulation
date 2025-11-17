import {Request} from './request';

export class Buffer {
  public readonly requestQueue: (Request | null)[];
  private size: number = 0;

  constructor(
    public readonly capacity: number = 1,
  ) {
    this.requestQueue = new Array<Request | null>(capacity).fill(null);
  }

  public add(request: Request): boolean {
    if (this.isFull) {
      return false;
    }
    this.requestQueue[this.size++] = request;
    return true;
  }

  public remove(request: Request): boolean {
    const queue = this.requestQueue;
    const index = queue.indexOf(request);
    if (index < 0) {
      return false;
    }

    queue[index] = null;
    return true;
  }

  public get isFull(): boolean {
    return this.size === this.capacity;
  }

  public get isEmpty(): boolean {
    return this.size === 0;
  }

  public get hasPlace() {
    return !this.isFull;
  }

  public shrink() {
    const queue = this.requestQueue;
    const newQueue = this.requests;
    for (let i = 0; i < queue.length; ++i) {
      queue[i] = newQueue.at(i) ?? null;
    }
    this.size = newQueue.length;
  }

  public get requests(): Request[] {
    return this.requestQueue.filter(value => value !== null);
  }

  public get cells(): (Request | null)[] {
    return [...this.requestQueue];
  }
}
