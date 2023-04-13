const { WordList } = require('../qrl/wordlist.js');

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

function SeedBinToMnemonic(input) {
  return binToMnemonic(input);
}

function mnemonicToBin(mnemonic) {
  const mnemonicWords = mnemonic.split(' ');
  const wordCount = mnemonicWords.length;
  if (wordCount % 2 !== 0) {
    throw new Error('word count must be even');
  }

  const wordLookup = {};
  WordList.map((word, i) => {
    wordLookup[word] = i;
    return word;
  });

  const result = new Uint8Array((wordCount * 15) / 10);

  let current = 0;
  let buffering = 0;
  let resultIndex = 0;

  mnemonicWords.map((w) => {
    const value = wordLookup[w];
    if (value === undefined || value === null) {
      throw new Error('invalid word in mnemonic');
    }

    buffering += 3;
    current = (current << 12) + value;
    let shift;
    let mask;
    let tmp;
    for (; buffering > 2; ) {
      shift = 4 * (buffering - 2);
      mask = (1 << shift) - 1;
      tmp = current >> shift;
      buffering -= 2;
      current &= mask;
      result[resultIndex] = tmp;
      resultIndex++;
    }
    return w;
  });

  if (buffering > 0) {
    result[resultIndex] = current & 0xff;
    resultIndex++;
  }
  return result;
}

function MnemonicToSeedBin(mnemonic) {
  const output = mnemonicToBin(mnemonic);

  if (output.length !== 48) {
    throw new Error('unexpected MnemonicToSeedBin output size');
  }

  const sizedOutput = new Uint8Array(48);
  sizedOutput.set(output);
  return output;
}

module.exports = { SeedBinToMnemonic, MnemonicToSeedBin };
