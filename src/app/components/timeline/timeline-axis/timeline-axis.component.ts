import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {DiagramInterval, DiagramPoint} from './timeline-axis.types';

@Component({
  selector: 'app-timeline-axis',
  imports: [],
  templateUrl: './timeline-axis.component.html',
  styleUrl: './timeline-axis.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineAxisComponent<T> {
  formatter = input<(value: T) => string>(String);
  points = input<DiagramPoint<T>[]>([]);
  intervals = input<DiagramInterval<T>[]>([]);
  max = input<number>();

  private readonly maxValue = this.computeMaxValue();
  current = input<number>(this.maxValue());

  private computeMaxValue() {
    return computed(() => {
      const max = this.max();
      if (max !== undefined) {
        return max;
      }

      let data: DiagramPoint<T>[] | DiagramInterval<T>[] = this.points();
      if (data.length > 0) {
        return data[data.length - 1].time;
      }

      data = this.intervals();
      if (data.length > 0) {
        const { interval } = data[data.length - 1];
        return interval.end ?? interval.start;
      }

      return 0;
    })
  }

  protected getIntervalWidth(item: DiagramInterval<T>) {
    const { interval } = item;
    const end = interval.end ?? this.current();
    return ((end - interval.start) / this.maxValue()) * 100;
  }

  protected getIntervalPosition(item: DiagramInterval<T>) {
    const { interval } = item;
    return (interval.start / this.maxValue()) * 100;
  }

  protected getPointPosition(item: DiagramPoint<T>) {
    return (item.time / this.maxValue()) * 100;
  }
}
