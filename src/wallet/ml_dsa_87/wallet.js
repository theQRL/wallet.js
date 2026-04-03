/**
 * ML-DSA-87 Wallet object encapsulating descriptor, seeds and keypair.
 * @module wallet/ml_dsa_87/wallet
 */

import { bytesToHex } from '@noble/hashes/utils.js';
import { randomBytes } from '../../utils/random.js';
import { mnemonicToBin, binToMnemonic } from '../misc/mnemonic.js';
import { getAddressFromPKAndDescriptor, addressToString } from '../common/address.js';
import { Descriptor } from '../common/descriptor.js';
import { Seed, ExtendedSeed } from '../common/seed.js';
import { newMLDSA87Descriptor } from './descriptor.js';
import { keygen, sign, verify } from './crypto.js';

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
    /** @private */
    this._zeroized = false;
  }

  /**
   * Create a new random wallet(non-deterministic).
   * @param {[number, number]} [metadata=[0,0] ]
   * @returns {Wallet}
   */
  static newWallet(metadata = [0, 0]) {
    const descriptor = newMLDSA87Descriptor(metadata);
    const seedBytes = randomBytes(48);
    try {
      const seed = new Seed(seedBytes);
      const { pk, sk } = keygen(seed);
      return new Wallet({ descriptor, seed, pk, sk });
    } finally {
      seedBytes.fill(0);
    }
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
    try {
      const extendedSeed = new ExtendedSeed(bin);
      return this.newWalletFromExtendedSeed(extendedSeed);
    } finally {
      bin.fill(0);
    }
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
    return new Descriptor(this.descriptor.toBytes());
  }

  /**
   * @private
   * @throws {Error} If the wallet has been zeroized.
   */
  _requireLive() {
    if (this._zeroized) {
      throw new Error('Wallet has been zeroized');
    }
  }

  /** @returns {ExtendedSeed} */
  getExtendedSeed() {
    this._requireLive();
    return ExtendedSeed.from(this.extendedSeed.toBytes());
  }

  /** @returns {Seed} */
  getSeed() {
    this._requireLive();
    return new Seed(this.seed.toBytes());
  }

  /** @returns {string} hex(ExtendedSeed) */
  getHexExtendedSeed() {
    this._requireLive();
    return `0x${bytesToHex(this.getExtendedSeed().toBytes())}`;
  }

  /** @returns {string} */
  getMnemonic() {
    this._requireLive();
    return binToMnemonic(this.getExtendedSeed().toBytes());
  }

  /** @returns {Uint8Array} */
  getPK() {
    return this.pk.slice();
  }

  /**
   * Returns a copy of the secret key.
   * @returns {Uint8Array}
   * @warning Caller is responsible for zeroing the returned buffer when done
   * (e.g. `sk.fill(0)`). The Wallet's `zeroize()` method cannot reach copies
   * returned by this method.
   */
  getSK() {
    this._requireLive();
    return this.sk.slice();
  }

  /**
   * Sign a message.
   * @param {Uint8Array} message
   * @returns {Uint8Array} Signature bytes.
   */
  sign(message) {
    this._requireLive();
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

  /**
   * Securely zeroize sensitive key material.
   * Call this when the wallet is no longer needed to minimize
   * the window where secrets exist in memory.
   *
   * Note: JavaScript garbage collection may retain copies;
   * this provides best-effort zeroization.
   */
  zeroize() {
    if (this.sk) {
      this.sk.fill(0);
      this.sk = null;
    }
    if (this.seed) {
      this.seed.zeroize();
      this.seed = null;
    }
    if (this.extendedSeed) {
      this.extendedSeed.zeroize();
      this.extendedSeed = null;
    }
    this._zeroized = true;
  }
}

export { Wallet };
