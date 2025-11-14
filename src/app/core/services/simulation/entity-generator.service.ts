import {inject, Injectable} from '@angular/core';
import {EntityService} from '@app/services/entity';

type EntityWithId = { readonly id: number };

@Injectable({
  providedIn: 'root',
})
export class EntityGeneratorService {
  private entityService = inject(EntityService);

  public *generateDevices(count: number) {
    for (let i = 0; i < count; ++i) {
      yield this.entityService.createDevice(i + 1);
    }
  }

  public *generateSources(count: number) {
    for (let i = 0; i < count; ++i) {
      yield this.entityService.createSource(i + 1);
    }
  }

  public *generateIndexedDevices(count: number) {
    const devices = this.generateDevices(count);
    for (const entry of this.createEntries(devices)) {
      yield entry;
    }
  }

  public *generateIndexedSources(count: number) {
    const sources = this.generateSources(count);
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
