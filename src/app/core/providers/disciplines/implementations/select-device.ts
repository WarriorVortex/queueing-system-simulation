import {DeviceSelectionDiscipline} from '@app/models/disciplines';

let lastDeviceIndex = -1;

export const selectDevice: DeviceSelectionDiscipline = (devices, _) => {
  if (lastDeviceIndex === devices.length) {
    lastDeviceIndex = 0;
  }

  let foundDevice = devices
    .slice(lastDeviceIndex + 1)
    .find(device => device.isFree);

  if (foundDevice !== undefined) {
    lastDeviceIndex++;
    return foundDevice;
  }

  foundDevice = devices
    .slice(0, lastDeviceIndex + 1)
    .find(device => device.isFree);

  return foundDevice ?? null;
}
