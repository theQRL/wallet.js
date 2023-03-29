const randomBytes = require('randombytes');  
const {SHAKE} = require('sha3'); 
const SeedBinToMnemonic = require('./utils/mnemonic.js');

async function New() {
  let { cryptoSignKeypair, CryptoPublicKeyBytes, CryptoSecretKeyBytes } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  const pk = new Uint8Array(CryptoPublicKeyBytes);
  const sk = new Uint8Array(CryptoSecretKeyBytes);

  const seed = randomBytes(48);
  const hashedSeed = new SHAKE(256);
  hashedSeed.update(seed);
  const seedBuf = hashedSeed.digest({ buffer: Buffer.alloc(32) });

  cryptoSignKeypair(seedBuf, pk, sk);
  const dilithium = {
    pk,
    sk,
    seed,
    randomizedSigning: false,
    GetPK: new Function(),
    GetSK: new Function(),
    GetSeed: new Function(),
    GetAddress: new Function(),
    GetMnemonic: new Function(),
    GetHexSeed: new Function(),
    Seal: new Function(),
    Sign: new Function(),
  };
  dilithium.GetPK = GetPK.bind(dilithium);
  dilithium.GetSK = GetSK.bind(dilithium);
  dilithium.GetSeed = GetSeed.bind(dilithium);
  dilithium.GetHexSeed = GetHexSeed.bind(dilithium);
  dilithium.GetMnemonic = GetMnemonic.bind(dilithium);
  dilithium.Seal = Seal.bind(dilithium);
  dilithium.Sign = Sign.bind(dilithium);
  dilithium.GetAddress = GetAddress.bind(dilithium);

  return dilithium;
}

async function NewDilithiumFromSeed(seed) {
  let { cryptoSignKeypair, CryptoPublicKeyBytes, CryptoSecretKeyBytes } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  const pk = new Uint8Array(CryptoPublicKeyBytes);
  const sk = new Uint8Array(CryptoSecretKeyBytes);

  const hashedSeed = new SHAKE(256);
  hashedSeed.update(seed);
  const seedBuf = hashedSeed.digest({ buffer: Buffer.alloc(32) });
  cryptoSignKeypair(seedBuf, pk, sk);
  const dilithium = {
    pk,
    sk,
    seed,
    randomizedSigning: false,
    GetPK: new Function(),
    GetSK: new Function(),
    GetSeed: new Function(),
    GetAddress: new Function(),
    GetMnemonic: new Function(),
    GetHexSeed: new Function(),
    Seal: new Function(),
    Sign: new Function(),
  };
  dilithium.GetPK = GetPK.bind(dilithium);
  dilithium.GetSK = GetSK.bind(dilithium);
  dilithium.GetSeed = GetSeed.bind(dilithium);
  dilithium.GetHexSeed = GetHexSeed.bind(dilithium);
  dilithium.GetMnemonic = GetMnemonic.bind(dilithium);
  dilithium.Seal = Seal.bind(dilithium);
  dilithium.Sign = Sign.bind(dilithium);
  dilithium.GetAddress = GetAddress.bind(dilithium);

  return dilithium;
}

function GetPK() {
  return this.pk;
}

function GetSK() {
  return this.sk;
}

function GetSeed() {
  return this.seed;
}

function GetHexSeed() {
  return `0x${this.seed.toString('hex')}`;
}

function GetMnemonic() {
  return SeedBinToMnemonic(this.seed);
}

// Seal the message, returns signature attached with message.
async function Seal(message) {
  let { cryptoSign } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  return cryptoSign(message, this.sk, this.randomizedSigning);
}

// Sign the message, and return a detached signature. Detached signatures are
// variable sized, but never larger than SIG_SIZE_PACKED.
async function Sign(message) {
  let { cryptoSign, CryptoBytes } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  const sm = cryptoSign(message, this.sk);
  let signature = new Uint8Array(CryptoBytes);
  signature = sm.slice(0, CryptoBytes);
  return signature;
}

function GetAddress() {
  return GetDilithiumAddressFromPK(this.pk);
}

// Open the sealed message m. Returns the original message sealed with signature.
// In case the signature is invalid, nil is returned.
async function Open(signatureMessage, pk) {
  let { cryptoSignOpen } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  return cryptoSignOpen(signatureMessage, pk);
}

async function Verify(message, signature, pk) {
  let { cryptoSignVerify } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  return cryptoSignVerify(signature, message, pk);
}

// ExtractMessage extracts message from Signature attached with message.
async function ExtractMessage(signatureMessage) {
  const { CryptoBytes } = await import('@theqrl/dilithium5')
  return signatureMessage.slice(CryptoBytes, signatureMessage.length);
}

// ExtractSignature extracts signature from Signature attached with message.
async function ExtractSignature(signatureMessage) {
  let { CryptoBytes } = await import(/* webpackMode: "eager" */ '@theqrl/dilithium5')
  return signatureMessage.slice(0, CryptoBytes);
}

function GetDilithiumDescriptor() {
  /*
        In case of Dilithium address, it doesn't have any choice of hashFunction,
        height, addrFormatType. Thus keeping all those values to 0 and assigning
        only signatureType in the descriptor.
    */
  return 2 << 4;
}

function GetDilithiumAddressFromPK(pk) {
  const addressSize = 20;
  const address = new Uint8Array(addressSize);
  const descBytes = GetDilithiumDescriptor();
  address[0] = descBytes;

  const hashedKey = new SHAKE(256);
  hashedKey.update(Buffer.from(pk));
  let hashedKeyDigest = hashedKey.digest({ buffer: Buffer.alloc(32), encoding: 'hex' });
  hashedKeyDigest = hashedKeyDigest.slice(hashedKeyDigest.length - addressSize + 1);
  for (let i = 0; i < hashedKeyDigest.length; i++) {
    address[i + 1] = hashedKeyDigest[i];
  }
  return address;
}

function IsValidDilithiumAddress(address) {
  const d = GetDilithiumDescriptor();
  if (address[0] !== d) {
    return false;
  }

  // TODO: Add checksum
  return true;
}

let DilithiumWallet = {
    New, NewDilithiumFromSeed, Open, Verify, ExtractMessage, ExtractSignature, GetDilithiumDescriptor, GetDilithiumAddressFromPK, IsValidDilithiumAddress
}
module.exports = DilithiumWallet;
