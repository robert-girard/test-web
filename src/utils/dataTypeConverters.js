// Data type conversion utilities for signal extraction

import { bitsToUnsignedInt, bitsToSignedInt, bitsToBytes } from './bitOperations.js';
import { DATA_TYPES } from '../constants/plotTypes.js';

/**
 * Convert bits to float16 (IEEE 754 half precision)
 * @param {number[]} bits - 16-bit array
 * @returns {number} Float value
 */
function bitsToFloat16(bits) {
  if (bits.length !== 16) {
    throw new Error('Float16 requires exactly 16 bits');
  }

  const uint16 = bitsToUnsignedInt(bits);

  // Extract components
  const sign = (uint16 >> 15) & 0x1;
  const exponent = (uint16 >> 10) & 0x1F;
  const fraction = uint16 & 0x3FF;

  // Handle special cases
  if (exponent === 0) {
    if (fraction === 0) {
      return sign ? -0 : 0;
    }
    // Subnormal number
    return (sign ? -1 : 1) * Math.pow(2, -14) * (fraction / 1024);
  }

  if (exponent === 0x1F) {
    if (fraction === 0) {
      return sign ? -Infinity : Infinity;
    }
    return NaN;
  }

  // Normal number
  const value = (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + fraction / 1024);
  return value;
}

/**
 * Convert bits to float32 (IEEE 754 single precision)
 * @param {number[]} bits - 32-bit array
 * @returns {number} Float value
 */
function bitsToFloat32(bits) {
  if (bits.length !== 32) {
    throw new Error('Float32 requires exactly 32 bits');
  }

  const bytes = bitsToBytes(bits);

  // Create a DataView to handle float conversion
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  // Set bytes (big-endian)
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, bytes[i]);
  }

  return view.getFloat32(0, false); // false = big-endian
}

/**
 * Convert bit array to the specified data type
 * @param {number[]} bits - Bit array
 * @param {string} dataType - Data type (from DATA_TYPES)
 * @returns {number} Converted value
 */
export function convertBitsToDataType(bits, dataType) {
  switch (dataType) {
    case DATA_TYPES.INT8:
    case DATA_TYPES.INT16:
    case DATA_TYPES.INT24:
    case DATA_TYPES.INT32:
      return bitsToSignedInt(bits);

    case DATA_TYPES.UINT8:
    case DATA_TYPES.UINT16:
    case DATA_TYPES.UINT24:
    case DATA_TYPES.UINT32:
      return bitsToUnsignedInt(bits);

    case DATA_TYPES.FLOAT16:
      return bitsToFloat16(bits);

    case DATA_TYPES.FLOAT32:
      return bitsToFloat32(bits);

    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}

/**
 * Apply scaling and offset to a raw value
 * Formula: physical_value = (raw_value * scale) + offset
 * @param {number} rawValue - Raw extracted value
 * @param {number} scale - Scaling factor
 * @param {number} offset - Offset value
 * @returns {number} Physical value
 */
export function applyScalingAndOffset(rawValue, scale, offset) {
  return (rawValue * scale) + offset;
}

/**
 * Validate that bits match expected data type length
 * @param {number[]} bits - Bit array
 * @param {string} dataType - Data type
 * @throws {Error} If bit length doesn't match data type
 */
export function validateBitLength(bits, dataType) {
  const expectedLength = parseInt(dataType.match(/\d+/)[0], 10);

  if (bits.length !== expectedLength) {
    throw new Error(
      `Bit length mismatch: expected ${expectedLength} bits for ${dataType}, got ${bits.length} bits`
    );
  }
}
