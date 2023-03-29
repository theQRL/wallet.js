const { SHAKE } = require('sha3');
const randomBytes = require('randombytes');

const {
  cryptoSign,
  cryptoSignKeypair,
  cryptoSignOpen,
  cryptoSignVerify,
  // cryptoSignSignature,
  CryptoPublicKeyBytes,
  CryptoSecretKeyBytes,
  // SeedBytes,
  CryptoBytes,
} = require('@theqrl/dilithium5');
const { SeedBinToMnemonic } = require('./utils/mnemonic.js');

function getDilithiumDescriptor(address) {
  /*
        In case of Dilithium address, it doesn't have any choice of hashFunction,
        height, addrFormatType. Thus keeping all those values to 0 and assigning
        only signatureType in the descriptor.
    */
  if (!address) {
    throw new Error('Address is not defined');
  }
  return 2 << 4;
}

function getDilithiumAddressFromPK(pk) {
  const addressSize = 20;
  const address = new Uint8Array(addressSize);
  const descBytes = getDilithiumDescriptor(address);
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

class Dilithium {
  constructor(seed = null) {
    this.pk = null;
    this.sk = null;
    this.seed = seed;
    this.randomizedSigning = false;
    if (this.seed === null) {
      this.create();
    } else {
      this.fromSeed();
    }
  }

  create() {
    const pk = new Uint8Array(CryptoPublicKeyBytes);
    const sk = new Uint8Array(CryptoSecretKeyBytes);
    const seed = randomBytes(48);
    const hashedSeed = new SHAKE(256);
    hashedSeed.update(seed);
    const seedBuf = hashedSeed.digest({ buffer: Buffer.alloc(32) });
    cryptoSignKeypair(seedBuf, pk, sk);
    this.pk = pk;
    this.sk = sk;
    this.seed = seed;
  }

  fromSeed() {
    const pk = new Uint8Array(CryptoPublicKeyBytes);
    const sk = new Uint8Array(CryptoSecretKeyBytes);
    const hashedSeed = new SHAKE(256);
    hashedSeed.update(this.seed);
    const seedBuf = hashedSeed.digest({ buffer: Buffer.alloc(32) });
    cryptoSignKeypair(seedBuf, pk, sk);
    this.pk = pk;
    this.sk = sk;
  }

  getPK() {
    return this.pk;
  }

  getSK() {
    return this.sk;
  }

  getSeed() {
    return this.seed;
  }

  getHexSeed() {
    return `0x${this.seed.toString('hex')}`;
  }

  getMnemonic() {
    return SeedBinToMnemonic(this.seed);
  }

  getAddress() {
    return getDilithiumAddressFromPK(this.pk);
  }

  // Seal the message, returns signature attached with message.
  seal(message) {
    return cryptoSign(message, this.sk, this.randomizedSigning);
  }

  // Sign the message, and return a detached signature. Detached signatures are
  // variable sized, but never larger than SIG_SIZE_PACKED.
  sign(message) {
    const sm = cryptoSign(message, this.sk);
    let signature = new Uint8Array(CryptoBytes);
    signature = sm.slice(0, CryptoBytes);
    return signature;
  }
}

// Open the sealed message m. Returns the original message sealed with signature.
// In case the signature is invalid, nil is returned.
function openMessage(signatureMessage, pk) {
  return cryptoSignOpen(signatureMessage, pk);
}

function verifyMessage(message, signature, pk) {
  return cryptoSignVerify(signature, message, pk);
}

// ExtractMessage extracts message from Signature attached with message.
function extractMessage(signatureMessage) {
  return signatureMessage.slice(CryptoBytes, signatureMessage.length);
}

// ExtractSignature extracts signature from Signature attached with message.
function extractSignature(signatureMessage) {
  return signatureMessage.slice(0, CryptoBytes);
}

function isValidDilithiumAddress(address) {
  const d = getDilithiumDescriptor(address);
  if (address[0] !== d) {
    return false;
  }
  // TODO: Add checksum
  return true;
}

module.exports = {
  Dilithium,
  getDilithiumAddressFromPK,
  getDilithiumDescriptor,
  openMessage,
  verifyMessage,
  extractMessage,
  extractSignature,
  isValidDilithiumAddress,
};
