/**
 * Shared byte/hex utils used across modules.
 * @module utils/bytes
 */

const { hexToBytes } = require('@noble/hashes/utils');

/**
 * @param {unknown} input
 * @returns {boolean}
 */
function isUint8(input) {
  return input instanceof Uint8Array || Buffer.isBuffer(input);
}

/**
 * Accepts strings with optional 0x/0X prefix and separators(space, :, _, -).
 * @param {unknown} input
 * @returns {boolean}
 */
function isHexLike(input) {
  if (typeof input !== 'string') return false;
  const s = input.trim().replace(/^0x/i, '');
  return /^[0-9a-fA-F\s:_-]*$/.test(s);
}

/**
 * Remove 0x prefix and all non-hex chars.
 * @param {string} hex
 * @returns {string}
 */
function cleanHex(hex) {
  return hex.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
}

/**
 * Convert various inputs to a fixed-length byte array.
 * Supports hex string(with/without 0x), Uint8Array, Buffer, number[].
 * @param {string|Uint8Array|Buffer|number[]} input
 * @param {number} expectedLen
 * @param {string} [label='bytes']
 * @returns {Uint8Array}
 */
function toFixedU8(input, expectedLen, label = 'bytes') {
  let bytes;
  if (isUint8(input)) {
    bytes = new Uint8Array(input);
  } else if (isHexLike(input)) {
    bytes = hexToBytes(cleanHex(input));
  } else if (Array.isArray(input)) {
    bytes = Uint8Array.from(input);
  } else {
    throw new Error(`${label}: unsupported input type; pass hex string or Uint8Array/Buffer`);
  }
  if (bytes.length !== expectedLen) {
    throw new Error(`${label}: expected ${expectedLen} bytes, got ${bytes.length}`);
  }
  return bytes;
}

module.exports = {
  isUint8,
  isHexLike,
  cleanHex,
  toFixedU8,
};
