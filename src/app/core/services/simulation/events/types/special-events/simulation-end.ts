import {SpecialSimulationEvent} from './special-simulation-event';
import EventMetadata from '../../metadata';

export class SimulationEnd extends SpecialSimulationEvent {
}

EventMetadata.writeType(SimulationEnd, 'simulationEnd');
