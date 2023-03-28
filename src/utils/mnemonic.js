import { WordList } from '../qrl/wordlist.js';

function binToMnemonic(input) {
  if (input.length % 3 !== 0) {
    throw new Error('byte count needs to be a multiple of 3');
  }
  let mnemonic = '';
  let separator = '';
  for (let nibble = 0; nibble < input.length * 2; nibble += 3) {
    const p = nibble >> 1;
    const b1 = input[p];
    let b2 = 0;
    if (p + 1 < input.length) {
      b2 = input[p + 1];
    }
    let idx = 0;
    if (nibble % 2 === 0) {
      idx = (b1 << 4) + (b2 >> 4);
    } else {
      idx = ((b1 & 0x0f) << 8) + b2;
    }
    mnemonic += separator + WordList[idx];
    separator = ' ';
  }
  return mnemonic;
}

export function SeedBinToMnemonic(input) {
  return binToMnemonic(input);
}

export default SeedBinToMnemonic;
