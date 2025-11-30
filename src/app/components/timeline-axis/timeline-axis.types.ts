export interface DiagramPoint<T> {
  value: T;
  time: number,
}

export interface DiagramInterval<T> {
  value: T,
  interval: {
    start: number,
    end?: number
  },
}
