/**
 * Minimal mnemonic adapters.
 * @module wallet/misc/mnemonic
 */

const { WordList } = require('../../qrl/wordlist.js');

const WORD_LOOKUP = WordList.reduce((acc, word, i) => {
  acc[word] = i;
  return acc;
}, Object.create(null));

/**
 * Encode bytes to a spaced hex mnemonic string.
 * @param {Uint8Array} input
 * @returns {string}
 */
function binToMnemonic(input) {
  if (input.length % 3 !== 0) {
    throw new Error('byte count needs to be a multiple of 3');
  }

  const words = [];
  for (let nibble = 0; nibble < input.length * 2; nibble += 3) {
    const p = nibble >> 1;
    const b1 = input[p];
    const b2 = p + 1 < input.length ? input[p + 1] : 0;
    const idx = nibble % 2 === 0 ? (b1 << 4) + (b2 >> 4) : ((b1 & 0x0f) << 8) + b2;

    if (idx >= WordList.length) {
      throw new Error('mnemonic index out of range');
    }
    words.push(WordList[idx]);
  }

  return words.join(' ');
}

/**
 * Decode spaced hex mnemonic to bytes.
 * @param {string} mnemonic
 * @returns {Uint8Array}
 */
function mnemonicToBin(mnemonic) {
  const mnemonicWords = mnemonic.trim().toLowerCase().split(/\s+/);
  if (mnemonicWords.length % 2 !== 0) throw new Error('word count must be even');

  const result = new Uint8Array((mnemonicWords.length * 15) / 10);
  let current = 0;
  let buffering = 0;
  let resultIndex = 0;

  for (let i = 0; i < mnemonicWords.length; i += 1) {
    const w = mnemonicWords[i];
    const value = WORD_LOOKUP[w];
    if (value === undefined) throw new Error('invalid word in mnemonic');

    buffering += 3;
    current = (current << 12) + value;
    for (; buffering > 2; ) {
      const shift = 4 * (buffering - 2);
      const mask = (1 << shift) - 1;
      const tmp = current >> shift;
      buffering -= 2;
      current &= mask;
      result[resultIndex++] = tmp;
    }
  }

  if (buffering > 0) {
    result[resultIndex++] = current & 0xff;
  }

  return result;
}

module.exports = {
  mnemonicToBin,
  binToMnemonic,
};
