import { Buffer } from '../buffer';
import {Request} from '../request';
import {Device} from '../device';
import {RequestSelectionDiscipline, DeviceSelectionDiscipline} from '@app/models/disciplines';

export class SelectionDispatcher {
  constructor(
    private readonly devices: Device[],
    private readonly buffer: Buffer,
    private readonly selectRequest: RequestSelectionDiscipline,
    private readonly selectDevice: DeviceSelectionDiscipline,
  ) {}

  public serveRequest(currentTime: number, request?: Request): Device | null {
    const selectedRequest = this.selectRequest(this.buffer, request, currentTime);

    if (selectedRequest === null) {
      return null;
    }

    this.buffer.remove(selectedRequest);
    this.buffer.shrink();

    const selectedDevice = this.selectDevice(this.devices, selectedRequest, currentTime);
    selectedDevice?.startService(selectedRequest, currentTime);

    return selectedDevice;
  }

  public isFreeDevice() {
    const freeDevice = this.devices.find(device => device.isFree);
    return freeDevice !== undefined;
  }
}
