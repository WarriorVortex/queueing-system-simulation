export interface DiagramPoint<T> {
  value: T;
  timestamp: number,
}

export interface DiagramInterval<T> {
  value: T,
  interval: {
    start: number,
    end?: number
  },
}
