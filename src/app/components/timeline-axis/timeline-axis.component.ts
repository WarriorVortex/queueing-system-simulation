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
  data = input<DiagramPoint<T>[] | DiagramInterval<T>[]>([]);
  max = input<number>();

  private readonly maxValue = this.computeMaxValue();
  current = input<number>(this.maxValue());

  protected isDiagramPointUsed = computed(() => {
    const data = this.data();
    return data.length > 0 && this.isDiagramPoint(data[0]);
  });

  private isDiagramPoint(value: DiagramPoint<T> | DiagramInterval<T>): value is DiagramPoint<T> {
    return 'time' in value;
  }

  private computeMaxValue() {
    return computed(() => {
      const max = this.max();
      if (max !== undefined) {
        return max;
      }
      const data = this.data();
      const last = data.at(data.length - 1);
      if (last === undefined) {
        return 0;
      }
      return !this.isDiagramPoint(last)
        ? (last.interval.end ?? last.interval.start)
        : last.time;
    })
  }

  protected getIntervalWidth(item: DiagramInterval<T>) {
    const { interval } = item;
    const end = interval.end ?? this.current();
    return ((end - interval.start) / this.maxValue()) * 100;
  }

  protected getIntervalPosition(interval: DiagramInterval<T>) {
    return (interval.interval.start / this.maxValue()) * 100;
  }

  protected getPointPosition(item: DiagramPoint<T>) {
    return (item.time / this.maxValue()) * 100;
  }
}
