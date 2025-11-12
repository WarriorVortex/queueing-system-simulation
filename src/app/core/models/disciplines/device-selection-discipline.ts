import {Request} from '../request';
import {Device} from '../device';

export type DeviceSelectionDiscipline = (devices: Device[], request: Request) => Device;
