import {DeviceSelectionDiscipline} from '@app/models/disciplines';
import {Device} from '@app/models';

let lastIndex = -1;

export const SelectDeviceData = {
  reload() {
    lastIndex = -1
  },
  get lastIndex() {
    return lastIndex;
  }
};

function findFreeDevice(devices: Device[], start?: number, end?: number) {
  return devices
    .slice(start, end)
    .find(device => device.isFree);
}

export const selectDevice: DeviceSelectionDiscipline = (devices) => {
  if (lastIndex === devices.length) {
    lastIndex = 0;
  }

  const index = lastIndex + 1;
  let foundDevice = findFreeDevice(devices, index) ?? findFreeDevice(devices, 0, index);
  if (foundDevice !== undefined) {
    ++lastIndex;
  }
  return foundDevice ?? null;
}
