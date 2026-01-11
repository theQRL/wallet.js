import { expect } from 'chai';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
import { CryptoPublicKeyBytes } from '@theqrl/mldsa87';
import { walletTestCases } from '../fixtures/ml_dsa_87.fixtures.js';
import { addressToString, getAddressFromPKAndDescriptor } from '../../src/wallet/common/address.js';
import { Descriptor } from '../../src/wallet/common/descriptor.js';
import { DESCRIPTOR_SIZE } from '../../src/wallet/common/constants.js';
import { WalletType } from '../../src/wallet/common/wallettype.js';

describe('wallet/common/address', () => {
  const tc = walletTestCases[0];
  const addrHex = tc.wantAddress.slice(1);

  it('addressToString prefixes Q and hex encodes bytes', () => {
    const addrBytes = hexToBytes(addrHex);
    expect(addressToString(addrBytes)).to.equal(tc.wantAddress);
  });

  it('addressToString throws on wrong length', () => {
    expect(() => addressToString(Uint8Array.from([1, 2]))).to.throw('address must be 20 bytes');
  });

  it('getAddressFromPKAndDescriptor rejects wrong pk length for ML-DSA-87', () => {
    const desc = new Descriptor(Uint8Array.from([WalletType.ML_DSA_87, 0, 0]));
    const badPk = new Uint8Array(CryptoPublicKeyBytes - 1);
    expect(() => getAddressFromPKAndDescriptor(badPk, desc)).to.throw(`pk must be ${CryptoPublicKeyBytes} bytes`);
  });

  it('getAddressFromPKAndDescriptor derives expected address for vector', () => {
    const descBytes = hexToBytes(tc.extendedSeed.slice(0, DESCRIPTOR_SIZE * 2));
    const pk = hexToBytes(tc.wantPK);
    const addr = getAddressFromPKAndDescriptor(pk, new Descriptor(descBytes));
    expect(bytesToHex(addr)).to.equal(addrHex);
  });

  it('getAddressFromPKAndDescriptor rejects non-Uint8 public keys', () => {
    const desc = new Descriptor(Uint8Array.from([1, 0, 0]));
    expect(() => getAddressFromPKAndDescriptor([1, 2, 3], desc)).to.throw('pk must be Uint8Array');
  });
});
