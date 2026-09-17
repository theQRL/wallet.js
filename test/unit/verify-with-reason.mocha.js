// Tests for Wallet.verifyWithReason (TOB-QRLLIB-14 port from the
// go-qrllib Trail of Bits engagement). The discriminated-union variant
// of MLDSA87.verify that exposes typed failure reasons for diagnostic
// use cases. The boolean MLDSA87.verify is unchanged.

import { expect } from 'chai';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { shake256 } from '@noble/hashes/sha3.js';
import { Wallet as MLDSA87 } from '../../src/wallet/ml_dsa_87/wallet.js';
import { newMLDSA87Descriptor } from '../../src/wallet/ml_dsa_87/descriptor.js';
import { sign, verify } from '../../src/wallet/ml_dsa_87/crypto.js';
import { signingContext } from '../../src/wallet/common/context.js';
import { getAddressFromPKAndDescriptor } from '../../src/wallet/common/address.js';
import { ADDRESS_SIZE } from '../../src/wallet/common/constants.js';
import {
  CRHBytes,
  CTILDEBytes,
  CryptoBytes,
  CryptoPublicKeyBytes,
  CryptoSecretKeyBytes,
  K,
  L,
  OMEGA,
  PolyW1PackedBytes,
  PolyZPackedBytes,
  SeedBytes,
  TRBytes,
  cryptoSignKeypair,
  cryptoSignVerify,
} from '@theqrl/mldsa87';

