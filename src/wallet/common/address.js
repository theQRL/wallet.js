/**
 * Address helpers.
 * @module wallet/common/address
 */

/** @typedef {import('./common/descriptor.js').Descriptor} Descriptor */
const { SHAKE } = require('sha3');
const { CryptoPublicKeyBytes } = require('@theqrl/mldsa87');
const { ADDRESS_SIZE } = require('./constants.js');

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
  const digest = new SHAKE(256).update(Buffer.from(input)).digest();
  return new Uint8Array(digest).slice(0, ADDRESS_SIZE);
}

module.exports = {
  addressToString,
  getAddressFromPKAndDescriptor,
};
