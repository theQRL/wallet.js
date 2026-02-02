/**
 * @module wallet/ml_dsa_87/crypto
 */

import {
  cryptoSignKeypair,
  cryptoSign,
  cryptoSignVerify,
  CryptoBytes,
  CryptoPublicKeyBytes,
  CryptoSecretKeyBytes,
} from '@theqrl/mldsa87';

/**
 * Generate a keypair.
 *
 * Note: ML-DSA-87 (FIPS 204) requires a 32-byte seed for key generation.
 * QRL uses a 48-byte seed for mnemonic compatibility across wallet types.
 * SHA-256 hashing reduces the 48-byte seed to the required 32 bytes per spec.
 * This matches go-qrllib behavior for cross-implementation compatibility.
 *
 * @returns {{ pk: Uint8Array, sk: Uint8Array }}
 */
function keygen(seed) {
  const pk = new Uint8Array(CryptoPublicKeyBytes);
  const sk = new Uint8Array(CryptoSecretKeyBytes);
  // FIPS 204 requires 32-byte seed; hash 48-byte QRL seed to derive it
  const seedBytes = new Uint8Array(seed.hashSHA256());
  try {
    cryptoSignKeypair(seedBytes, pk, sk);
    return { pk, sk };
  } finally {
    seedBytes.fill(0);
  }
}

/**
 * Check if input is a valid byte array (Uint8Array or Buffer).
 * @param {unknown} input
 * @returns {boolean}
 */
function isBytes(input) {
  return input instanceof Uint8Array;
}

/**
 * Sign a message.
 * @param {Uint8Array} sk - Secret key (must be CryptoSecretKeyBytes bytes)
 * @param {Uint8Array} message - Message to sign
 * @returns {Uint8Array} signature
 * @throws {Error} If sk or message is invalid
 */
function sign(sk, message) {
  if (!isBytes(sk)) {
    throw new Error('sk must be Uint8Array or Buffer');
  }
  if (sk.length !== CryptoSecretKeyBytes) {
    throw new Error(`sk must be ${CryptoSecretKeyBytes} bytes, got ${sk.length}`);
  }
  if (!isBytes(message)) {
    throw new Error('message must be Uint8Array or Buffer');
  }

  const sm = cryptoSign(message, sk);
  let signature = new Uint8Array(CryptoBytes);
  signature = sm.slice(0, CryptoBytes);
  return signature;
}

/**
 * Verify a signature.
 * @param {Uint8Array} signature - Signature to verify (must be CryptoBytes bytes)
 * @param {Uint8Array} message - Original message
 * @param {Uint8Array} pk - Public key (must be CryptoPublicKeyBytes bytes)
 * @returns {boolean}
 * @throws {Error} If signature, message, or pk is invalid
 */
function verify(signature, message, pk) {
  if (!isBytes(signature)) {
    throw new Error('signature must be Uint8Array or Buffer');
  }
  if (signature.length !== CryptoBytes) {
    throw new Error(`signature must be ${CryptoBytes} bytes, got ${signature.length}`);
  }
  if (!isBytes(message)) {
    throw new Error('message must be Uint8Array or Buffer');
  }
  if (!isBytes(pk)) {
    throw new Error('pk must be Uint8Array or Buffer');
  }
  if (pk.length !== CryptoPublicKeyBytes) {
    throw new Error(`pk must be ${CryptoPublicKeyBytes} bytes, got ${pk.length}`);
  }

  const sigBytes = new Uint8Array(signature);
  const msgBytes = new Uint8Array(message);
  const pkBytes = new Uint8Array(pk);
  return cryptoSignVerify(sigBytes, msgBytes, pkBytes);
}

export { keygen, sign, verify };
