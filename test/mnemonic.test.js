const { expect } = require('chai');
const { SeedBinToMnemonic, MnemonicToSeedBin } = require('../src/utils/mnemonic.js');

const mnemonic =
  'veto waiter rail aroma aunt chess fiend than sahara unwary punk dawn belong agent sane reefy loyal from judas clean paste rho madam poor pay convoy duty circa hybrid circus exempt splash';
const HEXSEED = 'f29f58aff0b00de2844f7e20bd9eeaacc379150043beeb328335817512b29fbb7184da84a092f842b2a06d72a24a5d28';

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
  it('produces valid mnemonic from hexseed', () => {
    const mnemonicOutput = SeedBinToMnemonic(Buffer.from(HEXSEED, 'hex'));
    expect(mnemonicOutput).to.equal(mnemonic);
  });
});

describe('MnemonicToSeedBin', () => {
  it('should produce 48 bytes of hexseed from 32 word mnemonic', () => {
    const output = MnemonicToSeedBin(mnemonic);
    expect(output.length).to.equal(48);
  });
  it('should produce valid hexseed from valid input mnemonic', () => {
    const output = MnemonicToSeedBin(mnemonic);
    expect(Buffer.from(output).toString('hex')).to.equal(HEXSEED);
  });
  it('should throw if word count is odd', () => {
    const invalidMnemonic =
      'veto waiter rail aroma aunt chess fiend than sahara unwary punk dawn belong agent sane reefy loyal from judas clean paste rho madam poor pay convoy duty circa hybrid circus exempt';
    expect(() => {
      MnemonicToSeedBin(invalidMnemonic);
    }).to.throw();
  });
  it('should throw if there is invalid word in mnemonic', () => {
    const invalidMnemonic =
      'veto waiter rail aroma aunt chess fiend than sahara unwary punk dawn belong agent sane reefy loyal from judas clean paste rho madam poor pay convoy duty circa hybrid circus exempt splashed';
    expect(() => {
      MnemonicToSeedBin(invalidMnemonic);
    }).to.throw();
  });
  it('should throw seed output size is invalid', () => {
    const invalidMnemonic = 'veto waiter';
    expect(() => {
      MnemonicToSeedBin(invalidMnemonic);
    }).to.throw();
  });
});
