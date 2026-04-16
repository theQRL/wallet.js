/**
 * Constants used across wallet components.
 * @module wallet/common/constants
 */

/** @type {number} Size in bytes of the 3-byte descriptor */
export const DESCRIPTOR_SIZE = 3;

/**
 * @type {number} Address length in bytes for NIST Category 1 post-quantum
 * security (the default used in wallet.js 2.x). 20 bytes produces a
 * `Q` + 40 hex-character address string.
 */
export const ADDRESS_SIZE_CATEGORY_1 = 20;

/**
 * @type {number} Address length in bytes for NIST Category 5 post-quantum
 * security (the 3.0 value). 48 bytes produces a `Q` + 96 hex-character
 * address string.
 */
export const ADDRESS_SIZE_CATEGORY_5 = 48;

/**
 * @type {number} Default address length in bytes.
 * Defaults to {@link ADDRESS_SIZE_CATEGORY_1} (20 bytes) to preserve the
 * wallet.js 2.x API contract: callers that do not specify an address size
 * get the historical value. Opt in to larger sizes via the `addressSize`
 * parameter on address helpers and `Wallet` factory methods.
 */
export const DEFAULT_ADDRESS_SIZE = ADDRESS_SIZE_CATEGORY_1;

/**
 * @type {number} Backwards-compatible alias for {@link DEFAULT_ADDRESS_SIZE}.
 * @deprecated Prefer {@link DEFAULT_ADDRESS_SIZE}, {@link ADDRESS_SIZE_CATEGORY_1},
 * or {@link ADDRESS_SIZE_CATEGORY_5} depending on intent.
 */
export const ADDRESS_SIZE = DEFAULT_ADDRESS_SIZE;

/** @type {number} Seed length in bytes */
export const SEED_SIZE = 48;

/** @type {number} Extended seed length in bytes */
export const EXTENDED_SEED_SIZE = DESCRIPTOR_SIZE + SEED_SIZE;
