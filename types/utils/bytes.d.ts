/**
 * Type guard: true when `input` is a Uint8Array (including Buffer).
 * @param {unknown} input
 * @returns {input is Uint8Array}
 */
export function isUint8(input: unknown): input is Uint8Array;
/**
 * Type guard: true when `input` is a hex-like string.
 * Accepts strings with optional 0x/0X prefix and separators(space, :, _, -).
 * @param {unknown} input
 * @returns {input is string}
 */
export function isHexLike(input: unknown): input is string;
/**
 * Remove surrounding whitespace, an optional 0x/0X prefix, and any grouping
 * separators, leaving hex characters only.
 *
 * The trim must happen before the prefix strip, and mirrors {@link isHexLike}:
 * `/^0x/` is anchored to the start of the string, so on untrimmed input like
 * `'  0x0100...'` it does not fire, the separator pass then deletes only the
 * `x`, and a stray leading `0` is left at the head of the hex body — shifting
 * every following nibble. Accepting a value in `isHexLike` and mangling it in
 * `cleanHex` is the failure this ordering prevents.
 *
 * Only separators are removed. Nothing that carries a nibble value is dropped,
 * so cleaning cannot change the decoded byte sequence.
 *
 * @param {string} hex
 * @returns {string}
 */
export function cleanHex(hex: string): string;
/**
 * Convert various inputs to a fixed-length byte array.
 * Supports hex string(with/without 0x), Uint8Array, Buffer, number[].
 *
 * The `number[]` path requires every element to be an integer in
 * [0, 255]; out-of-range or non-integer elements throw instead of being
 * silently coerced modulo 256 by `Uint8Array.from` (e.g. 256→0, -1→255,
 * 1.5→1 would all corrupt key/descriptor material undetected).
 *
 * @param {string|Uint8Array|Buffer|number[]} input
 * @param {number} expectedLen
 * @param {string} [label='bytes']
 * @returns {Uint8Array}
 */
export function toFixedU8(input: string | Uint8Array | Buffer | number[], expectedLen: number, label?: string): Uint8Array;
//# sourceMappingURL=bytes.d.ts.map