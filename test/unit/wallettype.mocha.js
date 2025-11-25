const { expect } = require('chai');
const { WalletType, isValidWalletType } = require('../../src/wallet/common/wallettype.js');

describe('wallet/common/wallettype', () => {
  it('exposes expected enum values', () => {
    expect(WalletType.SPHINCSPLUS_256S).to.equal(0);
    expect(WalletType.ML_DSA_87).to.equal(1);
    expect(Object.isFrozen(WalletType)).to.equal(true);
  });

  it('validates only ML_DSA_87 wallet type', () => {
    expect(isValidWalletType(WalletType.ML_DSA_87)).to.equal(true);
    [WalletType.SPHINCSPLUS_256S, 2, -1, null, undefined].forEach((t) => {
      expect(isValidWalletType(t)).to.equal(false);
    });
  });
});
