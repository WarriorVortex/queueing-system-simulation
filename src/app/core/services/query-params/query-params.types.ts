import {Signal, WritableSignal} from '@angular/core';

export type ReactiveParams = Record<string, WritableSignal<unknown> | Signal<unknown>>;

export interface QueryParamsBindOptions {
  write?: boolean,
  read?: boolean,
  parseFn?: ParseFn,
  stringifyFn?: StringifyFn,
}

export type TransformFn<F, T> = (value: F, key: string) => T;
export type ParseFn = TransformFn<string, unknown>;
export type StringifyFn = TransformFn<unknown, string>;
