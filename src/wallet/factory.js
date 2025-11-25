/**
 * Auto-select wallet implementation based on the ExtendedSeed descriptor.
 * @module wallet/factory
 */

const { isHexLike } = require('../utils/bytes.js');
const { ExtendedSeed } = require('./common/seed.js');
const { Wallet: MLDSA87 } = require('./ml_dsa_87/wallet.js');

/**
 * Construct a wallet from an ExtendedSeed by auto-selecting the correct implementation.
 *
 * @param {ExtendedSeed|Uint8Array|string} extendedSeed - ExtendedSeed instance, 51 bytes or hex string.
 * @returns {any} Wallet instance (only ML-DSA-87 for now)
 */
function newWalletFromExtendedSeed(extendedSeed) {
  let ext;
  if (extendedSeed instanceof Uint8Array || isHexLike(extendedSeed)) {
    ext = ExtendedSeed.from(extendedSeed);
  } else if (extendedSeed instanceof ExtendedSeed) {
    ext = extendedSeed;
  } else {
    throw new Error('Unsupported extendedSeed input');
  }

  const desc = ext.getDescriptor();
  switch (desc.type()) {
    default:
      return MLDSA87.newWalletFromExtendedSeed(ext);
  }
}

module.exports = {
  newWalletFromExtendedSeed,
};
