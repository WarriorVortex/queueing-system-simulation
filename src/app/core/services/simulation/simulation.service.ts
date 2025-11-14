import {inject, Injectable, signal} from '@angular/core';
import {EntityService} from '@app/services/entity';
import {
  AUTOCONFIGURATION,
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
import { compareEvents } from './simulation.utils';
import { EntityGeneratorService } from './entity-generator.service';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private entityService = inject(EntityService);
  private entityGeneratorService = inject(EntityGeneratorService);

  public readonly devicesNumber = signal(inject(DEFAULT_DEVICES_NUMBER));
  public readonly sourcesNumber = signal(inject(DEFAULT_SOURCES_NUMBER));
  public readonly bufferCapacity = signal(inject(DEFAULT_BUFFER_CAPACITY));
  public readonly simulationEndTime = signal(inject(DEFAULT_SIMULATION_END_TIME));

  private readonly _isSimulationEnd = signal(false);
  public readonly isSimulationEnd= this._isSimulationEnd.asReadonly();

  private readonly _currentTime = signal(0);
  public readonly currentTime = this._currentTime.asReadonly();

  private _eventQueue!: Array<SimulationEvent>;
  private _rejectionQueue!: Array<Request>;

  private devices!: Map<number, Device>;
  private sources!: Map<number, Source>;
  private buffer!: Buffer;

  private bufferingDispatcher!: BufferingDispatcher;
  private selectionDispatcher!: SelectionDispatcher;

  constructor() {
    const autoconfig = inject(AUTOCONFIGURATION);
    if (autoconfig) {
      this.configureSimulation();
    }
  }

  public configureSimulation() {
    this.devices = this.createIndexedDevices();
    this.sources = this.createIndexedSources();
    this.buffer = this.createBuffer();
    this.initDispatchers();
    this.initQueues();
  }

  public get eventQueue() {
    return this._eventQueue;
  }

  public get rejectionQueue() {
    return this._rejectionQueue;
  }

  public startSimulation() {
    const simulationEnd = new SimulationEnd(this.simulationEndTime());
    this._eventQueue.push(simulationEnd);

    for (const source of this.sources.values()) {
      const request = source.generate(this._currentTime());
      const requestAppearance = new RequestAppearance(request.arrivalTime, request);
      this._eventQueue.push(requestAppearance);
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
    this._eventQueue.push(requestAppearance);

    const { request } = event;
    const currentTime = this._currentTime();

    if (this.selectionDispatcher.isFreeDevice()) {
      const device = this.selectionDispatcher.serveRequest(currentTime, request)!;
      const deviceRelease = new DeviceRelease(device.serviceEndTime!, device);
      this._eventQueue.push(deviceRelease);
      return;
    }

    try {
      this.bufferingDispatcher.putInBuffer(request);
    } catch (err) {
      if (err instanceof RequestRejectionError) {
        this._rejectionQueue.push(err.rejectedRequest);
      }
    }
  }

  private generateNextRequest(sourceId: number) {
    const currentTime = this._currentTime();
    const source = this.sources.get(sourceId)!;
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
    this._eventQueue.push(deviceRelease);
  }

  private findNextEvent() {
    const currentTime = this._currentTime();
    const closestEvent = this._eventQueue
      .filter(({ isPast }) => !isPast)
      .sort(compareEvents)
      .at(0);

    if (closestEvent === undefined) {
      console.error('No events in event queue');
    }

    return closestEvent ?? new SimulationEnd(currentTime);
  }

  private endSimulation() {
    this._isSimulationEnd.set(true);
  }

  private initQueues() {
    this._eventQueue = [];
    this._rejectionQueue = [];
  }

  private initDispatchers() {
    this.bufferingDispatcher = this.entityService.createBufferingDispatcher(this.buffer);
    this.selectionDispatcher = this.entityService.createSelectionDispatcher(this.devices.values(), this.buffer);
  }

  private createIndexedSources() {
    const length = this.sourcesNumber();
    const generator = this.entityGeneratorService.generateIndexedSources(length);
    return new Map(generator);
  }

  private createIndexedDevices() {
    const length = this.devicesNumber();
    const generator = this.entityGeneratorService.generateIndexedDevices(length);
    return new Map(generator);
  }

  private createBuffer() {
    const capacity = this.bufferCapacity();
    return this.entityService.createBuffer(capacity);
  }
}
