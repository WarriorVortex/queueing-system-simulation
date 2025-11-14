import {inject, Injectable, signal} from '@angular/core';
import {EntityService} from '@app/services/entity';
import {
  DEFAULT_BUFFER_CAPACITY,
  DEFAULT_DEVICES_NUMBER,
  DEFAULT_SIMULATION_END_TIME,
  DEFAULT_SOURCES_NUMBER,
} from './simulation.tokens';
import {
  Buffer,
  BufferingDispatcher,
  Device,
  Request,
  RequestRejectionError,
  SelectionDispatcher,
  Source
} from '@app/models';
import {DeviceRelease, RequestAppearance, SimulationEnd, SimulationEvent} from './events';

type EntityWithId = { readonly id: number };

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private entityService = inject(EntityService);

  public readonly devicesNumber = signal(inject(DEFAULT_DEVICES_NUMBER));
  public readonly sourcesNumber = signal(inject(DEFAULT_SOURCES_NUMBER));
  public readonly bufferCapacity = signal(inject(DEFAULT_BUFFER_CAPACITY));
  public readonly simulationEndTime = signal(inject(DEFAULT_SIMULATION_END_TIME));

  private readonly _isSimulationEnd = signal(false);
  public readonly isSimulationEnd= this._isSimulationEnd.asReadonly();

  private readonly _currentTime = signal(0);
  public readonly currentTime = this._currentTime.asReadonly();

  public readonly eventQueue = new Array<SimulationEvent>();
  public readonly rejectionQueue = new Array<Request>();

  private devices!: Device[];
  private sources!: Source[];
  private buffer!: Buffer;

  private bufferingDispatcher!: BufferingDispatcher;
  private selectionDispatcher!: SelectionDispatcher;

  constructor() {
    this.initEntities();
  }

  public startSimulation() {
    const simulationEnd = new SimulationEnd(this.simulationEndTime());
    this.eventQueue.push(simulationEnd);

    for (const source of this.sources) {
      const request = source.generate(this._currentTime());
      const requestAppearance = new RequestAppearance(request.arrivalTime, request);
      this.eventQueue.push(requestAppearance);
    }
  }

  public processStep() {
    const event = this.findNextEvent();
    this._currentTime.set(event.time);

    if (event instanceof RequestAppearance) {
      this.processRequestAppearance(event);
    } else if (event instanceof DeviceRelease) {
      this.processDeviceRelease(event);
    } else {
      this.endSimulation();
    }
    event.isPast = true;
  }

  private processRequestAppearance(event: RequestAppearance) {
    const newRequest = this.generateNextRequest(event.request.sourceId);
    const requestAppearance = new RequestAppearance(newRequest.arrivalTime, newRequest);
    this.eventQueue.push(requestAppearance);

    const { request } = event;
    const currentTime = this._currentTime();

    if (this.selectionDispatcher.isFreeDevice()) {
      const device = this.selectionDispatcher.serveRequest(currentTime, request)!;
      const deviceRelease = new DeviceRelease(device.serviceEndTime!, device);
      this.eventQueue.push(deviceRelease);
    } else {
      try {
        this.bufferingDispatcher.putInBuffer(request);
      } catch (err) {
        if (err instanceof RequestRejectionError) {
          this.rejectionQueue.push(err.rejectedRequest);
        }
      }
    }
  }

  private generateNextRequest(sourceId: number) {
    const currentTime = this._currentTime();
    const source = this.sources
      .find(({ id }) => id === sourceId)!;

    return source.generate(currentTime);
  }

  private processDeviceRelease(event: DeviceRelease) {
    event.device.finishService();

    if (this.buffer.isEmpty) {
      return;
    }

    const currentTime = this._currentTime();
    const device = this.selectionDispatcher.serveRequest(currentTime);

    if (!device) {
      return;
    }

    const { serviceEndTime } = device;
    const deviceRelease = new DeviceRelease(serviceEndTime!, device);
    this.eventQueue.push(deviceRelease);
  }

  private findNextEvent() {
    const currentTime = this._currentTime();
    const closestEvent = this.eventQueue
      .filter(({ isPast }) => !isPast)
      .sort(this.compareEvents.bind(this))
      .at(0);

    if (closestEvent === undefined) {
      console.error('No events in event queue');
    }

    return closestEvent ?? new SimulationEnd(currentTime);
  }

  private compareEvents(first: SimulationEvent, second: SimulationEvent) {
    const diff = first.time - second.time;
    if (diff !== 0) {
      return diff;
    }
    if (first instanceof RequestAppearance) {
      return -1;
    }
    if (second instanceof RequestAppearance) {
      return 1;
    }
    return 0;
  }

  private endSimulation() {
    this._isSimulationEnd.set(true);
  }

  private initEntities() {
    this.devices = [...this.generateDevices()];
    this.sources = [...this.generateSources()];
    this.buffer = this.createBuffer();
    this.initDispatchers();
  }

  private initDispatchers() {
    this.bufferingDispatcher = this.entityService.createBufferingDispatcher(this.buffer);
    this.selectionDispatcher = this.entityService.createRequestSelectionDispatcher(this.devices, this.buffer);
  }

  private *generateDevices() {
    const length = this.devicesNumber();
    for (let i = 0; i < length; ++i) {
      yield this.entityService.createDevice(i + 1);
    }
  }

  private *generateSources() {
    const length = this.sourcesNumber();
    for (let i = 0; i < length; ++i) {
      yield this.entityService.createSource(i + 1);
    }
  }

  private *createEntries<T extends EntityWithId>(iter: Iterable<T>): Generator<[number, T], void, unknown> {
    for (const value of iter) {
      yield [value.id, value];
    }
  }

  private createBuffer() {
    const capacity = this.bufferCapacity();
    return this.entityService.createBuffer(capacity);
  }
}
