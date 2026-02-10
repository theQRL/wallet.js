import { expect } from 'chai';
import { hexToBytes } from '@noble/hashes/utils.js';
import { newWalletFromExtendedSeed } from '../../src/wallet/factory.js';
import { walletTestCases } from '../fixtures/ml_dsa_87.fixtures.js';
import { Wallet as MLDSA87 } from '../../src/wallet/ml_dsa_87/wallet.js';
import { ExtendedSeed } from '../../src/wallet/common/seed.js';

describe('wallet/factory', () => {
  const tc = walletTestCases[0];

  it('returns ML-DSA-87 wallet from hex string input', () => {
    const wallet = newWalletFromExtendedSeed(tc.extendedSeed);
    expect(wallet).to.be.instanceOf(MLDSA87);
    expect(wallet.getHexExtendedSeed()).to.equal(`0x${tc.extendedSeed}`);
  });

  it('accepts ExtendedSeed instances', () => {
    const ext = ExtendedSeed.from(tc.extendedSeed);
    const wallet = newWalletFromExtendedSeed(ext);
    expect(wallet.getHexExtendedSeed()).to.equal(`0x${tc.extendedSeed}`);
  });

  it('accepts Uint8Array inputs', () => {
    const bytes = hexToBytes(tc.extendedSeed);
    const wallet = newWalletFromExtendedSeed(bytes);
    expect(wallet.getHexExtendedSeed()).to.equal(`0x${tc.extendedSeed}`);
  });

  it('throws on unsupported input types', () => {
    expect(() => newWalletFromExtendedSeed(123)).to.throw('Unsupported extendedSeed input');
  });
});
