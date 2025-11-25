/**
 * Construct a wallet from an ExtendedSeed by auto-selecting the correct implementation.
 *
 * @param {ExtendedSeed|Uint8Array|string} extendedSeed - ExtendedSeed instance, 51 bytes or hex string.
 * @returns {any} Wallet instance (only ML-DSA-87 for now)
 */
export function newWalletFromExtendedSeed(extendedSeed: ExtendedSeed | Uint8Array | string): any;
import { ExtendedSeed } from "./common/seed.js";
//# sourceMappingURL=factory.d.ts.map