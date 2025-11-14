export class Request {
  constructor(
    public readonly id: number,
    public readonly sourceId: number,
    public readonly arrivalTime: number,
    public readonly bufferArrivalTime?: number,
  ) {};
}
