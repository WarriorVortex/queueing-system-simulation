import {inject, Injectable, Injector, OnDestroy, signal, WritableSignal} from '@angular/core';
import {SimulationService} from '../simulation.service';
import {toObservable} from '@angular/core/rxjs-interop';
import {BehaviorSubject, filter, interval, Observable, Subscription, switchMap, takeWhile, tap} from 'rxjs';
import {SimulationRunnerError} from './sumulation-runner.errors';
import {SimulationRunnerConfig} from './simulation-runner.types';

@Injectable({
  providedIn: 'root'
})
export class SimulationRunnerService implements OnDestroy {
  private injector = inject(Injector);
  private simulation = inject(SimulationService);

  private isStarted = this.simulation.isStarted;
  private isFinished = this.simulation.isFinished;

  private onStepCallback: VoidFunction | undefined;
  private simulationInterval$: Observable<number> | undefined;

  private processSubscription: Subscription | undefined;
  private intervalWatchSubscription: Subscription | undefined;

  private readonly _stepsRemained = signal<number | null>(null);
  public readonly stepsRemained = this._stepsRemained.asReadonly();

  public configure(config: SimulationRunnerConfig): void {
    this.stopAll();
    this.setupConfiguration(config);
    this.setupIntervalWatch();
  }

  ngOnDestroy(): void {
    this.stopAll();
  }

  public processNextStep(): void {
    this.validateSimulationState();
    this.simulation.processStep();
    this.onStepCallback?.();
  }

  public processAllSteps(): void {
    this.validateSimulationState();
    this.simulation.processAllSteps();
    this.onStepCallback?.();
  }

  public processNSteps(n: number = 1): void {
    this.validateSimulationState();
    this.simulation.processNSteps(n);
    this.onStepCallback?.();
  }

  public runAllSteps(): void {
    this.validateSimulationState();
    this.startProcess(Infinity);
  }

  public runNSteps(n: number): void {
    this.validateSimulationState();
    this.startProcess(n);
  }

  public runNextStep(): void {
    this.validateSimulationState();
    this.startProcess(1);
  }

  public stop(): void {
    this.stopProcess();
  }

  private setupConfiguration(config: SimulationRunnerConfig): void {
    const { interval, onStep } = config;

    this.onStepCallback = onStep;
    this.simulationInterval$ = this.createIntervalObservable(interval);
  }

  private createIntervalObservable(interval: number | WritableSignal<number>): Observable<number> {
    return typeof interval !== 'number'
      ? toObservable(interval, { injector: this.injector })
      : new BehaviorSubject(interval);
  }

  private setupIntervalWatch(): void {
    this.intervalWatchSubscription = this.simulationInterval$?.pipe(
      filter(period => period !== 0),
      filter(() => this._stepsRemained() !== null)
    ).subscribe(() => {
      const remainingSteps = this._stepsRemained()!;
      this.startProcess(remainingSteps);
    });
  }

  private startProcess(steps: number): void {
    this.stopProcess();
    this.processSubscription = this.createProcessSubscription(steps);
  }

  private stopProcess(): void {
    this.processSubscription?.unsubscribe();
    this.processSubscription = undefined;
  }

  private stopAll(): void {
    this.stopProcess();
    this.stopIntervalWatch();
    this._stepsRemained.set(null);
  }

  private stopIntervalWatch(): void {
    this.intervalWatchSubscription?.unsubscribe();
    this.intervalWatchSubscription = undefined;
  }

  private createProcessSubscription(steps: number): Subscription | undefined {
    if (steps <= 0) {
      return;
    }

    const initialInterval = this.getCurrentInterval();
    if (initialInterval <= 0) {
      this.executeStepsSync(steps);
      return;
    }

    return this.createAsyncProcessSubscription(steps);
  }

  private getCurrentInterval(): number {
    let currentInterval = 0;
    const subscription = this.simulationInterval$?.subscribe(value => {
      currentInterval = value;
    });
    subscription?.unsubscribe();
    return currentInterval;
  }

  private executeStepsSync(steps: number): void {
    this.simulation.processNSteps(steps);
  }

  private createAsyncProcessSubscription(steps: number): Subscription | undefined {
    this._stepsRemained.set(steps);

    const subscription = this.simulationInterval$?.pipe(
      switchMap(period => interval(period)),
      takeWhile(() => this.shouldContinueProcess())
    ).subscribe(() => {
      this.processStep();
    });

    subscription?.add(() => this._stepsRemained.set(null));
    return subscription;
  }

  private processStep(): void {
    this.simulation.processStep();
    this.onStepCallback?.();
    this._stepsRemained.update(value => value !== null ? value - 1 : null);
  }

  private shouldContinueProcess(): boolean {
    const stepsRemained = this._stepsRemained();
    return !this.isFinished() && stepsRemained !== null && stepsRemained > 0;
  }

  private validateSimulationState(): void {
    if (!this.isStarted()) {
      throw new SimulationRunnerError('Simulation not started', { cause: 'not-started' });
    }
    if (this.isFinished()) {
      throw new SimulationRunnerError('Simulation has already finished', { cause: 'finished' });
    }
  }
}
