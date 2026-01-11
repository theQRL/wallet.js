export type WalletType = number;
/**
 * Wallet type enumeration.
 * @module wallet/common/wallettype
 */
/**
 * @readonly
 * @enum {number}
 */
export const WalletType: Readonly<{
    SPHINCSPLUS_256S: 0;
    ML_DSA_87: 1;
}>;
/**
 * @param {number} t
 * @return {boolean}
 */
export function isValidWalletType(t: number): boolean;
//# sourceMappingURL=wallettype.d.ts.map