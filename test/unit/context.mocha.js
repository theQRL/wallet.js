import { expect } from 'chai';
import {
  SIGNING_CONTEXT_PREFIX,
  SIGNING_CONTEXT_SIZE,
  SIGNING_CONTEXT_VERSION,
  signingContext,
} from '../../src/wallet/common/context.js';
import { Descriptor } from '../../src/wallet/common/descriptor.js';
import { WalletType } from '../../src/wallet/common/wallettype.js';

describe('wallet/common/context', () => {
  it('exports the expected constants', () => {
    expect(SIGNING_CONTEXT_VERSION).to.equal(0x01);
    expect(Array.from(SIGNING_CONTEXT_PREFIX)).to.deep.equal([0x5a, 0x4f, 0x4e, 0x44]);
    expect(SIGNING_CONTEXT_SIZE).to.equal(8);
  });

  it('builds "ZOND" || version || descriptor for the canonical descriptor', () => {
    const desc = new Descriptor(Uint8Array.from([WalletType.ML_DSA_87, 0, 0]));
    const ctx = signingContext(desc);
    expect(ctx).to.be.instanceOf(Uint8Array);
    expect(ctx.length).to.equal(SIGNING_CONTEXT_SIZE);
    expect(Array.from(ctx)).to.deep.equal([
      0x5a,
      0x4f,
      0x4e,
      0x44,
      SIGNING_CONTEXT_VERSION,
      WalletType.ML_DSA_87,
      0,
      0,
    ]);
  });

  it('every descriptor byte produces a distinct context', () => {
    const base = signingContext(new Descriptor(Uint8Array.from([WalletType.ML_DSA_87, 0, 0])));
    const byte1 = signingContext(new Descriptor(Uint8Array.from([WalletType.ML_DSA_87, 0x01, 0])));
    const byte2 = signingContext(new Descriptor(Uint8Array.from([WalletType.ML_DSA_87, 0, 0x01])));
    expect(Array.from(base)).to.not.deep.equal(Array.from(byte1));
    expect(Array.from(base)).to.not.deep.equal(Array.from(byte2));
    expect(Array.from(byte1)).to.not.deep.equal(Array.from(byte2));
  });

  it('rejects non-Descriptor arguments', () => {
    expect(() => signingContext(null)).to.throw('descriptor must be a Descriptor instance');
    expect(() => signingContext(undefined)).to.throw('descriptor must be a Descriptor instance');
    expect(() => signingContext({})).to.throw('descriptor must be a Descriptor instance');
    expect(() => signingContext(Uint8Array.from([1, 0, 0]))).to.throw('descriptor must be a Descriptor instance');
  });
});
