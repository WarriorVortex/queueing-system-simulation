import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input} from '@angular/core';
import {
  BufferingEvent,
  DeviceRelease,
  hasEventType,
  RequestAppearance,
  RequestGeneration,
  RequestRejection,
  ServiceStart,
  SimulationEnd,
  SimulationEvent,
  SimulationService
} from '@app/services/simulation';
import {DiagramInterval, DiagramPoint, TimelineAxisComponent} from '@app/components';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Buffer, Request} from '@app/models';
import {tap} from 'rxjs';
import {FormatRequestPipe} from '@app/pipes';

type SpecialEventValue = { id: number, type: 'device' | 'source' } | null

@Component({
  selector: 'app-timeline-diagram',
  imports: [
    TimelineAxisComponent
  ],
  providers: [
    FormatRequestPipe
  ],
  templateUrl: './timeline-diagram.component.html',
  styleUrl: './timeline-diagram.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineDiagramComponent {
  resolution = input<number>(10);

  private changeDetector = inject(ChangeDetectorRef);
  private formatRequestPipe = inject(FormatRequestPipe);
  private simulation = inject(SimulationService);
  protected simulationEnd = this.simulation.simulationEndTime;
  protected currentTime = this.simulation.currentTime;

  protected readonly sourceAxis = new Map<number, DiagramPoint<Request>[]>();
  protected readonly deviceAxis = new Map<number, DiagramInterval<Request>[]>();
  protected readonly bufferAxis = new Map<number, DiagramInterval<Request>[]>();

  protected specialEvents: DiagramPoint<SpecialEventValue>[] = [];
  protected rejections: DiagramPoint<Request>[] = [];
  private buffer: Buffer | undefined;
  private bufferCells: Array<Request | null> = [];

  protected totalWidth = computed(() => this.simulationEnd() * this.resolution());

  constructor() {
    this.initReloadEffect();
    this.initSimulationEffect();
  }

  protected formatRequest(value: Request | null) {
    return this.formatRequestPipe.transform(value) ?? '';
  }

  protected formatSpecialEvent(value: SpecialEventValue) {
    switch (value?.type) {
      case 'device':
        return `П${value.id}`;
      case 'source':
        return `И${value.id}`;
      default:
        return 'Конец модел.';
    }
  }

  private initReloadEffect() {
    this.simulation.onConfig$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.buffer = this.simulation.buffer;
      this.reset();
      this.changeDetector.markForCheck();
    });
  }

  protected getAxisData<T>(axis: Map<number, Iterable<T>>, index: number): T[] {
    const iterable = axis.get(index);
    return iterable !== undefined ? [...iterable] : [];
  }

  private initSimulationEffect() {
    this.simulation.pipe(
      tap(event => {
        if (hasEventType(event, 'buffering')) {
          this.handleBuffering(event);
        } else if (hasEventType(event, 'requestGeneration')) {
          this.handleRequestGeneration(event);
        } else if (hasEventType(event, 'rejection')) {
          this.handleRejection(event);
        } else if (hasEventType(event, 'serviceStart')) {
          this.handleServiceStart(event);
        } else if (hasEventType(event, 'deviceRelease')) {
          this.handleDeviceRelease(event);
        } else if (hasEventType(event, 'requestAppearance')) {
          this.handleRequestAppearance(event);
        } else if (hasEventType(event, 'simulationEnd')) {
          this.handleSimulationEnd(event);
        }
      }),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.changeDetector.markForCheck();
    });
  }

  private handleBuffering(event: BufferingEvent | SimulationEvent) {
    const { time } = event;
    const { queue } = this.buffer!;
    for (let i = 0; i < this.bufferCells.length; ++i) {
      const request = queue[i];
      if (this.bufferCells[i] !== request) {
        const axis = this.bufferAxis.get(i)!;
        const last = axis.at(axis.length - 1);
        if (last && last.interval.end === undefined) {
          last.interval.end = time;
        }
        if (request !== null) {
          const interval = {
            value: request,
            interval: { start: time }
          };
          axis.push(interval);
        }
        this.bufferCells[i] = request;
      }
    }
  }

  private handleRequestGeneration(event: RequestGeneration) {
    const { generated: value } = event;
    if (value.arrivalTime > this.simulationEnd()) {
      return;
    }

    const { sourceId } = value;
    this.sourceAxis.get(sourceId)?.push({ value, time: value.arrivalTime });
  }

  private handleRejection(event: RequestRejection) {
    const { time, rejected: value } = event;
    this.rejections.push({ value, time });
  }

  private handleServiceStart(event: ServiceStart) {
    const { time, device } = event;
    const { id, servicedRequest } = device;
    this.deviceAxis.get(id)?.push({
      value: servicedRequest!,
      interval: { start: time }
    });
    this.handleBuffering(event);
  }

  private handleDeviceRelease(event: DeviceRelease) {
    const { time, device: { id } } = event;
    const axis = this.deviceAxis.get(id)!;
    axis[axis.length - 1].interval.end = time;

    const value = { id, type: 'device' as const };
    this.specialEvents.push({ time, value });
  }

  private handleRequestAppearance(event: RequestAppearance) {
    const {
      time,
      request: { sourceId: id }
    } = event;
    const value = { id, type: 'source' as const };
    this.specialEvents.push({ time, value });
  }

  private handleSimulationEnd(event: SimulationEnd) {
    const { time } = event;
    this.specialEvents.push({ time, value: null });
  }

  private reset() {
    this.specialEvents = [];
    this.rejections = [];
    this.resetDeviceAxis();
    this.resetSourceAxis();
    this.resetBufferAxis();
  }

  private resetDeviceAxis() {
    const { devices } = this.simulation;
    this.resetAxis(devices, this.deviceAxis);
  }

  private resetSourceAxis() {
    const { sources } = this.simulation;
    this.resetAxis(sources, this.sourceAxis);
  }

  private resetBufferAxis() {
    const { capacity = 0 } = this.simulation.buffer!;
    this.resetAxis(this.generateIndexed(capacity), this.bufferAxis);
    this.bufferCells = Array.from({ length: capacity }, () => null);
  }

  private resetAxis(items: Iterable<{ id: number }>, axis: Map<number, unknown[]>) {
    axis.clear();
    for (const item of items) {
      axis.set(item.id, []);
    }
  }

  private *generateIndexed(length: number) {
    for (let id = 0; id < length; ++id) {
      yield { id };
    }
  }
}
