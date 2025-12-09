import {Signal, WritableSignal} from '@angular/core';

type ReactiveParams<Nullable> = {
  [p: string]: WritableSignal<unknown> | Signal<unknown> | (Nullable extends true ? null : never);
};
export type InputReactiveParams = ReactiveParams<true>;
export type OutputReactiveParams = ReactiveParams<false>;

export interface QueryParamsBindOptions {
  write?: boolean,
  read?: boolean,
  parseFn?: ParseFn,
  stringifyFn?: StringifyFn,
}

export type TransformFn<F, T> = (value: F, key: string) => T;
export type ParseFn = TransformFn<string, unknown>;
export type StringifyFn = TransformFn<unknown, string>;

export type ReadWriteConfig = Required<Pick<QueryParamsBindOptions, 'read' | 'write'>>;

export default {
  write: true,
  read: true,
} as const satisfies ReadWriteConfig;
