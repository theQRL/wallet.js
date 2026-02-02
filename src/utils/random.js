/**
 * Secure random number generation for browser and Node.js environments.
 * Requires Web Crypto API (globalThis.crypto.getRandomValues).
 * @module utils/random
 */

const MAX_BYTES = 65536;
const MAX_UINT32 = 0xffffffff;

function getWebCrypto() {
  if (typeof globalThis === 'object' && globalThis.crypto) return globalThis.crypto;
  return null;
}

/**
 * Generate cryptographically secure random bytes.
 *
 * Uses Web Crypto API (getRandomValues) exclusively.
 * Throws if Web Crypto API is unavailable.
 *
 * @param {number} size - Number of random bytes to generate
 * @returns {Uint8Array} Random bytes
 * @throws {RangeError} If size is invalid or too large
 * @throws {Error} If no secure random source is available or RNG output is suspect
 */
export function randomBytes(size) {
  if (!Number.isSafeInteger(size) || size < 0) {
    throw new RangeError('size must be a non-negative integer');
  }
  if (size > MAX_UINT32) {
    throw new RangeError('requested too many random bytes');
  }
  if (size === 0) return new Uint8Array(0);

  const cryptoObj = getWebCrypto();
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const out = new Uint8Array(size);
    for (let i = 0; i < size; i += MAX_BYTES) {
      cryptoObj.getRandomValues(out.subarray(i, Math.min(size, i + MAX_BYTES)));
    }
    if (size >= 16) {
      let acc = 0;
      for (let i = 0; i < 16; i++) acc |= out[i];
      if (acc === 0) throw new Error('getRandomValues returned all zeros');
    }
    return out;
  }

  throw new Error('Secure random number generation is not supported by this environment');
}
