/**
 * Secure random number generation for browser and Node.js environments.
 * @module utils/random
 */

const MAX_BYTES = 65536;
const MAX_UINT32 = 0xffffffff;

function getGlobalScope() {
  if (typeof globalThis === 'object') return globalThis;
  // eslint-disable-next-line no-restricted-globals
  if (typeof self === 'object') return self;
  if (typeof window === 'object') return window;
  if (typeof global === 'object') return global;
  return {};
}

function getWebCrypto() {
  const scope = getGlobalScope();
  return scope.crypto || scope.msCrypto || null;
}

function getNodeRandomBytes() {
  /* c8 ignore next */
  const isNode = typeof process === 'object' && process !== null && process.versions && process.versions.node;
  if (!isNode) return null;

  let req = null;
  if (typeof module !== 'undefined' && module && typeof module.require === 'function') {
    req = module.require.bind(module);
  } else if (typeof module !== 'undefined' && module && typeof module.createRequire === 'function') {
    req = module.createRequire(import.meta.url);
  } else if (typeof require === 'function') {
    req = require;
  }
  if (!req) return null;

  try {
    const nodeCrypto = req('crypto');
    if (nodeCrypto && typeof nodeCrypto.randomBytes === 'function') {
      return nodeCrypto.randomBytes;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Generate cryptographically secure random bytes.
 *
 * Uses Web Crypto API (getRandomValues) in browsers and crypto.randomBytes in Node.js.
 *
 * @param {number} size - Number of random bytes to generate
 * @returns {Uint8Array} Random bytes
 * @throws {RangeError} If size is invalid or too large
 * @throws {Error} If no secure random source is available
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
    return out;
  }

  const nodeRandomBytes = getNodeRandomBytes();
  if (nodeRandomBytes) {
    return nodeRandomBytes(size);
  }

  throw new Error('Secure random number generation is not supported by this environment');
}
