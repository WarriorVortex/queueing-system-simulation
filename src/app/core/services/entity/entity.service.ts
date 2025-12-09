import {inject, Injectable} from '@angular/core';
import {
  BUFFERING_DISCIPLINE,
  DEVICE_SELECTION_DISCIPLINE, REJECTION_DISCIPLINE,
  REQUEST_INTERVAL_RULE,
  REQUEST_SELECTION_DISCIPLINE, SERVICE_TIME_RULE
} from './entity.tokens';
import {Source, Buffer, Device, BufferingDispatcher, SelectionDispatcher} from '@app/models/objects';

@Injectable({
  providedIn: 'root',
})
export class EntityService {
  private readonly deviceSelectionDiscipline = inject(DEVICE_SELECTION_DISCIPLINE);
  private readonly requestSelectionDiscipline = inject(REQUEST_SELECTION_DISCIPLINE);
  private readonly bufferingDiscipline = inject(BUFFERING_DISCIPLINE);
  private readonly rejectionDiscipline = inject(REJECTION_DISCIPLINE);
  private readonly requestIntervalRule = inject(REQUEST_INTERVAL_RULE);
  private readonly serviceTimeRule = inject(SERVICE_TIME_RULE);

  public createSource(id: number) {
    return new Source(id, this.requestIntervalRule);
  }

  public createBuffer(capacity: number) {
    return new Buffer(capacity);
  }

  public createDevice(id: number) {
    return new Device(id, this.serviceTimeRule);
  }

  public createBufferingDispatcher(buffer: Buffer) {
    return new BufferingDispatcher(
      buffer,
      this.bufferingDiscipline,
      this.rejectionDiscipline
    );
  }

  public createSelectionDispatcher(devices: Iterable<Device>, buffer: Buffer) {
    return new SelectionDispatcher(
      [...devices],
      buffer,
      this.requestSelectionDiscipline,
      this.deviceSelectionDiscipline
    );
  }
}
