/**
 * ML-DSA-87 Wallet object encapsulating descriptor, seeds and keypair.
 * @module wallet/ml_dsa_87/wallet
 */

/** @typedef {import('../common/descriptor.js').Descriptor} Descriptor */
const randomBytes = require('randombytes');
const { bytesToHex } = require('@noble/hashes/utils.js');
const { mnemonicToBin, binToMnemonic } = require('../misc/mnemonic.js');
const { getAddressFromPKAndDescriptor, addressToString } = require('../common/address.js');
const { Seed, ExtendedSeed } = require('../common/seed.js');
const { newMLDSA87Descriptor } = require('./descriptor.js');
const { keygen, sign, verify } = require('./crypto.js');

class Wallet {
  /**
   * @param {{descriptor: Descriptor, seed: Seed, pk: Uint8Array, sk: Uint8Array}} opts
   */
  constructor({ descriptor, seed, pk, sk }) {
    this.descriptor = descriptor;
    this.seed = seed;
    this.pk = pk;
    this.sk = sk;
    this.extendedSeed = ExtendedSeed.newExtendedSeed(descriptor, seed);
  }

  /**
   * Create a new random wallet(non-deterministic).
   * @param {[number, number]} [metadata=[0,0] ]
   * @returns {Wallet}
   */
  static newWallet(metadata = [0, 0]) {
    const descriptor = newMLDSA87Descriptor(metadata);
    const seedBytes = randomBytes(48);
    const seed = new Seed(seedBytes);
    const { pk, sk } = keygen(seed);
    return new Wallet({ descriptor, seed, pk, sk });
  }

  /**
   * @param {Seed} seed
   * @param {[number, number]} [metadata=[0,0]]
   * @returns {Wallet}
   */
  static newWalletFromSeed(seed, metadata = [0, 0]) {
    const descriptor = newMLDSA87Descriptor(metadata);
    const { pk, sk } = keygen(seed);
    return new Wallet({ descriptor, seed, pk, sk });
  }

  /**
   * @param {ExtendedSeed} extendedSeed
   * @returns {Wallet}
   */
  static newWalletFromExtendedSeed(extendedSeed) {
    const descriptor = extendedSeed.getDescriptor();
    const seed = extendedSeed.getSeed();
    const { pk, sk } = keygen(seed);
    return new Wallet({ descriptor, seed, pk, sk });
  }

  /**
   * @param {string} mnemonic
   * @returns {Wallet}
   */
  static newWalletFromMnemonic(mnemonic) {
    const bin = mnemonicToBin(mnemonic);
    const extendedSeed = new ExtendedSeed(bin);
    return this.newWalletFromExtendedSeed(extendedSeed);
  }

  /** @returns {Uint8Array} */
  getAddress() {
    return getAddressFromPKAndDescriptor(this.pk, this.descriptor);
  }

  /** @returns {string} */
  getAddressStr() {
    return addressToString(this.getAddress());
  }

  /** @returns {Descriptor} */
  getDescriptor() {
    return this.descriptor;
  }

  /** @returns {ExtendedSeed} */
  getExtendedSeed() {
    return this.extendedSeed;
  }

  /** @returns {Seed} */
  getSeed() {
    return this.seed;
  }

  /** @returns {string} hex(ExtendedSeed) */
  getHexExtendedSeed() {
    return `0x${bytesToHex(this.extendedSeed.toBytes())}`;
  }

  /** @returns {string} */
  getMnemonic() {
    return binToMnemonic(this.getExtendedSeed().toBytes());
  }

  /** @returns {Uint8Array} */
  getPK() {
    return this.pk.slice();
  }

  /** @returns {Uint8Array} */
  getSK() {
    return this.sk.slice();
  }

  /**
   * Sign a message.
   * @param {Uint8Array} message
   * @returns {Uint8Array} Signature bytes.
   */
  sign(message) {
    return sign(this.sk, message);
  }

  /**
   * Verify a signature.
   * @param {Uint8Array} signature
   * @param {Uint8Array} message
   * @param {Uint8Array} pk
   * @returns {boolean}
   */
  static verify(signature, message, pk) {
    return verify(signature, message, pk);
  }
}

module.exports = {
  Wallet,
};
