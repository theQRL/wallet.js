/**
 * Address helpers.
 * @module wallet/common/address
 *
 * Address Format:
 *   - String form: "Q" prefix followed by 40 lowercase hex characters (41 chars total)
 *   - Byte form: 20-byte SHAKE-256 hash of (descriptor || public key)
 *   - Output is always lowercase hex; input parsing is case-insensitive for both
 *     the "Q"/"q" prefix and hex characters
 *   - Unlike EIP-55, no checksum encoding is used in the address itself
 */

/** @typedef {import('./descriptor.js').Descriptor} Descriptor */
import { shake256 } from '@noble/hashes/sha3';
import { CryptoPublicKeyBytes } from '@theqrl/mldsa87';
import { ADDRESS_SIZE } from './constants.js';

/**
 * Convert address bytes to string form.
 * @param {Uint8Array} addrBytes
 * @returns {string}
 * @throws {Error} If length mismatch.
 */
function addressToString(addrBytes) {
  if (!addrBytes || addrBytes.length !== ADDRESS_SIZE) {
    throw new Error(`address must be ${ADDRESS_SIZE} bytes`);
  }
  const hex = [...addrBytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `Q${hex}`;
}

/**
 * Convert address string to bytes.
 * @param {string} addrStr - Address string starting with 'Q' followed by 40 hex characters.
 * @returns {Uint8Array} 20-byte address.
 * @throws {Error} If address format is invalid.
 */
function stringToAddress(addrStr) {
  if (typeof addrStr !== 'string') {
    throw new Error('address must be a string');
  }
  const trimmed = addrStr.trim();
  if (!trimmed.startsWith('Q') && !trimmed.startsWith('q')) {
    throw new Error('address must start with Q');
  }
  const hex = trimmed.slice(1);
  if (hex.length !== ADDRESS_SIZE * 2) {
    throw new Error(`address must be Q + ${ADDRESS_SIZE * 2} hex characters, got ${hex.length}`);
  }
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error('address contains invalid characters');
  }
  const bytes = new Uint8Array(ADDRESS_SIZE);
  for (let i = 0; i < ADDRESS_SIZE; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Check if a string is a valid QRL address format.
 * @param {string} addrStr - Address string to validate.
 * @returns {boolean} True if valid address format.
 */
function isValidAddress(addrStr) {
  try {
    stringToAddress(addrStr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Derive an address from a public key and descriptor.
 * @param {Uint8Array} pk
 * @param {Descriptor} descriptor
 * @returns {Uint8Array} 20-byte address.
 * @throws {Error} If pk length mismatch.
 */
function getAddressFromPKAndDescriptor(pk, descriptor) {
  if (!(pk instanceof Uint8Array)) throw new Error('pk must be Uint8Array');

  const walletType = descriptor.type();
  let expectedPKLen;
  switch (walletType) {
    default:
      expectedPKLen = CryptoPublicKeyBytes;
  }
  if (pk.length !== expectedPKLen) {
    throw new Error(`pk must be ${expectedPKLen} bytes for wallet type ${walletType}`);
  }

  const descBytes = descriptor.toBytes();
  const input = new Uint8Array(descBytes.length + pk.length);
  input.set(descBytes, 0);
  input.set(pk, descBytes.length);
  return shake256.create({ dkLen: ADDRESS_SIZE }).update(input).digest();
}

export { addressToString, stringToAddress, isValidAddress, getAddressFromPKAndDescriptor };
