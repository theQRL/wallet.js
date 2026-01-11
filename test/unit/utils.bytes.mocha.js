import { expect } from 'chai';
import { isUint8, isHexLike, cleanHex, toFixedU8 } from '../../src/utils/bytes.js';

describe('utils/bytes', () => {
  describe('isUint8', () => {
    it('accepts Uint8Array and Buffer inputs', () => {
      expect(isUint8(new Uint8Array([1, 2]))).to.equal(true);
      expect(isUint8(Buffer.from([3, 4]))).to.equal(true);
    });

    it('rejects non-Uint8 inputs', () => {
      expect(isUint8([1, 2])).to.equal(false);
      expect(isUint8('qrl')).to.equal(false);
      expect(isUint8(null)).to.equal(false);
      expect(isUint8({ length: 2 })).to.equal(false);
    });
  });

  describe('isHexLike', () => {
    it('accepts hex strings with optional prefix and separators', () => {
      expect(isHexLike('0xaaaabbbb')).to.equal(true);
      expect(isHexLike('AA AA:BB_BB-01')).to.equal(true);
      expect(isHexLike('    aa bb cc    ')).to.equal(true);
    });

    it('rejects invalid or non-string input', () => {
      expect(isHexLike('0xzz')).to.equal(false);
      expect(isHexLike('xyz!')).to.equal(false);
      expect(isHexLike(1234)).to.equal(false);
      expect(isHexLike(null)).to.equal(false);
    });
  });

  describe('cleanHex', () => {
    it('strips prefix and non-hex characters', () => {
      const hex = '0X-de:ad_be-ef 00 !!';
      expect(cleanHex(hex)).to.equal('deadbeef00');
    });
  });

  describe('toFixedU8', () => {
    it('converts hex strings with separators to fixed-length bytes', () => {
      const hex = '0x:AA:BB_CC-DD';
      const got = toFixedU8(hex, 4);
      expect(got).to.deep.equal(Uint8Array.from([0xaa, 0xbb, 0xcc, 0xdd]));
    });

    it('accepts Uint8Array or Buffer inputs', () => {
      const u8 = Uint8Array.from([9, 8, 7]);
      const buf = Buffer.from([6, 5, 4]);
      const fromU8 = toFixedU8(u8, 3);
      const fromBuf = toFixedU8(buf, 3);
      expect(fromU8).to.deep.equal(u8);
      expect(fromBuf).to.deep.equal(Uint8Array.from(buf));
    });

    it('accepts numeric arrays', () => {
      const arr = [0, 1, 2];
      const got = toFixedU8(arr, 3);
      expect(got).to.deep.equal(Uint8Array.from(arr));
    });

    it('throws when the byte length mismatches', () => {
      expect(() => toFixedU8('0xaaaa', 1, 'seed')).to.throw('seed: expected 1 bytes, got 2');
    });

    it('throws on unsupported input type', () => {
      expect(() => toFixedU8(42, 1)).to.throw('bytes: unsupported input type; pass hex string or Uint8Array/Buffer');
    });
  });
});