describe('Wallet.verifyWithReason (TOB-QRLLIB-14)', () => {
  const msg = utf8ToBytes('hello');
  let wallet;
  let sig;
  let pk;
  let desc;

  before(() => {
    wallet = MLDSA87.newWallet();
    sig = wallet.signDeterministic(msg);
    pk = wallet.getPK();
    desc = wallet.getDescriptor();
  });

  it('returns { ok: true } on valid signature', () => {
    const result = MLDSA87.verifyWithReason(sig, msg, pk, desc);
    expect(result.ok).to.equal(true);
  });

  it('distinguishes invalid-descriptor (not a Descriptor instance)', () => {
    const result = MLDSA87.verifyWithReason(sig, msg, pk, 'not-a-descriptor');
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('invalid-descriptor');
  });

  it('distinguishes invalid-signature-type (not a Uint8Array)', () => {
    const result = MLDSA87.verifyWithReason('not-bytes', msg, pk, desc);
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('invalid-signature-type');
  });

  it('distinguishes invalid-signature-length', () => {
    const shortSig = new Uint8Array(CryptoBytes - 1);
    const result = MLDSA87.verifyWithReason(shortSig, msg, pk, desc);
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('invalid-signature-length');
  });

  it('distinguishes invalid-message-type', () => {
    const result = MLDSA87.verifyWithReason(sig, 'not-bytes', pk, desc);
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('invalid-message-type');
  });

  it('distinguishes invalid-pk-type', () => {
    const result = MLDSA87.verifyWithReason(sig, msg, 'not-bytes', desc);
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('invalid-pk-type');
  });

  it('distinguishes invalid-pk-length', () => {
    const shortPk = new Uint8Array(CryptoPublicKeyBytes - 1);
    const result = MLDSA87.verifyWithReason(sig, msg, shortPk, desc);
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('invalid-pk-length');
  });

  it('distinguishes verification-failed (well-formed inputs, bad signature)', () => {
    const tampered = new Uint8Array(sig);
    tampered[0] ^= 0x01;
    const result = MLDSA87.verifyWithReason(tampered, msg, pk, desc);
    expect(result.ok).to.equal(false);
    expect(result.reason).to.equal('verification-failed');
  });

  it('non-binding sibling descriptors are unrepresentable (TOB-QRLLIB-3 rejection)', () => {
    // Previously this asserted reason === 'verification-failed' under a
    // descriptor with different metadata. Reserved metadata is now
    // rejected at construction (go-qrllib IsValid parity), so the
    // "well-formed but wrong descriptor" scenario cannot be built via the
    // public API at all; the binding half of TOB-QRLLIB-3 is locked at
    // the crypto layer in metamorphic.mocha.js.
    expect(() => newMLDSA87Descriptor([0x42, 0x42])).to.throw(
      'Descriptor metadata bytes are reserved and must be zero'
    );
  });

  describe('boolean Wallet.verify is total (TOB-QRLLIB-11)', () => {
    // The boolean form delegates to verifyWithReason and therefore never
    // throws on malformed inputs — wrong types, wrong lengths, and
    // non-Descriptor descriptors all collapse to `false` at this boundary
    // (go-qrllib parity: its Verify returns false instead of panicking).
    it('returns true on a valid tuple', () => {
      expect(MLDSA87.verify(sig, msg, pk, desc)).to.equal(true);
    });

    it('returns false (no throw) on malformed inputs', () => {
      expect(MLDSA87.verify('not-bytes', msg, pk, desc)).to.equal(false);
      expect(MLDSA87.verify(new Uint8Array(CryptoBytes - 1), msg, pk, desc)).to.equal(false);
      expect(MLDSA87.verify(sig, 'not-bytes', pk, desc)).to.equal(false);
      expect(MLDSA87.verify(sig, msg, 'not-bytes', desc)).to.equal(false);
      expect(MLDSA87.verify(sig, msg, new Uint8Array(CryptoPublicKeyBytes - 1), desc)).to.equal(false);
      expect(MLDSA87.verify(sig, msg, pk, 'not-a-descriptor')).to.equal(false);
      expect(MLDSA87.verify(null, null, null, null)).to.equal(false);
      expect(MLDSA87.verify(undefined, undefined, undefined, undefined)).to.equal(false);
    });

    it('returns false on a tampered signature', () => {
      const tampered = new Uint8Array(sig);
      tampered[1] ^= 0x80;
      expect(MLDSA87.verify(tampered, msg, pk, desc)).to.equal(false);
    });
  });

  describe('lower-layer validation errors carry stable codes', () => {
    // verifyWithReason classifies by error.code (never message text) —
    // these lock in the code contract for representative paths.
    function codeOf(fn) {
      try {
        fn();
      } catch (e) {
        return e.code;
      }
      throw new Error('expected function to throw');
    }

    it('verify: wrong-length signature throws ERR_SIGNATURE_LENGTH', () => {
      const ctx = signingContext(desc);
      expect(codeOf(() => verify(new Uint8Array(CryptoBytes - 1), msg, pk, ctx))).to.equal('ERR_SIGNATURE_LENGTH');
    });

    it('verify: wrong-length pk throws ERR_PK_LENGTH', () => {
      const ctx = signingContext(desc);
      expect(codeOf(() => verify(sig, msg, new Uint8Array(CryptoPublicKeyBytes - 1), ctx))).to.equal('ERR_PK_LENGTH');
    });

    it('verify: wrong types throw ERR_*_TYPE codes', () => {
      const ctx = signingContext(desc);
      expect(codeOf(() => verify('nope', msg, pk, ctx))).to.equal('ERR_SIGNATURE_TYPE');
      expect(codeOf(() => verify(sig, 'nope', pk, ctx))).to.equal('ERR_MESSAGE_TYPE');
      expect(codeOf(() => verify(sig, msg, 'nope', ctx))).to.equal('ERR_PK_TYPE');
      expect(codeOf(() => verify(sig, msg, pk, 'nope'))).to.equal('ERR_CTX_TYPE');
    });

    it('sign: validation errors carry codes too', () => {
      const ctx = signingContext(desc);
      const sk = wallet.getSK();
      expect(codeOf(() => sign('nope', msg, ctx))).to.equal('ERR_SK_TYPE');
      expect(codeOf(() => sign(new Uint8Array(3), msg, ctx))).to.equal('ERR_SK_LENGTH');
      expect(codeOf(() => sign(sk, 'nope', ctx))).to.equal('ERR_MESSAGE_TYPE');
      expect(codeOf(() => sign(sk, msg, 'nope'))).to.equal('ERR_CTX_TYPE');
      expect(codeOf(() => sign(sk, msg, ctx, 'nope'))).to.equal('ERR_RANDOMIZED_TYPE');
      sk.fill(0);
    });
  });
});

