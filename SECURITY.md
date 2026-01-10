# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.2.x   | Yes       |
| < 0.2   | No        |

## Reporting Vulnerabilities

Please report security vulnerabilities to **security@theqrl.org**.

Do not open public issues for security vulnerabilities.

---

## Security Model

### Cryptographic Primitives

wallet.js uses **ML-DSA-87** (FIPS 204) for digital signatures via the `@theqrl/mldsa87` package.

| Property | Value |
|----------|-------|
| Security Level | NIST Level 5 (256-bit classical) |
| Public Key Size | 2,592 bytes |
| Secret Key Size | 4,896 bytes |
| Signature Size | 4,627 bytes |

### Key Derivation

```
Seed (48 bytes, random)
    │
    ├── SHA-256 ──► ML-DSA-87 KeyGen ──► (pk, sk)
    │
    └── Descriptor (3 bytes) + Seed ──► Extended Seed (51 bytes)
                                              │
                                              └── Mnemonic (34 words)
```

### Address Derivation

```
Address = SHAKE-256(Descriptor || PublicKey, 20 bytes)
```

Addresses are 20 bytes, displayed with a `Q` prefix in hexadecimal (41 characters total).

---

## Sensitive Data

### Assets to Protect

| Asset | Sensitivity | Notes |
|-------|-------------|-------|
| Secret Key | Critical | Never expose; can sign arbitrary messages |
| Seed | Critical | Can derive secret key |
| Extended Seed | Critical | Contains seed |
| Mnemonic | Critical | Human-readable extended seed |
| Public Key | Public | Safe to share |
| Address | Public | Safe to share |

### Memory Security

**Important:** JavaScript does not provide guaranteed secure memory handling.

1. **Call `zeroize()` when done:**
   ```javascript
   const wallet = MLDSA87.newWallet();
   // ... use wallet ...
   wallet.zeroize(); // Overwrites sk, seed, extendedSeed with zeros
   ```

2. **Limitations:**
   - JavaScript's garbage collector may retain copies
   - JIT compilation may create additional copies
   - This provides best-effort protection, not cryptographic guarantees

3. **Recommendations:**
   - Minimize wallet lifetime in memory
   - Avoid logging or serializing sensitive data
   - Consider hardware security modules for high-value applications

---

## Input Validation

### Validated Inputs

| Function | Validation |
|----------|------------|
| `new Seed(bytes)` | Exactly 48 bytes |
| `new ExtendedSeed(bytes)` | Exactly 51 bytes, valid wallet type |
| `new Descriptor(bytes)` | Exactly 3 bytes, valid wallet type |
| `sign(sk, message)` | sk is Uint8Array of correct length, message is Uint8Array |
| `verify(sig, msg, pk)` | All inputs are Uint8Array of correct lengths |
| `stringToAddress(str)` | Starts with Q, 40 hex characters |

### Error Handling

All validation errors throw `Error` with descriptive messages. Wrap wallet operations in try-catch:

```javascript
try {
  const wallet = MLDSA87.newWalletFromMnemonic(userInput);
} catch (e) {
  console.error('Invalid mnemonic:', e.message);
}
```

---

## Randomness

Seed generation uses the `randombytes` package:
- Node.js: Uses `crypto.randomBytes()` (CSPRNG)
- Browser: Uses `crypto.getRandomValues()` (Web Crypto API)

Both are cryptographically secure random number generators.

---

## Side-Channel Resistance

Timing side-channel resistance depends on the underlying `@theqrl/mldsa87` implementation.

The mldsa87 package:
- Uses constant-time comparison for signature verification
- Follows FIPS 204 specification

---

## Dependencies

| Package | Purpose | Security Notes |
|---------|---------|----------------|
| `@theqrl/mldsa87` | ML-DSA-87 signatures | Audited; FIPS 204 compliant |
| `@noble/hashes` | SHA-256, SHAKE-256 | Widely audited; constant-time |
| `randombytes` | Secure random generation | Uses platform CSPRNG |

---

## Best Practices

### Do

- Call `zeroize()` when wallet is no longer needed
- Validate addresses before sending transactions
- Use `isValidAddress()` for user-provided addresses
- Keep mnemonic backups offline and encrypted
- Use hardware wallets for high-value holdings

### Don't

- Log or print secret keys, seeds, or mnemonics
- Store unencrypted mnemonics in databases or files
- Transmit seeds/mnemonics over networks
- Reuse seeds across different applications
- Ignore validation errors

---

## Audit Status

This library has been security audited. See the [internal audit](https://github.com/theQRL/internal-audit/tree/main/wallet.js) for details.

| Category | Issues Found | Status |
|----------|--------------|--------|
| Critical | 1 | Fixed |
| High | 2 | Fixed |
| Medium | 1 | Fixed |
