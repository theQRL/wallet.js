/**
 * Tests for the configurable address-size API.
 *
 * wallet.js 3.x changed the address length from 20 bytes (NIST Category 1)
 * to 48 bytes (NIST Category 5), silently breaking callers that depended on
 * the v2.x contract. The address size is now configurable, defaulting back
 * to 20 bytes so code that does not specify an explicit size matches v2.x.
 * Callers needing 48-byte Category-5 collision resistance opt in via the
 * `addressSize` parameter.
 */
import { expect } from 'chai';
import { bytesToHex } from '@noble/hashes/utils.js';
import { CryptoPublicKeyBytes } from '@theqrl/mldsa87';
import { walletTestCases } from '../fixtures/ml_dsa_87.fixtures.js';
import { Wallet as MLDSA87 } from '../../src/wallet/ml_dsa_87/wallet.js';
import { newWalletFromExtendedSeed } from '../../src/wallet/factory.js';
import { getAddressFromPKAndDescriptor, addressToString, stringToAddress } from '../../src/wallet/common/address.js';
import { Descriptor } from '../../src/wallet/common/descriptor.js';
import { Seed, ExtendedSeed } from '../../src/wallet/common/seed.js';
import {
  ADDRESS_SIZE,
  ADDRESS_SIZE_CATEGORY_1,
  ADDRESS_SIZE_CATEGORY_5,
  DEFAULT_ADDRESS_SIZE,
} from '../../src/wallet/common/constants.js';

const tc = walletTestCases[0];

