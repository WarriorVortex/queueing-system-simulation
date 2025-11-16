import {DeviceSelectionDiscipline} from '@app/models/disciplines';
import {Device} from '@app/models';

let lastIndex = -1;

function findFreeDevice(devices: Device[], start?: number, end?: number) {
  return devices
    .slice(start, end)
    .find(device => device.isFree);
}

export const selectDevice: DeviceSelectionDiscipline = (devices) => {
  if (lastIndex === devices.length) {
    lastIndex = 0;
  }

  let foundDevice = findFreeDevice(devices, lastIndex + 1) ?? findFreeDevice(devices, 0, lastIndex + 1);
  if (foundDevice !== undefined) {
    ++lastIndex;
  }
  return foundDevice ?? null;
}