// --- Weak public key: wallet-layer rejection --------------------------------
//
// The check lives at the wallet boundary, NOT in the primitive: FIPS 204
// Algorithm 8 has no key-validity precondition and the C2SP/wycheproof
// ZeroPublicKey vectors (tcId 66 and 174, `result: valid`) require a
// conformant verifier to accept signatures under such a key. The blocks
// below therefore pin BOTH halves, the primitive accepts the zero-hint
// signature and the wallet rejects the key, so the wallet-layer assertions
// cannot pass vacuously. Shared with the browser suite: shim-supported
// assertions only.

/** rho || zeros(t1): the simplest weak key shape, with a caller-chosen rho byte. */
function zeroT1Key(rhoByte) {
  const pk = new Uint8Array(CryptoPublicKeyBytes);
  pk.fill(rhoByte, 0, SeedBytes);
  return pk;
}

/**
 * The zero-hint signature a weak key admits, built from public data only
 * (FIPS 204 Algorithm 8):
 *   tr  = SHAKE256(pk, 64)
 *   mu  = SHAKE256(tr || 0x00 || len(ctx) || ctx || msg, 64)
 *   c~  = SHAKE256(mu || w1Encode(0), 64)
 *   sig = c~ || z || h   with z = 0 and h = 0
 * The verifier reconstructs w1' = UseHint(0, A·0 − c·2^d·t1); when every
 * coefficient of that has HighBits 0 (always, for t1 = 0) its recomputed
 * c~ equals ours whatever the message.
 */
function forgeSignature(pk, msg, ctx) {
  const tr = shake256.create({ dkLen: TRBytes }).update(pk).digest();
  const pre = new Uint8Array(2 + ctx.length);
  pre[0] = 0x00;
  pre[1] = ctx.length;
  pre.set(ctx, 2);
  const mu = shake256.create({ dkLen: CRHBytes }).update(tr).update(pre).update(msg).digest();
  const w1Zero = new Uint8Array(K * PolyW1PackedBytes); // w1Encode(0)
  const ctilde = shake256.create({ dkLen: CTILDEBytes }).update(mu).update(w1Zero).digest();

  const sig = new Uint8Array(CryptoBytes);
  sig.set(ctilde, 0);
  // z = 0: polyZPack stores GAMMA1 − z = 2^19 per coefficient in 20 bits, so
  // every pair of coefficients packs to the same 5-byte group.
  const zGroup = [0x00, 0x00, 0x08, 0x00, 0x80];
  for (let i = 0; i < L * PolyZPackedBytes; i += 1) {
    sig[CTILDEBytes + i] = zGroup[i % zGroup.length];
  }
  // h = 0: the trailing OMEGA + K bytes stay zero.
  return sig;
}

/** The message every throw site uses for a weak key. */
const WEAK_KEY_ERROR = 'pk is a weak ML-DSA-87 public key (weak-public-key)';

