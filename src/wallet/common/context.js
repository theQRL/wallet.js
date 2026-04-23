/**
 * Domain-separated signing-context construction.
 *
 * Wallet-level sign/verify bind every signature to its descriptor via a
 * fixed 8-byte context:
 *
 *   "ZOND" || SIGNING_CONTEXT_VERSION || descriptor  (4 + 1 + 3 = 8 bytes)
 *
 * ML-DSA-87 passes this as the FIPS 204 ctx parameter; SPHINCS+-256s
 * (if added later) prepends it to the message. Callers do not usually
 * need to construct the context themselves — wallet helpers do it
 * internally — but the helper is exported for parity with go-qrllib
 * and rust-qrllib and for advanced callers who sign outside the Wallet
 * class.
 *
 * Bumping SIGNING_CONTEXT_VERSION is a hard break of the signature wire
 * format: all signatures produced under a new version will fail to
 * verify under the old one. A version bump must coincide with a
 * coordinated consensus / library activation.
 *
 * @module wallet/common/context
 */

import { DESCRIPTOR_SIZE } from './constants.js';
import { Descriptor } from './descriptor.js';

/** @type {number} Current signing-context format version. */
export const SIGNING_CONTEXT_VERSION = 0x01;

/** @type {Uint8Array} Application-domain tag embedded in every context. */
export const SIGNING_CONTEXT_PREFIX = new Uint8Array([0x5a, 0x4f, 0x4e, 0x44]); // "ZOND"

/** @type {number} Fixed on-wire length of a signing context (8 bytes). */
export const SIGNING_CONTEXT_SIZE = SIGNING_CONTEXT_PREFIX.length + 1 + DESCRIPTOR_SIZE;

/**
 * Build the domain-separated bytes that bind a signature to its
 * descriptor: `"ZOND" || SIGNING_CONTEXT_VERSION || descriptor` (8 bytes).
 *
 * @param {Descriptor} descriptor
 * @returns {Uint8Array} exactly {@link SIGNING_CONTEXT_SIZE} bytes.
 * @throws {Error} if descriptor is not a Descriptor instance.
 */
export function signingContext(descriptor) {
  if (!(descriptor instanceof Descriptor)) {
    throw new Error('descriptor must be a Descriptor instance');
  }
  const out = new Uint8Array(SIGNING_CONTEXT_SIZE);
  out.set(SIGNING_CONTEXT_PREFIX, 0);
  out[SIGNING_CONTEXT_PREFIX.length] = SIGNING_CONTEXT_VERSION;
  out.set(descriptor.toBytes(), SIGNING_CONTEXT_PREFIX.length + 1);
  return out;
}
