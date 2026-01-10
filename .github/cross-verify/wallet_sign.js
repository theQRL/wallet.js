#!/usr/bin/env node
/**
 * Generate wallet signature for cross-implementation verification.
 * Outputs: seed, public key, message, and signature in hex format.
 */
const fs = require('fs');
const { bytesToHex } = require('@noble/hashes/utils');
const { Wallet } = require('../../src/wallet/ml_dsa_87/wallet.js');
const { Seed } = require('../../src/wallet/common/seed.js');

// Fixed test seed for reproducible results
const TEST_SEED_HEX =
  'f29f58aff0b00de2844f7e20bd9eeaacc379150043beeb328335817512b29fbb7184da84a092f842b2a06d72a24a5d28';
const TEST_MESSAGE = 'Cross-implementation verification test message';

async function main() {
  const seedBytes = Buffer.from(TEST_SEED_HEX, 'hex');
  const seed = Seed.from(seedBytes);
  const wallet = Wallet.newWalletFromSeed(seed);

  const message = Buffer.from(TEST_MESSAGE, 'utf-8');
  const signature = wallet.sign(message);

  const output = {
    seed: TEST_SEED_HEX,
    publicKey: bytesToHex(wallet.getPK()),
    address: wallet.getAddressStr(),
    message: TEST_MESSAGE,
    messageHex: bytesToHex(message),
    signature: bytesToHex(signature),
  };

  // Write to JSON file for go-qrllib to read
  fs.writeFileSync('/tmp/wallet_js_output.json', JSON.stringify(output, null, 2));

  console.log('wallet.js signature generated:');
  console.log(`  Address: ${output.address}`);
  console.log(`  PK (first 64 chars): ${output.publicKey.slice(0, 64)}...`);
  console.log(`  Signature (first 64 chars): ${output.signature.slice(0, 64)}...`);

  wallet.zeroize();
}

main().catch(console.error);
