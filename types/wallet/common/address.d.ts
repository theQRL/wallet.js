export type Descriptor = any;
/**
 * Convert address bytes to string form.
 * @param {Uint8Array} addrBytes
 * @returns {string}
 * @throws {Error} If length mismatch.
 */
export function addressToString(addrBytes: Uint8Array): string;
/**
 * Derive an address from a public key and descriptor.
 * @param {Uint8Array} pk
 * @param {Descriptor} descriptor
 * @returns {Uint8Array} 20-byte address.
 * @throws {Error} If pk length mismatch.
 */
export function getAddressFromPKAndDescriptor(pk: Uint8Array, descriptor: any): Uint8Array;
//# sourceMappingURL=address.d.ts.map