const { expect } = require('chai');
const { sha256 } = require('@noble/hashes/sha2');
const { Seed, ExtendedSeed } = require('../../src/wallet/common/seed.js');
const { SEED_SIZE, EXTENDED_SEED_SIZE } = require('../../src/wallet/common/constants.js');
const { getDescriptorBytes, Descriptor } = require('../../src/wallet/common/descriptor.js');
const { WalletType } = require('../../src/wallet/common/wallettype.js');

function buildSeedBytes() {
  return Uint8Array.from(Array.from({ length: SEED_SIZE }, (_, i) => i));
}

function buildDescriptorBytes(metadata = [0, 0]) {
  return getDescriptorBytes(WalletType.ML_DSA_87, metadata);
}

describe('wallet/common/seed', () => {
  describe('Seed', () => {
    it('creates from hex with separators', () => {
      const seedBytes = buildSeedBytes();
      const seedHex = Array.from(seedBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(':');
      const seed = Seed.from(`0x${seedHex}`);
      expect(seed.toBytes()).to.deep.equal(seedBytes);
    });

    it('produces correct sha256 hash', () => {
      const seedBytes = buildSeedBytes();
      const seed = new Seed(seedBytes);
      const expected = Uint8Array.from(sha256(seedBytes));
      expect(seed.hashSHA256()).to.deep.equal(expected);
    });

    it('throws on invalid sizes', () => {
      expect(() => new Seed(Uint8Array.from([1]))).to.throw(`Seed must be ${SEED_SIZE} bytes`);
      expect(() => Seed.from('0xdead')).to.throw(`Seed: expected ${SEED_SIZE} bytes, got 2`);
    });
  });

  describe('ExtendedSeed', () => {
    it('constructs from descriptor + seed', () => {
      const descBytes = buildDescriptorBytes();
      const desc = new Descriptor(descBytes);
      const seedBytes = buildSeedBytes();
      const seed = new Seed(seedBytes);

      const ext = ExtendedSeed.newExtendedSeed(desc, seed);
      const expectedBytes = Uint8Array.from([...descBytes, ...seedBytes]);

      expect(ext.toBytes()).to.deep.equal(expectedBytes);
      expect(ext.getDescriptorBytes()).to.deep.equal(descBytes);
      expect(ext.getSeedBytes()).to.deep.equal(seedBytes);
      expect(ext.getDescriptor().toBytes()).to.deep.equal(descBytes);
      expect(ext.getSeed().toBytes()).to.deep.equal(seedBytes);
    });

    it('accepts hex input with prefix/separators', () => {
      const seedBytes = buildSeedBytes();
      const descBytes = buildDescriptorBytes();
      const combined = Uint8Array.from([...descBytes, ...seedBytes]);
      const withSeparators = Array.from(combined)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('_');

      const ext = ExtendedSeed.from(`0X${withSeparators}`);

      expect(ext.toBytes()).to.deep.equal(combined);
      expect(ext.getDescriptorBytes()).to.deep.equal(descBytes);
      expect(ext.getSeedBytes()).to.deep.equal(seedBytes);
      expect(ext.getDescriptor().toBytes()).to.deep.equal(descBytes);
      expect(ext.getSeed().toBytes()).to.deep.equal(seedBytes);
    });

    it('throws on invalid wallet type descriptor', () => {
      expect(() => new ExtendedSeed(Array.from({ length: EXTENDED_SEED_SIZE }, (_, i) => i))).to.throw(
        'Invalid wallet type in descriptor'
      );
    });

    it('throws on invalid sizes', () => {
      expect(() => new ExtendedSeed(Uint8Array.from([1]))).to.throw(`ExtendedSeed must be ${EXTENDED_SEED_SIZE} bytes`);
      expect(() => ExtendedSeed.from('0xdead')).to.throw(`ExtendedSeed: expected ${EXTENDED_SEED_SIZE} bytes, got 2`);
    });
  });
});