describe('configurable address size', () => {
  describe('constants', () => {
    it('NIST Category 1 = 20 bytes', () => {
      expect(ADDRESS_SIZE_CATEGORY_1).to.equal(20);
    });

    it('NIST Category 5 = 48 bytes', () => {
      expect(ADDRESS_SIZE_CATEGORY_5).to.equal(48);
    });

    it('default equals Category 1 (v2.x contract)', () => {
      expect(DEFAULT_ADDRESS_SIZE).to.equal(ADDRESS_SIZE_CATEGORY_1);
      expect(DEFAULT_ADDRESS_SIZE).to.equal(20);
    });

    it('legacy ADDRESS_SIZE alias tracks the default', () => {
      expect(ADDRESS_SIZE).to.equal(DEFAULT_ADDRESS_SIZE);
    });
  });

  describe('getAddressFromPKAndDescriptor', () => {
    it('defaults to 20-byte address when addressSize is omitted', () => {
      const pk = new Uint8Array(CryptoPublicKeyBytes).fill(0xab);
      const desc = new Descriptor(Uint8Array.from([1, 0, 0]));
      const addr = getAddressFromPKAndDescriptor(pk, desc);
      expect(addr.length).to.equal(20);
    });

    it('returns exact requested length for 20, 32, and 48 byte sizes', () => {
      const pk = new Uint8Array(CryptoPublicKeyBytes).fill(0xab);
      const desc = new Descriptor(Uint8Array.from([1, 0, 0]));
      for (const size of [20, 32, 48]) {
        expect(getAddressFromPKAndDescriptor(pk, desc, size).length).to.equal(size);
      }
    });

    it('20-byte address is a prefix of the 48-byte address (SHAKE-256 XOF property)', () => {
      const pk = new Uint8Array(CryptoPublicKeyBytes).fill(0xab);
      const desc = new Descriptor(Uint8Array.from([1, 0, 0]));
      const addr20 = bytesToHex(getAddressFromPKAndDescriptor(pk, desc, 20));
      const addr48 = bytesToHex(getAddressFromPKAndDescriptor(pk, desc, 48));
      expect(addr48.startsWith(addr20)).to.equal(true);
    });

    it('rejects zero, negative, or non-integer addressSize', () => {
      const pk = new Uint8Array(CryptoPublicKeyBytes).fill(0xab);
      const desc = new Descriptor(Uint8Array.from([1, 0, 0]));
      expect(() => getAddressFromPKAndDescriptor(pk, desc, 0)).to.throw('addressSize must be a positive integer');
      expect(() => getAddressFromPKAndDescriptor(pk, desc, -1)).to.throw('addressSize must be a positive integer');
      expect(() => getAddressFromPKAndDescriptor(pk, desc, 2.5)).to.throw('addressSize must be a positive integer');
      expect(() => getAddressFromPKAndDescriptor(pk, desc, NaN)).to.throw('addressSize must be a positive integer');
      expect(() => getAddressFromPKAndDescriptor(pk, desc, '48')).to.throw('addressSize must be a positive integer');
    });
  });

  describe('Wallet constructor', () => {
    it('stores addressSize on the instance and uses it for getAddress()', () => {
      const w = MLDSA87.newWalletFromMnemonic(tc.wantMnemonic);
      expect(w.addressSize).to.equal(20);
      expect(w.getAddress().length).to.equal(20);
      expect(w.getAddressStr()).to.equal(tc.wantAddress);
      w.zeroize();
    });

    it('accepts addressSize: 48 for NIST Category 5', () => {
      const w = MLDSA87.newWalletFromMnemonic(tc.wantMnemonic, ADDRESS_SIZE_CATEGORY_5);
      expect(w.addressSize).to.equal(48);
      expect(w.getAddress().length).to.equal(48);
      expect(w.getAddressStr()).to.equal(tc.wantAddress48);
      w.zeroize();
    });

    it('rejects invalid addressSize when constructed directly', () => {
      const seed = new Seed(new Uint8Array(48).fill(1));
      expect(
        () =>
          new MLDSA87({
            descriptor: new Descriptor(Uint8Array.from([1, 0, 0])),
            seed,
            pk: new Uint8Array(CryptoPublicKeyBytes),
            sk: new Uint8Array(100),
            addressSize: 0,
          })
      ).to.throw('addressSize must be a positive integer');
    });
  });

  describe('Wallet static factories', () => {
    it('newWallet() defaults to 20 bytes', () => {
      const w = MLDSA87.newWallet();
      expect(w.addressSize).to.equal(20);
      expect(w.getAddress().length).to.equal(20);
      w.zeroize();
    });

    it('newWallet(metadata, 48) produces 48-byte addresses', () => {
      const w = MLDSA87.newWallet([0, 0], ADDRESS_SIZE_CATEGORY_5);
      expect(w.addressSize).to.equal(48);
      expect(w.getAddress().length).to.equal(48);
      w.zeroize();
    });

    it('newWalletFromSeed() defaults to 20 bytes and honors opt-in to 48', () => {
      const seed = new Seed(new Uint8Array(48).fill(0x11));
      const wDefault = MLDSA87.newWalletFromSeed(seed);
      const wCat5 = MLDSA87.newWalletFromSeed(seed, [0, 0], ADDRESS_SIZE_CATEGORY_5);
      expect(wDefault.getAddressStr().length - 1).to.equal(40);
      expect(wCat5.getAddressStr().length - 1).to.equal(96);
      // Same seed, same pk — 20-byte address must be a prefix of the 48-byte one.
      expect(wCat5.getAddressStr().slice(1)).to.match(new RegExp(`^${wDefault.getAddressStr().slice(1)}`));
      wDefault.zeroize();
      wCat5.zeroize();
    });

    it('newWalletFromExtendedSeed() defaults to 20 bytes and honors opt-in to 48', () => {
      const ext = ExtendedSeed.from(tc.extendedSeed);
      const wDefault = MLDSA87.newWalletFromExtendedSeed(ext);
      const wCat5 = MLDSA87.newWalletFromExtendedSeed(ext, ADDRESS_SIZE_CATEGORY_5);
      expect(wDefault.getAddressStr()).to.equal(tc.wantAddress);
      expect(wCat5.getAddressStr()).to.equal(tc.wantAddress48);
      wDefault.zeroize();
      wCat5.zeroize();
    });

    it('newWalletFromMnemonic() defaults to 20 bytes and honors opt-in to 48', () => {
      const wDefault = MLDSA87.newWalletFromMnemonic(tc.wantMnemonic);
      const wCat5 = MLDSA87.newWalletFromMnemonic(tc.wantMnemonic, ADDRESS_SIZE_CATEGORY_5);
      expect(wDefault.getAddressStr()).to.equal(tc.wantAddress);
      expect(wCat5.getAddressStr()).to.equal(tc.wantAddress48);
      wDefault.zeroize();
      wCat5.zeroize();
    });
  });

  describe('auto-select factory', () => {
    it('newWalletFromExtendedSeed() auto-select defaults to 20 bytes', () => {
      const w = newWalletFromExtendedSeed(tc.extendedSeed);
      expect(w.getAddressStr()).to.equal(tc.wantAddress);
      w.zeroize();
    });

    it('newWalletFromExtendedSeed() auto-select honors opt-in to 48 bytes', () => {
      const w = newWalletFromExtendedSeed(tc.extendedSeed, ADDRESS_SIZE_CATEGORY_5);
      expect(w.getAddressStr()).to.equal(tc.wantAddress48);
      w.zeroize();
    });
  });

  describe('address string helpers are length-agnostic', () => {
    it('round-trips 20-byte addresses', () => {
      const bytes = new Uint8Array(20).fill(0xcd);
      const str = addressToString(bytes);
      expect(str).to.equal('Q' + 'cd'.repeat(20));
      expect(Array.from(stringToAddress(str))).to.deep.equal(Array.from(bytes));
    });

    it('round-trips 48-byte addresses', () => {
      const bytes = new Uint8Array(48).fill(0xcd);
      const str = addressToString(bytes);
      expect(str).to.equal('Q' + 'cd'.repeat(48));
      expect(Array.from(stringToAddress(str))).to.deep.equal(Array.from(bytes));
    });

    it('round-trips arbitrary byte lengths', () => {
      for (const size of [1, 16, 20, 32, 48, 64]) {
        const bytes = new Uint8Array(size).fill(size & 0xff);
        expect(Array.from(stringToAddress(addressToString(bytes)))).to.deep.equal(Array.from(bytes));
      }
    });
  });

  describe('interop between sizes', () => {
    it('wallet constructed at 20 bytes and 48 bytes produce addresses with the same prefix for the same seed', () => {
      const ext = ExtendedSeed.from(tc.extendedSeed);
      const w20 = MLDSA87.newWalletFromExtendedSeed(ext, ADDRESS_SIZE_CATEGORY_1);
      const w48 = MLDSA87.newWalletFromExtendedSeed(ext, ADDRESS_SIZE_CATEGORY_5);
      expect(w48.getAddressStr().slice(1).startsWith(w20.getAddressStr().slice(1))).to.equal(true);
      w20.zeroize();
      w48.zeroize();
    });
  });
});
