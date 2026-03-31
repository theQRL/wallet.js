export type Descriptor = import("./descriptor.js").Descriptor;
/**
 * Convert address bytes to string form.
 * @param {Uint8Array} addrBytes
 * @returns {string}
 * @throws {Error} If length mismatch.
 */
export function addressToString(addrBytes: Uint8Array): string;
/**
 * Convert address string to bytes.
 * @param {string} addrStr - Address string starting with 'Q' followed by 96 hex characters.
 * @returns {Uint8Array} 48-byte address.
 * @throws {Error} If address format is invalid.
 */
export function stringToAddress(addrStr: string): Uint8Array;
/**
 * Check if a string is a valid QRL address format (structure only).
 * QRL addresses contain no checksum — any well-formed Q + 96 hex string passes.
 * Applications should add their own confirmation or checksum layer.
 * @param {string} addrStr - Address string to validate.
 * @returns {boolean} True if valid address format.
 */
export function isValidAddress(addrStr: string): boolean;
/**
 * Derive an address from a public key and descriptor.
 * @param {Uint8Array} pk
 * @param {Descriptor} descriptor
 * @returns {Uint8Array} 48-byte address.
 * @throws {Error} If pk length mismatch.
 */
export function getAddressFromPKAndDescriptor(pk: Uint8Array, descriptor: Descriptor): Uint8Array;
//# sourceMappingURL=address.d.ts.map