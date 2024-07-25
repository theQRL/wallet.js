const dilithium = require('./dilithium.js');
const mnemonic = require('./utils/mnemonic.js');
const wordlist = require('./qrl/wordlist.js');

module.exports = {
  Dilithium: dilithium.Dilithium,
  extractMessage: dilithium.extractMessage,
  extractSignature: dilithium.extractSignature,
  getDilithiumAddressFromPK: dilithium.getDilithiumAddressFromPK,
  getDilithiumDescriptor: dilithium.getDilithiumDescriptor,
  isValidDilithiumAddress: dilithium.isValidDilithiumAddress,
  MnemonicToSeedBin: mnemonic.MnemonicToSeedBin,
  SeedBinToMnemonic: mnemonic.SeedBinToMnemonic,
  WORD_LIST: wordlist.WordList,
};
