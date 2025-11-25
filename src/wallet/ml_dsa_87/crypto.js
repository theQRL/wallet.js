/**
 * @module wallet/ml_dsa_87/crypto
 */

const {
  cryptoSignKeypair,
  cryptoSign,
  cryptoSignVerify,
  CryptoBytes,
  CryptoPublicKeyBytes,
  CryptoSecretKeyBytes,
} = require('@theqrl/mldsa87');

/**
 * Generate a keypair.
 * @returns {{ pk: Uint8Array, sk: Uint8Array }}
 */
function keygen(seed) {
  const pk = new Uint8Array(CryptoPublicKeyBytes);
  const sk = new Uint8Array(CryptoSecretKeyBytes);
  const seedBuf = Buffer.from(seed.hashSHA256());
  cryptoSignKeypair(seedBuf, pk, sk);
  return { pk, sk };
}

/**
 * Sign a message.
 * @param {Uint8Array} sk
 * @param {Uint8Array} message
 * @returns {Uint8Array} signature
 */
function sign(sk, message) {
  const sm = cryptoSign(message, sk);
  let signature = new Uint8Array(CryptoBytes);
  signature = sm.slice(0, CryptoBytes);
  return signature;
}

/**
 * Verify a signature.
 * @param {Uint8Array} signature
 * @param {Uint8Array} message
 * @param {Uint8Array} pk
 * @returns {boolean}
 */
function verify(signature, message, pk) {
  const sigBuf = Buffer.from(signature);
  const msgBuf = Buffer.from(message);
  const pkBuf = Buffer.from(pk);
  return cryptoSignVerify(sigBuf, msgBuf, pkBuf);
}

module.exports = {
  keygen,
  sign,
  verify,
};
