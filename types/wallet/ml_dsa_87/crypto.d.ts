/**
 * Generate a keypair.
 * @returns {{ pk: Uint8Array, sk: Uint8Array }}
 */
export function keygen(seed: any): {
    pk: Uint8Array;
    sk: Uint8Array;
};
/**
 * Sign a message.
 * @param {Uint8Array} sk
 * @param {Uint8Array} message
 * @returns {Uint8Array} signature
 */
export function sign(sk: Uint8Array, message: Uint8Array): Uint8Array;
/**
 * Verify a signature.
 * @param {Uint8Array} signature
 * @param {Uint8Array} message
 * @param {Uint8Array} pk
 * @returns {boolean}
 */
export function verify(signature: Uint8Array, message: Uint8Array, pk: Uint8Array): boolean;
//# sourceMappingURL=crypto.d.ts.map