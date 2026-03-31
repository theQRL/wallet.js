export type Descriptor = import("../common/descriptor.js").Descriptor;
export class Wallet {
    /**
     * Create a new random wallet(non-deterministic).
     * @param {[number, number]} [metadata=[0,0] ]
     * @returns {Wallet}
     */
    static newWallet(metadata?: [number, number]): Wallet;
    /**
     * @param {Seed} seed
     * @param {[number, number]} [metadata=[0,0]]
     * @returns {Wallet}
     */
    static newWalletFromSeed(seed: Seed, metadata?: [number, number]): Wallet;
    /**
     * @param {ExtendedSeed} extendedSeed
     * @returns {Wallet}
     */
    static newWalletFromExtendedSeed(extendedSeed: ExtendedSeed): Wallet;
    /**
     * @param {string} mnemonic
     * @returns {Wallet}
     */
    static newWalletFromMnemonic(mnemonic: string): Wallet;
    /**
     * Verify a signature.
     * @param {Uint8Array} signature
     * @param {Uint8Array} message
     * @param {Uint8Array} pk
     * @returns {boolean}
     */
    static verify(signature: Uint8Array, message: Uint8Array, pk: Uint8Array): boolean;
    /**
     * @param {{descriptor: Descriptor, seed: Seed, pk: Uint8Array, sk: Uint8Array}} opts
     */
    constructor({ descriptor, seed, pk, sk }: {
        descriptor: Descriptor;
        seed: Seed;
        pk: Uint8Array;
        sk: Uint8Array;
    });
    descriptor: Descriptor;
    seed: Seed;
    pk: Uint8Array<ArrayBufferLike>;
    sk: Uint8Array<ArrayBufferLike>;
    extendedSeed: ExtendedSeed;
    /** @private */
    private _zeroized;
    /** @returns {Uint8Array} */
    getAddress(): Uint8Array;
    /** @returns {string} */
    getAddressStr(): string;
    /** @returns {Descriptor} */
    getDescriptor(): Descriptor;
    /**
     * @private
     * @throws {Error} If the wallet has been zeroized.
     */
    private _requireLive;
    /** @returns {ExtendedSeed} */
    getExtendedSeed(): ExtendedSeed;
    /** @returns {Seed} */
    getSeed(): Seed;
    /** @returns {string} hex(ExtendedSeed) */
    getHexExtendedSeed(): string;
    /** @returns {string} */
    getMnemonic(): string;
    /** @returns {Uint8Array} */
    getPK(): Uint8Array;
    /**
     * Returns a copy of the secret key.
     * @returns {Uint8Array}
     * @warning Caller is responsible for zeroing the returned buffer when done
     * (e.g. `sk.fill(0)`). The Wallet's `zeroize()` method cannot reach copies
     * returned by this method.
     */
    getSK(): Uint8Array;
    /**
     * Sign a message.
     * @param {Uint8Array} message
     * @returns {Uint8Array} Signature bytes.
     */
    sign(message: Uint8Array): Uint8Array;
    /**
     * Securely zeroize sensitive key material.
     * Call this when the wallet is no longer needed to minimize
     * the window where secrets exist in memory.
     *
     * Note: JavaScript garbage collection may retain copies;
     * this provides best-effort zeroization.
     */
    zeroize(): void;
}
import { Descriptor } from '../common/descriptor.js';
import { Seed } from '../common/seed.js';
import { ExtendedSeed } from '../common/seed.js';
//# sourceMappingURL=wallet.d.ts.map