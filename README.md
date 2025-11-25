# wallet.js

![test](https://github.com/theQRL/wallet.js/actions/workflows/test.yml/badge.svg)
[![codecov](https://codecov.io/gh/theQRL/wallet.js/branch/main/graph/badge.svg?token=HHVBFBVGFR)](https://codecov.io/gh/theQRL/wallet.js)

Helper library for building and using Quantum Resistant Ledger (QRL) wallet.

## Installation

```bash
npm install @theqrl/wallet.js
```

## Quick Start

```
const {
  Seed,
  ExtendedSeed,
  newMLDSA87Descriptor,
  getAddressFromPKAndDescriptor,
  newWalletFromExtendedSeed,
  MLDSA87,
} = require('@theqrl/wallet.js');

// 1. Create a brand-new wallet(random seed + metadata 0x0000)
const wallet = MLDSA87.newWallet();
console.log('Address:', wallet.getAddressStr());
console.log('Mnemonic:', wallet.getMnemonic());

// 2. Deterministic wallet from a known seed
const seed = Seed.from('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
const deterministic = MLDSA87.newWalletFromSeed(seed, [0x01, 0x02]);

// 3. Extended seed round-trip
const descriptor = newMLDSA87Descriptor([0xaa, 0xbb]);
const extendedSeed = ExtendedSeed.newExtendedSeed(descriptor, seed);
const restored = newWalletFromExtendedSeed(extendedSeed.toBytes()); // hex string/bytes both work 

// 4. Sign & verify
const msg = new TextEncoder().encode('hello QRL');
const signature = wallet.sign(msg);
const ok = MLDSA87.verify(signature, msg, wallet.getPK());
console.log('Signature valid?', ok);

// 5. Derive address directly from pk + descriptor
const addrBytes = getAddressFromPKAndDescriptor(wallet.getPK(), wallet.getDescriptor());
```

