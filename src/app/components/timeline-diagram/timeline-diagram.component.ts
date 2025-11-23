import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {
  BufferingEvent, DeviceRelease,
  getEventType, hasEventType, RequestAppearance, RequestGeneration,
  RequestRejection, ServiceStart, SimulationEnd,
  SimulationEvent,
  SimulationEventType,
  SimulationService
} from '@app/services/simulation';
import {DiagramInterval, DiagramPoint} from './timeline-diagrams.types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Buffer, Request} from '@app/models';
import {tap} from 'rxjs';

@Component({
  selector: 'app-timeline-diagram',
  imports: [],
  templateUrl: './timeline-diagram.component.html',
  styleUrl: './timeline-diagram.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineDiagramComponent {
  private changeDetector = inject(ChangeDetectorRef);
  private simulation = inject(SimulationService);

  private readonly sourceAxis = new Map<number, DiagramPoint<Request>[]>();
  private readonly deviceAxis = new Map<number, DiagramInterval<Request>[]>();
  private readonly bufferAxis = new Map<number, DiagramInterval<Request>[]>();

  private specialEvents: DiagramPoint<Request>[] = [];
  private rejections: DiagramPoint<Request>[] = [];
  private buffer: Buffer | undefined;

  constructor() {
    this.initReloadEffect();
    this.initSimulationEffect();
  }

  private initReloadEffect() {
    this.simulation.onReload$.pipe(
      takeUntilDestroyed()
    ).subscribe(this.reset.bind(this));
    this.simulation.onConfig$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => this.buffer = this.simulation.buffer);
  }

  private initSimulationEffect() {
    this.simulation.pipe(
      tap(event => {
        if (hasEventType(event, 'buffering')) {
          this.handleBuffering(event);
        } else if (hasEventType(event, 'requestGeneration')) {

        } else if (hasEventType(event, 'rejection')) {

        } else if (hasEventType(event, 'serviceStart')) {

        } else if (hasEventType(event, 'deviceRelease')) {

        } else if (hasEventType(event, 'requestAppearance')) {

        } else if (hasEventType(event, 'simulationEnd')) {

        }
      }),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.changeDetector.markForCheck();
    });
  }

  private handleBuffering(event: BufferingEvent) {
    const { time } = event;

  }

  private handleRequestGeneration(event: RequestGeneration) {

  }

  private handleRejection(event: RequestRejection) {

  }

  private handleServiceStart(event: ServiceStart) {

  }

  private handleDeviceRelease(event: DeviceRelease) {

  }

  private handleRequestAppearance(event: RequestAppearance) {

  }

  private handleSimulationEnd(event: SimulationEnd) {

  }

  private reset() {
    this.specialEvents = [];
    this.rejections = [];
    this.deviceAxis.clear();
    this.bufferAxis.clear();
    const { sources, devices } = this.simulation;
    this.resetAxis(devices, this.deviceAxis);
    this.resetAxis(sources, this.sourceAxis);
    const { capacity = 0 } = this.simulation.buffer!;
    this.resetAxis(this.generateIndexed(capacity), this.bufferAxis);
  }

  private resetAxis(items: Iterable<{ id: number }>, axis: Map<number, unknown[]>) {
    axis.clear();
    for (const item of items) {
      axis.set(item.id, []);
    }
  }

  private findBufferedIndex(request: Request): number | undefined {
    return this.buffer?.queue.indexOf(request);
  }

  private *generateIndexed(length: number) {
    for (let id = 0; id < length; ++id) {
      yield { id };
    }
  }
}
