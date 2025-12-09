export class Request {
  public bufferArrivalTime?: number;

  constructor(
    public readonly id: number,
    public readonly sourceId: number,
    public readonly arrivalTime: number
  ) {};
}
