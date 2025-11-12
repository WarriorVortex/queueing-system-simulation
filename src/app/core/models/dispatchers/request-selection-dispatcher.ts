import { Buffer } from '../buffer';
import {Request} from '../request';
import {Device} from '../device';
import {RequestSelectionDiscipline, DeviceSelectionDiscipline} from '../disciplines';

export class RequestSelectionDispatcher {
  constructor(
    private readonly devices: Device[],
    private readonly buffer: Buffer,
    private readonly selectRequest: RequestSelectionDiscipline,
    private readonly selectDevice: DeviceSelectionDiscipline,
  ) {}

  public serveRequest(currentTime: number, request?: Request): Device {
    const selectedRequest = this.selectRequest(this.buffer, request);
    this.buffer.remove(selectedRequest);
    this.buffer.shrink();

    const selectedDevice = this.selectDevice(this.devices, selectedRequest);
    selectedDevice.startService(selectedRequest, currentTime);

    return selectedDevice;
  }
}
