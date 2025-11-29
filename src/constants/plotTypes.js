// Data type definitions for signal extraction

export const DATA_TYPES = {
  // Signed integers
  INT8: 'int8',
  INT16: 'int16',
  INT24: 'int24',
  INT32: 'int32',

  // Unsigned integers
  UINT8: 'uint8',
  UINT16: 'uint16',
  UINT24: 'uint24',
  UINT32: 'uint32',

  // Floating point
  FLOAT16: 'float16',
  FLOAT32: 'float32',
};

export const DATA_TYPE_INFO = {
  [DATA_TYPES.INT8]: { bits: 8, signed: true, float: false },
  [DATA_TYPES.INT16]: { bits: 16, signed: true, float: false },
  [DATA_TYPES.INT24]: { bits: 24, signed: true, float: false },
  [DATA_TYPES.INT32]: { bits: 32, signed: true, float: false },
  [DATA_TYPES.UINT8]: { bits: 8, signed: false, float: false },
  [DATA_TYPES.UINT16]: { bits: 16, signed: false, float: false },
  [DATA_TYPES.UINT24]: { bits: 24, signed: false, float: false },
  [DATA_TYPES.UINT32]: { bits: 32, signed: false, float: false },
  [DATA_TYPES.FLOAT16]: { bits: 16, signed: true, float: true },
  [DATA_TYPES.FLOAT32]: { bits: 32, signed: true, float: true },
};

export const DATA_TYPE_OPTIONS = [
  { value: DATA_TYPES.INT8, label: 'int8 (8-bit signed)' },
  { value: DATA_TYPES.INT16, label: 'int16 (16-bit signed)' },
  { value: DATA_TYPES.INT24, label: 'int24 (24-bit signed)' },
  { value: DATA_TYPES.INT32, label: 'int32 (32-bit signed)' },
  { value: DATA_TYPES.UINT8, label: 'uint8 (8-bit unsigned)' },
  { value: DATA_TYPES.UINT16, label: 'uint16 (16-bit unsigned)' },
  { value: DATA_TYPES.UINT24, label: 'uint24 (24-bit unsigned)' },
  { value: DATA_TYPES.UINT32, label: 'uint32 (32-bit unsigned)' },
  { value: DATA_TYPES.FLOAT16, label: 'float16 (half precision)' },
  { value: DATA_TYPES.FLOAT32, label: 'float32 (single precision)' },
];

export const ENDIANNESS = {
  BIG: 'big',
  LITTLE: 'little',
};

export const ENDIANNESS_OPTIONS = [
  { value: ENDIANNESS.BIG, label: 'Big Endian (MSB first)' },
  { value: ENDIANNESS.LITTLE, label: 'Little Endian (LSB first)' },
];

// Color palette for signals
export const SIGNAL_COLORS = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // yellow-green
  '#17becf', // cyan
];