describe('weak public key (all-zero t1): wallet-layer rejection', () => {
  const msg = utf8ToBytes('any message at all');
  let desc;
  let ctx;
  let honestPk;
  let honestSig;

  before(() => {
    const wallet = MLDSA87.newWallet();
    desc = wallet.getDescriptor();
    ctx = signingContext(desc);
    honestPk = wallet.getPK();
    honestSig = wallet.signDeterministic(msg);
    wallet.zeroize();
  });

  it('the forged signature has the documented byte layout (c~ || z = 0 || h = 0)', () => {
    const sig = forgeSignature(zeroT1Key(0x00), msg, ctx);
    expect(sig.length).to.equal(CryptoBytes);
    expect(CTILDEBytes + L * PolyZPackedBytes + OMEGA + K).to.equal(CryptoBytes);
    expect(Array.from(sig.subarray(CryptoBytes - (OMEGA + K)))).to.deep.equal(new Array(OMEGA + K).fill(0));
  });

  it("verifyWithReason returns 'weak-public-key' for the all-zero public key", () => {
    const pk = zeroT1Key(0x00);
    const result = MLDSA87.verifyWithReason(forgeSignature(pk, msg, ctx), msg, pk, desc);
    expect(result).to.deep.equal({ ok: false, reason: 'weak-public-key' });
  });

  it("verifyWithReason returns 'weak-public-key' for rho = 0xab.. with zero t1", () => {
    const pk = zeroT1Key(0xab);
    const result = MLDSA87.verifyWithReason(forgeSignature(pk, msg, ctx), msg, pk, desc);
    expect(result).to.deep.equal({ ok: false, reason: 'weak-public-key' });
  });

  it('rejects the key whatever the signature bytes are', () => {
    const pk = zeroT1Key(0x2a); // rho as in Wycheproof tcId 66
    expect(MLDSA87.verifyWithReason(honestSig, msg, pk, desc).reason).to.equal('weak-public-key');
    expect(MLDSA87.verifyWithReason(new Uint8Array(CryptoBytes), msg, pk, desc).reason).to.equal('weak-public-key');
  });

  it('Wallet.verify returns false for both keys (no throw)', () => {
    for (const pk of [zeroT1Key(0x00), zeroT1Key(0xab)]) {
      expect(MLDSA87.verify(forgeSignature(pk, msg, ctx), msg, pk, desc)).to.equal(false);
    }
  });

  it('FIPS 204 conformance pin: the @theqrl/mldsa87 primitive ACCEPTS the forgery under the wallet context', () => {
    // Do not "fix" this in the primitive: Algorithm 8 has no key-validity
    // precondition and Wycheproof requires acceptance. The wallet check
    // exercised above is what does the real work.
    for (const pk of [zeroT1Key(0x00), zeroT1Key(0xab)]) {
      expect(cryptoSignVerify(forgeSignature(pk, msg, ctx), msg, pk, ctx)).to.equal(true);
    }
  });

  it('the wallet-layer crypto.js verify wrapper is a primitive facade and accepts it too', () => {
    // crypto.js only adds typed input validation; the key check is the
    // Wallet class's responsibility (constructor + verifyWithReason).
    const pk = zeroT1Key(0x00);
    expect(verify(forgeSignature(pk, msg, ctx), msg, pk, ctx)).to.equal(true);
  });

  it('is a universal forgery: other messages verify at the primitive, and the wallet still rejects', () => {
    const pk = zeroT1Key(0x2b); // rho as in Wycheproof tcId 174
    for (const m of [utf8ToBytes('a completely different message'), new Uint8Array(0)]) {
      const sig = forgeSignature(pk, m, ctx);
      expect(cryptoSignVerify(sig, m, pk, ctx)).to.equal(true);
      expect(MLDSA87.verifyWithReason(sig, m, pk, desc).reason).to.equal('weak-public-key');
    }
  });

  it('only the t1 region decides: rho is excluded in both directions', () => {
    const rhoOnly = new Uint8Array(CryptoPublicKeyBytes);
    rhoOnly[SeedBytes - 1] = 0x01; // last rho byte non-zero, t1 still all zero
    expect(MLDSA87.verifyWithReason(honestSig, msg, rhoOnly, desc).reason).to.equal('weak-public-key');

    const rhoZeroed = Uint8Array.from(honestPk);
    rhoZeroed.fill(0, 0, SeedBytes); // rho all zero, t1 honest: a different key, not a weak one
    expect(MLDSA87.verifyWithReason(honestSig, msg, rhoZeroed, desc).reason).to.equal('verification-failed');
  });

  it('negative control: an honest key passes the check and defeats the forgery', () => {
    expect(MLDSA87.verifyWithReason(honestSig, msg, honestPk, desc)).to.deep.equal({ ok: true });
    const forged = forgeSignature(honestPk, msg, ctx);
    expect(cryptoSignVerify(forged, msg, honestPk, ctx)).to.equal(false);
    expect(MLDSA87.verifyWithReason(forged, msg, honestPk, desc)).to.deep.equal({
      ok: false,
      reason: 'verification-failed',
    });
  });

  it('precedence: the existing reasons are unchanged and still come first', () => {
    const pk = zeroT1Key(0x00);
    const sig = forgeSignature(pk, msg, ctx);
    expect(MLDSA87.verifyWithReason(sig, msg, pk, 'not-a-descriptor').reason).to.equal('invalid-descriptor');
    expect(MLDSA87.verifyWithReason('not-bytes', msg, pk, desc).reason).to.equal('invalid-signature-type');
    expect(MLDSA87.verifyWithReason(sig, 'not-bytes', pk, desc).reason).to.equal('invalid-message-type');
    expect(MLDSA87.verifyWithReason(sig, msg, Array.from(pk), desc).reason).to.equal('invalid-pk-type');
    // A wrong-length key is never "weak": length is still classified by
    // the lower layer, after the signature length, exactly as before.
    expect(MLDSA87.verifyWithReason(sig, msg, new Uint8Array(SeedBytes), desc).reason).to.equal('invalid-pk-length');
    expect(
      MLDSA87.verifyWithReason(new Uint8Array(CryptoBytes - 1), msg, new Uint8Array(SeedBytes), desc).reason
    ).to.equal('invalid-signature-length');
    // Malformed signature + weak key: the key verdict is reported first.
    expect(MLDSA87.verifyWithReason(new Uint8Array(CryptoBytes - 1), msg, pk, desc).reason).to.equal('weak-public-key');
  });
});

