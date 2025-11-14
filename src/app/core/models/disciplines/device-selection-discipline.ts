import {Request, Device} from '@app/models';

export type DeviceSelectionDiscipline = (devices: Device[], request: Request) => Device | null;
