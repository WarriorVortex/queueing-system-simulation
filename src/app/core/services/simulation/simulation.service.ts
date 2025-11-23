import {computed, inject, Injectable, OnDestroy, Signal, signal} from '@angular/core';
import {EntityGeneratorService, EntityService} from '@app/services/entity';
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
  DeviceRelease,
  hasEventType,
  RequestAppearance,
  RequestRejection,
  SimulationEvent,
  SpecialSimulationEvent
} from './events';
import {Observable, skip, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SimulationState} from './simulation-state';

@Injectable({
  providedIn: 'root',
})
export class SimulationService extends Observable<SimulationEvent> implements OnDestroy {
  private entityService = inject(EntityService);
  private entityGeneratorService = inject(EntityGeneratorService);
  private readonly defaultParams: Required<SimulationParams> = {
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
  public readonly isFinished!: Signal<boolean>;
  public readonly isConfigured: Signal<boolean>;
  public readonly isStarted: Signal<boolean>;

  private readonly simulationEvent$ = new Subject<SimulationEvent>();
  private readonly _closestEventSet = new Set<SpecialSimulationEvent>();
  private readonly _rejectionQueue = new Array<RequestRejection>();

  private _devices: Map<number, Device> | undefined;
  private _sources: Map<number, Source> | undefined;
  private _buffer: Buffer | undefined;

  private bufferingDispatcher!: BufferingDispatcher;
  private selectionDispatcher!: SelectionDispatcher;

  private readonly CONFIG_STATES = new Set([
    SimulationState.CONFIGURED,
    SimulationState.STARTED,
    SimulationState.FINISHED
  ]);
  private readonly START_STATES = new Set([
    SimulationState.STARTED,
    SimulationState.FINISHED
  ]);

  private readonly _onConfig$ = new Subject<void>();
  public readonly onConfig$ = this._onConfig$.asObservable();
  public readonly onReload$ = this.onConfig$.pipe(skip(1));

  constructor() {
    super(subscriber => {
      const subscription = this.simulationEvent$.pipe(
        takeUntilDestroyed()
      ).subscribe(subscriber);
      return subscription.unsubscribe;
    });
    if (this.defaultParams.autoconfig) {
      this.configureSimulation();
    }
    this.isFinished = computed(() => this.simulationState() === SimulationState.FINISHED);
    this.isConfigured = computed(() => this.CONFIG_STATES.has(this.simulationState()));
    this.isStarted = computed(() => this.START_STATES.has(this.simulationState()));

  }

  ngOnDestroy() {
    this._onConfig$.complete();
  }

  public configureSimulation() {
    this._currentStep.set(0);
    this._devices = this.createIndexedDevices();
    this._sources = this.createIndexedSources();
    this._buffer = this.createBuffer();
    this.initDispatchers();
    this.clearQueues();
    this._simulationState.set(SimulationState.CONFIGURED);
    this._onConfig$.next();
  }

  public get closestEvents() {
    return [...this._closestEventSet].sort(compareEvents)
  }

  public get rejections() {
    return [...this._rejectionQueue];
  }

  public get devices() {
    const devices = this._devices;
    return devices ? [...devices.values()] : [];
  }

  public get sources() {
    const sources = this._sources;
    return sources ? [...sources.values()] : [];
  }

  public get buffer() {
    return this._buffer;
  }

  public startSimulation() {
    this._currentTime.set(0);
    const currentTime = this.simulationEndTime();
    this.pushEvent(createEvent('simulationEnd', currentTime));

    for (const source of this._sources?.values() ?? []) {
      this.generateNextRequest(source.id);
    }

    this._simulationState.set(SimulationState.STARTED);
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
    while (n-- > 0 && !this.isFinished()) {
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
      this.emitDeviceServe(device, request);
      return;
    }

    let rejected: Request | undefined;
    try {
      this.bufferingDispatcher.putInBuffer(currentTime, request);
    } catch (err) {
      if (err instanceof RequestRejectionError) {
        rejected = err.rejected;
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
    const { servicedRequest: served } = event.device;
    event.device.finishService();

    if (this._buffer!.isEmpty) {
      return;
    }

    const currentTime = this._currentTime();
    const device = this.selectionDispatcher.serveRequest(currentTime);
    if (!device) {
      return;
    }

    this.emitDeviceServe(device, served!);
  }

  private emitDeviceServe(device: Device, served: Request) {
    const currentTime = this._currentTime();

    this.pushEvent(createEvent('deviceRelease', device.serviceEndTime!, device, served));
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
    this._simulationState.set(SimulationState.FINISHED);
  }

  private clearQueues() {
    this._closestEventSet.clear();
    while (this._rejectionQueue.length > 0) {
      this._rejectionQueue.pop();
    }
  }

  private initDispatchers() {
    this.bufferingDispatcher = this.entityService.createBufferingDispatcher(this._buffer!);
    this.selectionDispatcher = this.entityService.createSelectionDispatcher(this._devices!.values(), this._buffer!);
  }

  private createIndexedSources() {
    const length = this.sourcesNumber();
    const generator = this.entityGeneratorService.generateIndexedSources(length, 1);
    return new Map(generator);
  }

  private createIndexedDevices() {
    const length = this.devicesNumber();
    const generator = this.entityGeneratorService.generateIndexedDevices(length, 1);
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
    this.simulationEvent$.next(event);
  }
}
