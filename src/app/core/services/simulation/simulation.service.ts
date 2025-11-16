import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {EntityService} from '@app/services/entity';
import DEFAULT_PARAMS, {SIMULATION_PARAMS, SimulationParams} from './simulation.tokens';
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
  compareEvents,
  createEvent,
  DeviceRelease, hasEventType,
  RequestAppearance,
  RequestRejection,
  SimulationEvent,
  SpecialSimulationEvent
} from './events';
import {Subject} from 'rxjs';
import {EntityGeneratorService} from './entity-generator.service';
import {SimulationState} from './simulation-state';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private entityService = inject(EntityService);
  private entityGeneratorService = inject(EntityGeneratorService);
  private readonly defaultParams: SimulationParams = {
    ...DEFAULT_PARAMS,
    ...inject(SIMULATION_PARAMS),
  };

  public readonly devicesNumber = signal(this.defaultParams.devicesNumber);
  public readonly sourcesNumber = signal(this.defaultParams.sourcesNumber);
  public readonly bufferCapacity = signal(this.defaultParams.bufferCapacity);
  public readonly simulationEndTime = signal(this.defaultParams.endTime);

  private _currentStep = signal(0);
  public currentStep = this._currentStep.asReadonly();

  private readonly _currentTime = signal(0);
  public readonly currentTime = this._currentTime.asReadonly();

  private readonly _simulationState = signal<SimulationState>(SimulationState.INITIAL);
  public readonly simulationState = this._simulationState.asReadonly();
  public readonly isEnded: Signal<boolean>;
  public readonly isConfigured: Signal<boolean>;
  public readonly isStarted: Signal<boolean>;

  private readonly _simulationEvent$ = new Subject<SimulationEvent>();
  public readonly simulationEvent$ = this._simulationEvent$.asObservable();

  private readonly _closestEventSet = new Set<SpecialSimulationEvent>();
  private readonly _rejectionQueue = new Array<RequestRejection>();

  private _devices!: Map<number, Device>;
  private _sources!: Map<number, Source>;
  private _buffer!: Buffer;

  private bufferingDispatcher!: BufferingDispatcher;
  private selectionDispatcher!: SelectionDispatcher;

  private readonly CONFIG_STATES = new Set([
    SimulationState.CONFIGURED,
    SimulationState.STARTED,
    SimulationState.ENDED
  ]);
  private readonly START_STATES = new Set([
    SimulationState.STARTED,
    SimulationState.ENDED
  ]);

  constructor() {
    if (this.defaultParams.autoconfig) {
      this.configureSimulation();
    }
    this.isEnded = computed(() => this.simulationState() === SimulationState.ENDED);
    this.isConfigured = computed(() => {
      const state = this.simulationState();
      return this.CONFIG_STATES.has(state);
    });
    this.isStarted = computed(() => {
      const state = this.simulationState();
      return this.START_STATES.has(state);
    });
  }

  public configureSimulation() {
    this._currentStep.set(0);
    this._devices = this.createIndexedDevices();
    this._sources = this.createIndexedSources();
    this._buffer = this.createBuffer();
    this.initDispatchers();
    this.clearQueues();
    this._simulationState.set(SimulationState.CONFIGURED);
  }

  public get closestEvents() {
    return [...this._closestEventSet].sort(compareEvents)
  }

  public get rejections() {
    return this._rejectionQueue;
  }

  public get devices() {
    const devices = this._devices;
    return devices ? [...devices.values()] : [];
  }

  public get sources() {
    const sources = this._sources;
    return sources ? [...sources.values()] : sources;
  }

  public get buffer() {
    return this._buffer;
  }

  public startSimulation() {
    const currentTime = this.simulationEndTime();
    this.pushEvent(createEvent('simulationEnd', currentTime));

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

    if (hasEventType(event, 'requestAppearance')) {
      this.processRequestAppearance(event);
    } else if (hasEventType(event, 'deviceRelease')) {
      this.processDeviceRelease(event);
    } else {
      this.endSimulation();
    }

    this.popEvent(event);
  }

  public processNSteps(n: number = 1) {
    while (n-- > 0 && !this.isEnded()) {
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

    let rejected: Request | undefined;
    try {
      this.bufferingDispatcher.putInBuffer(request);
    } catch (err) {
      if (err instanceof RequestRejectionError) {
        rejected = err.rejectedRequest;
        this.rejectRequest(rejected);
      }
    }
    if (rejected !== request) {
      this.emitEvent(createEvent('buffering', currentTime, request));
    }
  }

  private generateNextRequest(sourceId: number) {
    const currentTime = this._currentTime();
    const source = this._sources!.get(sourceId)!;
    const request = source.generate(currentTime);

    this.emitEvent(createEvent('requestGeneration', currentTime, request));
    this.pushEvent(createEvent('requestAppearance', request.arrivalTime, request));

    return request;
  }

  private processDeviceRelease(event: DeviceRelease) {
    event.device.finishService();

    if (this._buffer!.isEmpty) {
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

    this.pushEvent(createEvent('deviceRelease', device.serviceEndTime!, device));
    this.emitEvent(createEvent('serviceStart', currentTime, device));
  }

  private findNextEvent() {
    const currentTime = this._currentTime();
    const closestEvent = this.closestEvents.at(0);

    if (closestEvent === undefined) {
      console.error('No events in event queue');
    }

    return closestEvent ?? createEvent('simulationEnd', currentTime);
  }

  private endSimulation() {
    this._simulationState.set(SimulationState.ENDED);
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
    const rejection = createEvent('rejection', currentTime, rejected)
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
