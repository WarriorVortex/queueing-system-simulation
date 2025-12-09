import {inject, Injectable} from '@angular/core';
import {EntityService} from '@app/services/entity/index';

type EntityWithId = { readonly id: number };

@Injectable({
  providedIn: 'root',
})
export class EntityGeneratorService {
  private entityService = inject(EntityService);

  public *generateDevices(count: number, startIndex: number = 0) {
    for (let i = 0; i < count; ++i) {
      yield this.entityService.createDevice(i + startIndex);
    }
  }

  public *generateSources(count: number, startIndex: number = 0) {
    for (let i = 0; i < count; ++i) {
      yield this.entityService.createSource(i + startIndex);
    }
  }

  public *generateIndexedDevices(count: number, startIndex: number = 0) {
    const devices = this.generateDevices(count, startIndex);
    for (const entry of this.createEntries(devices)) {
      yield entry;
    }
  }

  public *generateIndexedSources(count: number, startIndex: number = 0) {
    const sources = this.generateSources(count, startIndex);
    for (const entry of this.createEntries(sources)) {
      yield entry;
    }
  }

  private *createEntries<T extends EntityWithId>(iter: Iterable<T>): Generator<[number, T], void, unknown> {
    for (const value of iter) {
      yield [value.id, value];
    }
  }
}
