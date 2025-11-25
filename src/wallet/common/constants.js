/**
 * Constants used across wallet components.
 * @module wallet/common/constants
 */

/** @type {number} Size in bytes of the 3-byte descriptor */
const DESCRIPTOR_SIZE = 3;

/** @type {number} Address length in bytes */
const ADDRESS_SIZE = 20;

/** @type {number} Seed length in bytes */
const SEED_SIZE = 48;

/** @type {number} Extended seed length in bytes */
const EXTENDED_SEED_SIZE = DESCRIPTOR_SIZE + SEED_SIZE;

module.exports = {
  DESCRIPTOR_SIZE,
  ADDRESS_SIZE,
  SEED_SIZE,
  EXTENDED_SEED_SIZE,
};
