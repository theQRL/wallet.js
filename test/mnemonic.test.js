import { expect } from 'chai';
import { SeedBinToMnemonic } from '../src/utils/mnemonic.js';

describe('SeedBinToMnemonic', () => {
  it('should throw if seed byte count is not a multiple of 3 ', () => {
    expect(() => {
      SeedBinToMnemonic(Buffer.from(new Uint8Array(47)));
    }).to.throw();
  });
  it('does not throw if seed byte count is a multiple of 3 ', () => {
    expect(() => {
      SeedBinToMnemonic(Buffer.from(new Uint8Array(48)));
    }).to.not.throw();
  });
  it('produces a 32 word list from 48 bytes of passed data', () => {
    expect(SeedBinToMnemonic(Buffer.from(new Uint8Array(48))).split(' ').length).to.equal(32);
  });
});
