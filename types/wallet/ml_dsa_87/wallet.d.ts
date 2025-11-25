export type Descriptor = import('../common/descriptor.js').Descriptor;
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
    descriptor: import("../common/descriptor.js").Descriptor;
    seed: Seed;
    pk: Uint8Array;
    sk: Uint8Array;
    extendedSeed: ExtendedSeed;
    /** @returns {Uint8Array} */
    getAddress(): Uint8Array;
    /** @returns {string} */
    getAddressStr(): string;
    /** @returns {Descriptor} */
    getDescriptor(): Descriptor;
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
    /** @returns {Uint8Array} */
    getSK(): Uint8Array;
    /**
     * Sign a message.
     * @param {Uint8Array} message
     * @returns {Uint8Array} Signature bytes.
     */
    sign(message: Uint8Array): Uint8Array;
}
import { Seed } from "../common/seed.js";
import { ExtendedSeed } from "../common/seed.js";
//# sourceMappingURL=wallet.d.ts.map