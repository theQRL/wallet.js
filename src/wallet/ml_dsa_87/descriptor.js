/**
 * ML-DSA-87-specific descriptor helpers.
 * @module /wallet/ml_dsa_87/descriptor
 */

import { Descriptor, getDescriptorBytes } from '../common/descriptor.js';
import { WalletType } from '../common/wallettype.js';

/**
 * New ML-DSA-87 descriptor with optional 2-byte metadata.
 * @param {[number, number]} [metadata=[0,0]]
 * @returns {Descriptor}
 */
function newMLDSA87Descriptor(metadata = [0, 0]) {
  return new Descriptor(getDescriptorBytes(WalletType.ML_DSA_87, metadata));
}

export { newMLDSA87Descriptor };
