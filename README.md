# wallet.js

[![npm version](https://img.shields.io/npm/v/@theqrl/wallet.js.svg)](https://www.npmjs.com/package/@theqrl/wallet.js)
![test](https://github.com/theQRL/wallet.js/actions/workflows/test.yml/badge.svg)
[![codecov](https://codecov.io/gh/theQRL/wallet.js/branch/main/graph/badge.svg?token=HHVBFBVGFR)](https://codecov.io/gh/theQRL/wallet.js)

Quantum-resistant wallet library for The QRL using **ML-DSA-87** (FIPS 204).

## Features

- ML-DSA-87 digital signatures (NIST post-quantum standard)
- Deterministic key derivation from seeds
- Mnemonic phrase backup (34 words)
- Address generation and validation
- Works in Node.js and browsers
- Dual ESM/CommonJS support

## Installation

```bash
npm install @theqrl/wallet.js
```

## Quick Start

### ESM (recommended)

```javascript
import { MLDSA87, Seed, isValidAddress } from '@theqrl/wallet.js';

// Create a new random wallet
const wallet = MLDSA87.newWallet();
console.log('Address:', wallet.getAddressStr());
console.log('Mnemonic:', wallet.getMnemonic());

// Sign a message
const message = new TextEncoder().encode('Hello QRL!');
const signature = wallet.sign(message);

// Verify signature
const isValid = MLDSA87.verify(signature, message, wallet.getPK());
console.log('Valid:', isValid); // true

// Clean up sensitive data
wallet.zeroize();
```

### CommonJS

```javascript
const { MLDSA87, Seed, isValidAddress } = require('@theqrl/wallet.js');

const wallet = MLDSA87.newWallet();
console.log('Address:', wallet.getAddressStr());
```

## API Reference

### Creating Wallets

#### `MLDSA87.newWallet([metadata])`

Creates a new wallet with a random seed.

```javascript
const wallet = MLDSA87.newWallet();
const walletWithMeta = MLDSA87.newWallet([0x01, 0x02]); // Custom 2-byte metadata
```

#### `MLDSA87.newWalletFromSeed(seed, [metadata])`

Creates a wallet from an existing seed (deterministic).

```javascript
const seed = Seed.from('0x' + '00'.repeat(48)); // 48-byte hex string
const wallet = MLDSA87.newWalletFromSeed(seed);
```

#### `MLDSA87.newWalletFromMnemonic(mnemonic)`

Restores a wallet from a mnemonic phrase.

```javascript
const mnemonic = 'absorb aback veto waiter rail aroma...'; // 34 words
const wallet = MLDSA87.newWalletFromMnemonic(mnemonic);
```

#### `newWalletFromExtendedSeed(extendedSeed)`

Factory function that auto-detects wallet type from extended seed.

```javascript
import { newWalletFromExtendedSeed } from '@theqrl/wallet.js';

const wallet = newWalletFromExtendedSeed('0x01000000...'); // 51-byte hex
```

### Wallet Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getAddressStr()` | `string` | Address with Q prefix (e.g., `Qabc123...`) |
| `getAddress()` | `Uint8Array` | Raw 20-byte address |
| `getMnemonic()` | `string` | 34-word mnemonic phrase |
| `getPK()` | `Uint8Array` | Public key (2,592 bytes) |
| `getSK()` | `Uint8Array` | Secret key (4,896 bytes) |
| `getHexExtendedSeed()` | `string` | Extended seed as hex with 0x prefix |
| `sign(message)` | `Uint8Array` | Sign a message (4,627-byte signature) |
| `zeroize()` | `void` | Overwrite sensitive data with zeros |

### Static Methods

| Method | Description |
|--------|-------------|
| `MLDSA87.verify(signature, message, pk)` | Verify a signature, returns `boolean` |

### Address Utilities

```javascript
import {
  addressToString,
  stringToAddress,
  isValidAddress
} from '@theqrl/wallet.js';

// Convert bytes to string
const addrStr = addressToString(addressBytes); // 'Qabc...'

// Convert string to bytes
const addrBytes = stringToAddress('Qabc123...');

// Validate address format
if (isValidAddress(userInput)) {
  // Safe to use
}
```

### Seeds and Descriptors

```javascript
import {
  Seed,
  ExtendedSeed,
  Descriptor,
  newMLDSA87Descriptor,
  SEED_SIZE,           // 48
  EXTENDED_SEED_SIZE,  // 51
  DESCRIPTOR_SIZE      // 3
} from '@theqrl/wallet.js';

// Create seed from hex
const seed = Seed.from('0x' + 'ab'.repeat(48));

// Create descriptor
const descriptor = newMLDSA87Descriptor([0x00, 0x00]);

// Create extended seed
const extSeed = ExtendedSeed.newExtendedSeed(descriptor, seed);
```

## Security

See [SECURITY.md](SECURITY.md) for the security model and best practices.

**Important:**
- Always call `wallet.zeroize()` when done
- Never log or transmit mnemonics/seeds
- Validate addresses with `isValidAddress()` before use

## Browser Usage

The library works in browsers via bundlers (webpack, vite, etc.):

```javascript
import { MLDSA87 } from '@theqrl/wallet.js';

const wallet = MLDSA87.newWallet();
```

Uses Web Crypto API for secure random number generation.

## Wallet Type

This library currently supports **ML-DSA-87** (FIPS 204), the NIST standardized version of Dilithium.

| Property | Value |
|----------|-------|
| Security Level | NIST Level 5 |
| Public Key | 2,592 bytes |
| Secret Key | 4,896 bytes |
| Signature | 4,627 bytes |

## Dependencies

- `@theqrl/mldsa87` - ML-DSA-87 implementation
- `@noble/hashes` - SHA-256, SHAKE-256
- `randombytes` - Secure random generation

## License

MIT
