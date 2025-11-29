// Signal extraction facade - main entry point for extracting signals from CAN data

import {
  hexToBitArray,
  extractBits,
  reverseBytesInBits,
  getDataTypeBitLength
} from './bitOperations.js';
import {
  convertBitsToDataType,
  applyScalingAndOffset,
  validateBitLength
} from './dataTypeConverters.js';
import { DATA_TYPE_INFO, ENDIANNESS } from '../constants/plotTypes.js';

/**
 * Extract a single signal from CAN messages based on configuration
 * @param {Array} messages - Array of CAN message objects with {timestamp, arbitration_id, payload, length}
 * @param {Object} config - Signal configuration
 * @param {string} config.arbid - Arbitration ID to filter by (e.g., "0x123")
 * @param {number} config.startBit - Starting bit position (0-indexed)
 * @param {string} config.dataType - Data type (from DATA_TYPES)
 * @param {string} config.endianness - Byte order ('big' or 'little')
 * @param {number} config.scale - Scaling factor (default: 1.0)
 * @param {number} config.offset - Offset value (default: 0.0)
 * @param {string} config.name - Signal name (optional)
 * @param {string} config.id - Unique signal ID
 * @returns {Object} Signal data with {signalId, signalName, dataPoints[]}
 */
export function extractSignal(messages, config) {
  const {
    arbid,
    startBit,
    dataType,
    endianness,
    scale = 1.0,
    offset = 0.0,
    name = 'Unnamed Signal',
    id
  } = config;

  // Validate configuration
  if (!arbid || startBit === undefined || !dataType || !endianness) {
    throw new Error('Invalid signal configuration: missing required fields');
  }

  // Get bit length for the data type
  const bitLength = getDataTypeBitLength(dataType);

  // Filter messages by ArbID
  const filteredMessages = messages.filter(msg =>
    msg.arbitration_id.toLowerCase() === arbid.toLowerCase()
  );

  // Extract data points
  const dataPoints = [];

  for (const message of filteredMessages) {
    try {
      // Convert hex payload to bit array
      const bitArray = hexToBitArray(message.payload);

      // Extract the relevant bits
      let extractedBits = extractBits(bitArray, startBit, bitLength);

      // Validate bit length
      validateBitLength(extractedBits, dataType);

      // Handle endianness
      if (endianness === ENDIANNESS.LITTLE && bitLength % 8 === 0) {
        extractedBits = reverseBytesInBits(extractedBits);
      }

      // Convert to data type
      const rawValue = convertBitsToDataType(extractedBits, dataType);

      // Apply scaling and offset
      const physicalValue = applyScalingAndOffset(rawValue, scale, offset);

      // Add data point
      dataPoints.push({
        timestamp: message.timestamp,
        rawValue,
        physicalValue
      });
    } catch (error) {
      console.warn(`Failed to extract signal from message at ${message.timestamp}:`, error.message);
      // Continue processing other messages
    }
  }

  return {
    signalId: id,
    signalName: name,
    dataPoints
  };
}

/**
 * Extract multiple signals from CAN messages
 * @param {Array} messages - Array of CAN message objects
 * @param {Array} configs - Array of signal configurations
 * @returns {Array} Array of signal data objects
 */
export function extractMultipleSignals(messages, configs) {
  return configs.map(config => extractSignal(messages, config));
}

/**
 * Get unique ArbIDs from CAN messages
 * @param {Array} messages - Array of CAN message objects
 * @returns {Array} Sorted array of unique ArbID strings
 */
export function getUniqueArbIds(messages) {
  const arbIds = new Set();
  messages.forEach(msg => arbIds.add(msg.arbitration_id));
  return Array.from(arbIds).sort();
}

/**
 * Get the maximum payload size (in bits) for a specific ArbID
 * @param {Array} messages - Array of CAN message objects
 * @param {string} arbid - Arbitration ID
 * @returns {number} Maximum payload size in bits
 */
export function getMaxPayloadSize(messages, arbid) {
  const filteredMessages = messages.filter(msg =>
    msg.arbitration_id.toLowerCase() === arbid.toLowerCase()
  );

  if (filteredMessages.length === 0) {
    return 64; // Default to 8 bytes = 64 bits
  }

  // Find the maximum length
  const maxLength = Math.max(...filteredMessages.map(msg => msg.length || 8));
  return maxLength * 8; // Convert bytes to bits
}

/**
 * Validate a signal configuration
 * @param {Object} config - Signal configuration
 * @param {Array} messages - Array of CAN message objects
 * @returns {Object} {valid: boolean, errors: string[]}
 */
export function validateSignalConfig(config, messages) {
  const errors = [];

  // Check required fields
  if (!config.arbid) errors.push('ArbID is required');
  if (config.startBit === undefined || config.startBit === null) {
    errors.push('Start bit is required');
  }
  if (!config.dataType) errors.push('Data type is required');
  if (!config.endianness) errors.push('Endianness is required');

  // Check if ArbID exists in messages
  if (config.arbid && messages.length > 0) {
    const arbidExists = messages.some(msg =>
      msg.arbitration_id.toLowerCase() === config.arbid.toLowerCase()
    );
    if (!arbidExists) {
      errors.push(`ArbID ${config.arbid} not found in data`);
    }
  }

  // Check bit range
  if (config.arbid && config.startBit !== undefined && config.dataType) {
    const maxPayloadSize = getMaxPayloadSize(messages, config.arbid);
    const bitLength = getDataTypeBitLength(config.dataType);

    if (config.startBit < 0) {
      errors.push('Start bit must be non-negative');
    }

    if (config.startBit + bitLength > maxPayloadSize) {
      errors.push(
        `Bit range (${config.startBit} + ${bitLength}) exceeds payload size (${maxPayloadSize} bits)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