// --- Shared weak-key vectors ------------------------------------------------
//
// test/fixtures/weak_public_key_vectors.json is a byte-identical copy of
// qrypto.js's packages/mldsa87/test/vectors/weak_public_key_vectors.json,
// which go-qrllib and rust-qrllib also consume. The rule: a key is weak
// unless at least 76 (OMEGA + 1) of its 2048 t1 coefficients lie in
// [96, 415] or [608, 927]. Every wallet-layer entry point is run against
// every vector, and the keys marked zeroHintForgeryVerifies pin that the
// primitive accepts, under the wallet's real signing context, the
// signature the wallet refuses. The message and descriptor are fixed, so
// every assertion here is deterministic.

/** Shared vector file: fs in Node, fetch in the browser runner (same origin). */
async function loadWeakKeyVectors() {
  const url = new URL('../fixtures/weak_public_key_vectors.json', import.meta.url);
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = await import('node:fs');
    return JSON.parse(fs.readFileSync(url, 'utf8'));
  }
  const response = await fetch(url);
  return response.json();
}

describe('shared weak-key vectors (test/fixtures/weak_public_key_vectors.json)', () => {
  const msg = utf8ToBytes('any message at all');
  const desc = newMLDSA87Descriptor();
  const ctx = signingContext(desc);
  let file;
  let vectors;
  let parts;

  before(async () => {
    file = await loadWeakKeyVectors();
    vectors = file.vectors;
    const wallet = MLDSA87.newWallet();
    parts = { descriptor: wallet.getDescriptor(), seed: wallet.getSeed(), sk: wallet.getSK() };
  });

  it('is the shared file: ML-DSA-87, 2048 coefficients, bands [96, 415] and [608, 927], minimum OMEGA + 1', () => {
    expect(file.parameterSet).to.equal('ML-DSA-87');
    expect(file.t1Coefficients).to.equal(2048);
    expect([file.largeLow, file.largeHighBelowHalf, file.largeLowAboveHalf, file.largeHigh]).to.deep.equal([
      96, 415, 608, 927,
    ]);
    expect(file.minLargeCoefficients).to.equal(OMEGA + 1);
    expect(vectors.length).to.equal(28);
    for (const v of vectors) {
      expect(v.pk.length, v.name).to.equal(2 * CryptoPublicKeyBytes);
      expect(v.expected === 'accept' || v.expected === 'weak', v.name).to.equal(true);
      expect(typeof v.zeroHintForgeryVerifies, v.name).to.equal('boolean');
      expect(v.expected, v.name).to.equal(v.largeCoefficients >= file.minLargeCoefficients ? 'accept' : 'weak');
    }
    expect(vectors.filter((v) => v.expected === 'accept').length).to.not.equal(0);
    expect(vectors.filter((v) => v.zeroHintForgeryVerifies).length).to.not.equal(0);
  });

  it("verifyWithReason returns 'weak-public-key' for every weak vector and never for an accept vector", () => {
    for (const v of vectors) {
      const pk = hexToBytes(v.pk);
      // Any well-formed signature: the zero-hint one and an all-zero one.
      for (const sig of [forgeSignature(pk, msg, ctx), new Uint8Array(CryptoBytes)]) {
        const result = MLDSA87.verifyWithReason(sig, msg, pk, desc);
        if (v.expected === 'weak') {
          expect(result, v.name).to.deep.equal({ ok: false, reason: 'weak-public-key' });
        } else {
          expect(result, v.name).to.deep.equal({ ok: false, reason: 'verification-failed' });
        }
        expect(MLDSA87.verify(sig, msg, pk, desc), v.name).to.equal(false);
      }
    }
  });

  it('the honest vector key is accepted end to end: an honest signature verifies through the wallet', () => {
    const v = vectors.find((x) => x.name.startsWith('honest key'));
    expect(v.expected).to.equal('accept');
    // The vector's note: keygen from seed bytes 1..32.
    const seed = Uint8Array.from({ length: SeedBytes }, (_, i) => i + 1);
    const pk = new Uint8Array(CryptoPublicKeyBytes);
    const sk = new Uint8Array(CryptoSecretKeyBytes);
    cryptoSignKeypair(seed, pk, sk);
    expect(bytesToHex(pk)).to.equal(v.pk);
    const result = MLDSA87.verifyWithReason(sign(sk, msg, ctx), msg, pk, desc);
    sk.fill(0);
    expect(result).to.deep.equal({ ok: true });
  });

  it('the MLDSA87 constructor throws for every weak vector and constructs for every accept vector', () => {
    for (const v of vectors) {
      const pk = hexToBytes(v.pk);
      if (v.expected === 'weak') {
        expect(() => new MLDSA87({ ...parts, pk }), v.name).to.throw(WEAK_KEY_ERROR);
      } else {
        expect(new MLDSA87({ ...parts, pk }).getPK(), v.name).to.deep.equal(pk);
      }
    }
  });

  it('getAddressFromPKAndDescriptor throws for every weak vector and derives for every accept vector', () => {
    for (const v of vectors) {
      const pk = hexToBytes(v.pk);
      if (v.expected === 'weak') {
        expect(() => getAddressFromPKAndDescriptor(pk, desc), v.name).to.throw(WEAK_KEY_ERROR);
      } else {
        expect(getAddressFromPKAndDescriptor(pk, desc).length, v.name).to.equal(ADDRESS_SIZE);
      }
    }
  });

  it('FIPS 204 pin: the primitive ACCEPTS the zero-hint signature under every zeroHintForgeryVerifies key; the wallet rejects it', () => {
    let pinned = 0;
    for (const v of vectors) {
      if (v.zeroHintForgeryVerifies) {
        const pk = hexToBytes(v.pk);
        const sig = forgeSignature(pk, msg, ctx);
        expect(v.expected, v.name).to.equal('weak');
        expect(cryptoSignVerify(sig, msg, pk, ctx), v.name).to.equal(true);
        expect(MLDSA87.verifyWithReason(sig, msg, pk, desc), v.name).to.deep.equal({
          ok: false,
          reason: 'weak-public-key',
        });
        expect(MLDSA87.verify(sig, msg, pk, desc), v.name).to.equal(false);
        pinned += 1;
      }
    }
    expect(pinned).to.equal(vectors.filter((v) => v.zeroHintForgeryVerifies).length);
    expect(pinned).to.not.equal(0);
  });
});
