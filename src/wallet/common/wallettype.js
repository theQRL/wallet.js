/**
 * Wallet type enumeration.
 * @module wallet/common/wallettype
 */

/**
 * @readonly
 * @enum {number}
 */
export const WalletType = Object.freeze({
  SPHINCSPLUS_256S: 0,
  ML_DSA_87: 1,
});

/**
 * @param {number} t
 * @return {boolean}
 */
export function isValidWalletType(t) {
  return t === WalletType.ML_DSA_87;
}
