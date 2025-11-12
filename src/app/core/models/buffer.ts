import {Request} from './request';

export class Buffer {
  public readonly requestQueue: (Request | null)[];
  private size: number = 0;

  constructor(
    public readonly capacity: number,
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

  public shrink() {
    const queue = this.requestQueue;
    const newQueue = queue.filter(value => value !== null);
    for (let i = 0; i < queue.length; ++i) {
      queue[i] = newQueue[i] ?? null;
    }
    this.size = newQueue.length;
  }
}
