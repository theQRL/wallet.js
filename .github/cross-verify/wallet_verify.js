#!/usr/bin/env node
/**
 * Verify signature from go-qrllib with wallet.js.
 * Reads: /tmp/go_qrllib_output.json
 */
const fs = require('fs');
const { hexToBytes } = require('@noble/hashes/utils');
const { Wallet } = require('../../src/wallet/ml_dsa_87/wallet.js');

async function main() {
  const inputFile = '/tmp/go_qrllib_output.json';

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

  const signature = hexToBytes(data.signature);
  const message = hexToBytes(data.messageHex);
  const publicKey = hexToBytes(data.publicKey);

  console.log('Verifying go-qrllib signature with wallet.js...');
  console.log(`  Address: ${data.address}`);
  console.log(`  Message: ${data.message}`);

  const isValid = Wallet.verify(signature, message, publicKey);

  if (isValid) {
    console.log('PASSED: go-qrllib signature verified successfully');
    process.exit(0);
  } else {
    console.error('FAILED: Signature verification failed');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
