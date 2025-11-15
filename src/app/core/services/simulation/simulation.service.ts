import {inject, Injectable, signal} from '@angular/core';
import {EntityService} from '@app/services/entity';
import { DEFAULT_SIMULATION_PARAMS } from './simulation.tokens';
import {
  Buffer,
  BufferingDispatcher,
  Device,
  Request,
  RequestRejectionError,
  SelectionDispatcher,
  Source
} from '@app/models';
import {
  BufferingEvent,
  DeviceRelease,
  RequestAppearance, RequestGeneration,
  RequestRejection, ServiceStart,
  SimulationEnd,
  SimulationEvent,
  SpecialSimulationEvent
} from './events';
import {compareEvents} from './simulation.utils';
import {Subject} from 'rxjs';
import {EntityGeneratorService} from './entity-generator.service';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private entityService = inject(EntityService);
  private entityGeneratorService = inject(EntityGeneratorService);
  private readonly defaultParams = inject(DEFAULT_SIMULATION_PARAMS);

  public readonly devicesNumber = signal(this.defaultParams.devicesNumber);
  public readonly sourcesNumber = signal(this.defaultParams.sourcesNumber);
  public readonly bufferCapacity = signal(this.defaultParams.bufferCapacity);
  public readonly simulationEndTime = signal(this.defaultParams.endTime);

  private readonly _isSimulationEnd = signal(false);
  public readonly isSimulationEnd = this._isSimulationEnd.asReadonly();

  private _currentStep = signal(0);
  public currentStep = this._currentStep.asReadonly();

  private readonly _currentTime = signal(0);
  public readonly currentTime = this._currentTime.asReadonly();

  private readonly _simulationEvent$ = new Subject<SimulationEvent>();
  public readonly simulationEvent$ = this._simulationEvent$.asObservable();

  private _closestEventSet = new Set<SpecialSimulationEvent>();
  private _rejectionQueue = new Array<RequestRejection>();

  private _devices!: Map<number, Device>;
  private _sources!: Map<number, Source>;
  private _buffer!: Buffer;

  private bufferingDispatcher!: BufferingDispatcher;
  private selectionDispatcher!: SelectionDispatcher;

  constructor() {
    if (this.defaultParams.autoconfig) {
      this.configureSimulation();
    }
  }

  public configureSimulation() {
    this._currentStep.set(0);
    this._devices = this.createIndexedDevices();
    this._sources = this.createIndexedSources();
    this._buffer = this.createBuffer();
    this.initDispatchers();
    this.clearQueues();
  }

  public get closestEvents() {
    return [...this._closestEventSet].sort(compareEvents)
  }

  public get rejections() {
    return this._rejectionQueue;
  }

  public get devices() {
    return [...this._devices.values()];
  }

  public get sources() {
    return [...this._devices.values()];
  }

  public get buffer() {
    return this._buffer;
  }

  public startSimulation() {
    const simulationEnd = new SimulationEnd(this.simulationEndTime());
    this.pushEvent(simulationEnd);

    for (const source of this._sources.values()) {
      this.generateNextRequest(source.id);
    }
  }

  public processStep() {
    const event = this.findNextEvent();
    this._currentTime.set(event.time);
    this._currentStep.update(i => i + 1);

    event.step = this._currentStep();
    this.emitEvent(event);

    if (event instanceof RequestAppearance) {
      this.processRequestAppearance(event);
    } else if (event instanceof DeviceRelease) {
      this.processDeviceRelease(event);
    } else {
      this.endSimulation();
    }

    this.popEvent(event);
  }

  public processNSteps(n: number = 1) {
    while (n-- > 0 && !this._isSimulationEnd()) {
      this.processStep();
    }
  }

  public processAllSteps() {
    this.processNSteps(Infinity);
  }

  private processRequestAppearance(event: RequestAppearance) {
    this.generateNextRequest(event.request.sourceId);

    const { request } = event;
    const currentTime = this._currentTime();

    if (this.selectionDispatcher.isFreeDevice()) {
      const device = this.selectionDispatcher.serveRequest(currentTime, request)!;
      this.emitDeviceServe(device);
      return;
    }

    try {
      this.bufferingDispatcher.putInBuffer(request);
      const buffering = new BufferingEvent(currentTime, request);
      this.emitEvent(buffering);
    } catch (err) {
      if (err instanceof RequestRejectionError) {
        this.rejectRequest(err.rejectedRequest);
      }
    }
  }

  private generateNextRequest(sourceId: number) {
    const currentTime = this._currentTime();
    const source = this._sources.get(sourceId)!;
    const request = source.generate(currentTime);

    const generation = new RequestGeneration(currentTime, request);
    this.emitEvent(generation);

    const requestAppearance = new RequestAppearance(request.arrivalTime, request);
    this.pushEvent(requestAppearance);

    return request;
  }

  private processDeviceRelease(event: DeviceRelease) {
    event.device.finishService();

    if (this._buffer.isEmpty) {
      return;
    }

    const currentTime = this._currentTime();
    const device = this.selectionDispatcher.serveRequest(currentTime);
    if (!device) {
      return;
    }

    this.emitDeviceServe(device);
  }

  private emitDeviceServe(device: Device) {
    const currentTime = this._currentTime();

    const deviceRelease = new DeviceRelease(device.serviceEndTime!, device);
    this.pushEvent(deviceRelease);

    const startService = new ServiceStart(currentTime, device);
    this.emitEvent(startService);
  }

  private findNextEvent() {
    const currentTime = this._currentTime();
    const closestEvent = this.closestEvents.at(0);

    if (closestEvent === undefined) {
      console.error('No events in event queue');
    }

    return closestEvent ?? new SimulationEnd(currentTime);
  }

  private endSimulation() {
    this._isSimulationEnd.set(true);
  }

  private clearQueues() {
    this._closestEventSet.clear();
    while (this._rejectionQueue.length > 0) {
      this._rejectionQueue.pop();
    }
  }

  private initDispatchers() {
    this.bufferingDispatcher = this.entityService.createBufferingDispatcher(this._buffer);
    this.selectionDispatcher = this.entityService.createSelectionDispatcher(this._devices.values(), this._buffer);
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

  private rejectRequest(rejected: Request) {
    const currentTime = this._currentTime();
    const rejection = new RequestRejection(currentTime, rejected);
    this._rejectionQueue.push(rejection);
    this.emitEvent(rejection);
  }

  private pushEvent(event: SpecialSimulationEvent) {
    this._closestEventSet.add(event);
  }

  private popEvent(event: SpecialSimulationEvent) {
    this._closestEventSet.delete(event);
    event.isPast = true;
  }

  private emitEvent(event: SimulationEvent) {
    this._simulationEvent$.next(event);
  }
}
