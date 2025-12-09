import {Request} from './request';

export class Buffer {
  public readonly requestQueue: (Request | null)[];
  private _size: number = 0;

  constructor(
    public readonly capacity: number = 1,
  ) {
    this.requestQueue = new Array<Request | null>(capacity).fill(null);
  }

  public get size() {
    return this._size;
  }

  public replace(oldRequest: Request, newRequest: Request, time?: number) {
    const index = this.requestQueue.indexOf(oldRequest);
    if (index < 0) {
      return false;
    }

    newRequest.bufferArrivalTime = time;
    this.requestQueue[index] = newRequest;
    return true;
  }

  public add(request: Request, time?: number) {
    return this.insert(request, undefined, time);
  }

  public insert(request: Request, index?: number, time?: number): boolean {
    if (this.isFull) {
      return false;
    }

    if (index === undefined) {
      request.bufferArrivalTime = time;
      this.requestQueue[this._size++] = request;
      return true;
    }

    if (!this.isQueueIndex(index)) {
      return false;
    }

    request.bufferArrivalTime = time;
    this.requestQueue[index] = request;
    return true;
  }

  private isQueueIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.requestQueue.length;
  }

  public remove(request: Request): boolean {
    const queue = this.requestQueue;
    const index = queue.indexOf(request);
    if (index < 0) {
      return false;
    }

    queue[index] = null;
    --this._size;
    return true;
  }

  public get isFull(): boolean {
    return this._size === this.capacity;
  }

  public get isEmpty(): boolean {
    return this._size === 0;
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
    this._size = newQueue.length;
  }

  public get requests(): Request[] {
    return this.requestQueue.filter(value => value !== null);
  }

  public get queue(): Readonly<Array<Request | null>> {
    return this.requestQueue;
  }
}
