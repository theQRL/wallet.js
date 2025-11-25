/**
 * Wallet type enumeration.
 * @module wallet/common/wallettype
 */

/**
 * @readonly
 * @enum {number}
 */
const WalletType = Object.freeze({
  SPHINCSPLUS_256S: 0,
  ML_DSA_87: 1,
});

/**
 * @param {number} t
 * @return {boolean}
 */
function isValidWalletType(t) {
  return t === WalletType.ML_DSA_87;
}

module.exports = {
  WalletType,
  isValidWalletType,
};
