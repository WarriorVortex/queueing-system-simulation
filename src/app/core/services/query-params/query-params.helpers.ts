import {Signal, WritableSignal} from "@angular/core";
import {InputReactiveParams, OutputReactiveParams} from './query-params.types';

export default class QueryParamsHelpers {
  static parse(value: string): unknown {
    try {
      return JSON.parse;
    } catch {
      return value;
    }
  }

  static stringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return value?.toString() ?? value as string;
    }
  }

  static isWritable<T>(value: WritableSignal<T> | Signal<T>) {
    return 'set' in value;
  }
}

export type InnerReactiveParams = Record<string, WritableSignal<unknown>>;
export type OuterReactiveParams = OutputReactiveParams;

export interface BindProcessed {
  inner: InnerReactiveParams,
  outer: OuterReactiveParams,
  initial: InputReactiveParams,
}
