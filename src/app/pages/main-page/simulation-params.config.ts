export type SimulationParam =
  | 'interval'
  | 'end_time'
  | 'sources_number'
  | 'devices_number'
  | 'buffer_capacity'
  | 'a'
  | 'b'
  | 'lambda';

export interface NumericParam {
  min?: number,
  max?: number,
  isInteger?: boolean,
}

export default {
  'interval': { min: 0, max: 5000 },
  'end_time': { min: 0 },
  'sources_number': { min: 0, isInteger: true },
  'devices_number': { min: 0, isInteger: true },
  'buffer_capacity': { min: 0, isInteger: true },
  'a': { min: 0 },
  'b': { min: 0 },
  'lambda': { min: 0, max: 1 },
} satisfies Record<SimulationParam, NumericParam>;
