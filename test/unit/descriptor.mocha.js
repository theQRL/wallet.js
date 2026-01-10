import { expect } from 'chai';
import { Descriptor, getDescriptorBytes } from '../../src/wallet/common/descriptor.js';
import { DESCRIPTOR_SIZE } from '../../src/wallet/common/constants.js';
import { WalletType } from '../../src/wallet/common/wallettype.js';

describe('wallet/common/descriptor', () => {
  it('constructs from bytes', () => {
    const bytes = Uint8Array.from([WalletType.ML_DSA_87, 0xaa, 0xbb]);
    const desc = new Descriptor(bytes);
    expect(desc.type()).to.equal(WalletType.ML_DSA_87);
    expect(desc.toBytes()).to.deep.equal(bytes);
  });

  it('constructs from hex strings with prefix and separators', () => {
    const desc = Descriptor.from('0X01-02_03');
    expect(desc.toBytes()).to.deep.equal(Uint8Array.from([1, 2, 3]));
  });

  it('getDescriptorBytes builds descriptor with metadata', () => {
    let descBytes = getDescriptorBytes(WalletType.ML_DSA_87);
    expect(descBytes).to.deep.equal(Uint8Array.from([1, 0, 0]));
    descBytes = getDescriptorBytes(WalletType.ML_DSA_87, [0x10, 0x20]);
    expect(descBytes).to.deep.equal(Uint8Array.from([1, 0x10, 0x20]));
  });

  it('getDescriptorBytes throws on invalid wallet type', () => {
    expect(() => getDescriptorBytes(Uint8Array.from([0, 0, 0]))).to.throw('Invalid wallet type in descriptor');
  });

  it('throws on invalid size', () => {
    expect(() => new Descriptor(Uint8Array.from([1, 2]))).to.throw(`Descriptor must be ${DESCRIPTOR_SIZE} bytes`);
  });

  it('throws on invalid wallet type', () => {
    expect(() => new Descriptor(Uint8Array.from([0, 0, 0]))).to.throw('Invalid wallet type in descriptor');
  });
});
