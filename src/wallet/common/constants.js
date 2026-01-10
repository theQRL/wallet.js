/**
 * Constants used across wallet components.
 * @module wallet/common/constants
 */

/** @type {number} Size in bytes of the 3-byte descriptor */
export const DESCRIPTOR_SIZE = 3;

/** @type {number} Address length in bytes */
export const ADDRESS_SIZE = 20;

/** @type {number} Seed length in bytes */
export const SEED_SIZE = 48;

/** @type {number} Extended seed length in bytes */
export const EXTENDED_SEED_SIZE = DESCRIPTOR_SIZE + SEED_SIZE;
