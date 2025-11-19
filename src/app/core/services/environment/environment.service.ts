import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  public hasProcess(name: string): boolean {
    try {
      return process.versions[name] !== undefined;
    } catch {
      return false;
    }
  }
}
