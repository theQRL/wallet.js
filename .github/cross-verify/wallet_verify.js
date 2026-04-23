#!/usr/bin/env node
/**
 * Verify signature from go-qrllib with wallet.js.
 * Reads: $TMPDIR/wallet_cross_verify/go_qrllib_output.json
 */
import fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { hexToBytes } from '@noble/hashes/utils.js';
import { Wallet } from '../../src/wallet/ml_dsa_87/wallet.js';
import { Descriptor } from '../../src/wallet/common/descriptor.js';

async function main() {
  const inputFile = join(tmpdir(), 'wallet_cross_verify', 'go_qrllib_output.json');

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

  const signature = hexToBytes(data.signature);
  const message = hexToBytes(data.messageHex);
  const publicKey = hexToBytes(data.publicKey);
  const descriptor = new Descriptor(hexToBytes(data.descriptor));

  console.log('Verifying go-qrllib signature with wallet.js...');
  console.log(`  Address: ${data.address}`);
  console.log(`  Message: ${data.message}`);
  console.log(`  Descriptor: ${data.descriptor}`);

  const isValid = Wallet.verify(signature, message, publicKey, descriptor);

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
