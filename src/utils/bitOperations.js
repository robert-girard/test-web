// Bit manipulation utilities for signal extraction

/**
 * Convert a hex string to a bit array
 * @param {string} hexString - Hex string (e.g., "0123456789ABCDEF")
 * @returns {number[]} Array of bits (0 or 1)
 */
export function hexToBitArray(hexString) {
  // Remove 0x prefix if present
  hexString = hexString.replace(/^0x/i, '');

  const bitArray = [];
  for (let i = 0; i < hexString.length; i++) {
    const hexDigit = hexString[i];
    const value = parseInt(hexDigit, 16);

    // Convert to 4 bits (each hex digit = 4 bits)
    for (let bit = 3; bit >= 0; bit--) {
      bitArray.push((value >> bit) & 1);
    }
  }

  return bitArray;
}

/**
 * Extract a range of bits from a bit array
 * @param {number[]} bitArray - Array of bits
 * @param {number} startBit - Starting bit position (0-indexed)
 * @param {number} bitLength - Number of bits to extract
 * @returns {number[]} Extracted bits
 */
export function extractBits(bitArray, startBit, bitLength) {
  if (startBit < 0 || startBit >= bitArray.length) {
    throw new Error(`Invalid start bit: ${startBit}`);
  }

  if (startBit + bitLength > bitArray.length) {
    throw new Error(`Bit range exceeds payload size: ${startBit} + ${bitLength} > ${bitArray.length}`);
  }

  return bitArray.slice(startBit, startBit + bitLength);
}

/**
 * Convert a bit array to an unsigned integer
 * @param {number[]} bits - Array of bits (MSB first)
 * @returns {number} Unsigned integer value
 */
export function bitsToUnsignedInt(bits) {
  let value = 0;
  for (let i = 0; i < bits.length; i++) {
    value = (value << 1) | bits[i];
  }
  return value;
}

/**
 * Convert a bit array to a signed integer (two's complement)
 * @param {number[]} bits - Array of bits (MSB first)
 * @returns {number} Signed integer value
 */
export function bitsToSignedInt(bits) {
  const unsignedValue = bitsToUnsignedInt(bits);
  const bitLength = bits.length;
  const signBit = bits[0];

  // If sign bit is 1, convert from two's complement
  if (signBit === 1) {
    const maxValue = Math.pow(2, bitLength);
    return unsignedValue - maxValue;
  }

  return unsignedValue;
}

/**
 * Reverse byte order for little-endian conversion
 * @param {number[]} bits - Array of bits
 * @returns {number[]} Bits with reversed byte order
 */
export function reverseBytesInBits(bits) {
  if (bits.length % 8 !== 0) {
    throw new Error('Bit array length must be a multiple of 8 for byte reversal');
  }

  const numBytes = bits.length / 8;
  const reversedBits = [];

  // Reverse byte order
  for (let i = numBytes - 1; i >= 0; i--) {
    const byteStart = i * 8;
    reversedBits.push(...bits.slice(byteStart, byteStart + 8));
  }

  return reversedBits;
}

/**
 * Convert bits to bytes array
 * @param {number[]} bits - Array of bits
 * @returns {number[]} Array of byte values (0-255)
 */
export function bitsToBytes(bits) {
  if (bits.length % 8 !== 0) {
    throw new Error('Bit array length must be a multiple of 8');
  }

  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bitsToUnsignedInt(bits.slice(i, i + 8));
    bytes.push(byte);
  }

  return bytes;
}

/**
 * Get the bit length for a data type
 * @param {string} dataType - Data type string (e.g., 'int16', 'uint8')
 * @returns {number} Number of bits
 */
export function getDataTypeBitLength(dataType) {
  const match = dataType.match(/\d+/);
  if (!match) {
    throw new Error(`Invalid data type: ${dataType}`);
  }
  return parseInt(match[0], 10);
}
