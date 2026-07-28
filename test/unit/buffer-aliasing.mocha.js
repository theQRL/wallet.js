/**
 * Regression tests: `Uint8Array` subclasses must never alias wallet key state.
 *
 * `Buffer extends Uint8Array`, so a `Buffer` passes the constructor's
 * `pk instanceof Uint8Array` check. The constructor used to store the
 * concrete object by reference and the getters used to return
 * `this.pk.slice()` / `this.sk.slice()`. For a plain `Uint8Array`, `.slice()`
 * copies; for a `Buffer` it returns a **shared view**. On a Buffer-backed
 * wallet both getters therefore aliased live internal key state, which meant:
 *
 *  - `getPK()` handed out a writable view of the wallet's public key. Since
 *    `getAddress()` re-derives from `this.pk` on every call, lower-trust code
 *    given only a supposedly-public pk copy (SECURITY.md: "Safe to share")
 *    could write its own key in and silently repoint the wallet's address to
 *    one it controls.
 *  - `getSK()` handed out a view of the secret key, so the `sk.fill(0)`
 *    hygiene step its own JSDoc recommends destroyed the wallet's live key,
 *    and `wallet.zeroize()` reached back into the "copy" it promised it
 *    could not touch.
 *
 * The fix normalizes in both directions: the constructor copies `pk`/`sk`
 * into plain `Uint8Array` instances, and the getters return
 * `Uint8Array.from(...)`. These tests lock that contract in.
 */
import { expect } from 'chai';
import { Wallet as MLDSA87 } from '../../src/wallet/ml_dsa_87/wallet.js';

/**
 * Portable stand-in for Node's `Buffer` aliasing semantics: a `Uint8Array`
 * subclass whose `slice()` returns a shared view rather than a copy. Node's
 * `Buffer.prototype.slice` behaves exactly this way (it is the historical
 * alias of `subarray`). Using an explicit subclass keeps the regression
 * meaningful in the browser suite too, where `Buffer` is a polyfill that
 * does *not* override `slice`.
 */
class AliasingBytes extends Uint8Array {
  slice(begin, end) {
    return this.subarray(begin, end);
  }
}

/** Containers to run the whole matrix against. */
const CONTAINERS = [['AliasingBytes', AliasingBytes]];
if (typeof Buffer !== 'undefined') {
  CONTAINERS.push(['Buffer', Buffer]);
}

/**
 * Build a wallet whose constructor was handed `Container`-typed key material,
 * leaving the caller's containers reachable for the retention tests.
 */
function walletBackedBy(Container) {
  const factory = MLDSA87.newWallet();
  const pk = factory.getPK();
  const sk = factory.getSK();
  const pkContainer = Container.from(pk);
  const skContainer = Container.from(sk);
  const wallet = new MLDSA87({
    descriptor: factory.getDescriptor(),
    seed: factory.getSeed(),
    pk: pkContainer,
    sk: skContainer,
  });
  pk.fill(0);
  sk.fill(0);
  factory.zeroize();
  return { wallet, pkContainer, skContainer };
}

const MESSAGE = new TextEncoder().encode('buffer-alias-regression');

describe('Uint8Array subclasses never alias wallet key state', () => {
  it('the AliasingBytes premise holds: its slice() really does alias', () => {
    // Guards the test itself — if this ever stops aliasing, the suite below
    // would pass vacuously.
    const a = AliasingBytes.from([1, 2, 3]);
    const view = a.slice();
    view[0] = 9;
    expect(a[0]).to.equal(9);

    const plain = Uint8Array.from([1, 2, 3]);
    const copy = plain.slice();
    copy[0] = 9;
    expect(plain[0]).to.equal(1);
  });

  CONTAINERS.forEach(([label, Container]) => {
    describe(`constructed with ${label}`, () => {
      it('getPK() returns a plain Uint8Array, not the subclass', () => {
        const { wallet } = walletBackedBy(Container);
        const out = wallet.getPK();
        expect(out.constructor).to.equal(Uint8Array);
        expect(out).to.be.instanceOf(Uint8Array);
        wallet.zeroize();
      });

      it('getSK() returns a plain Uint8Array, not the subclass', () => {
        const { wallet } = walletBackedBy(Container);
        const out = wallet.getSK();
        expect(out.constructor).to.equal(Uint8Array);
        out.fill(0);
        wallet.zeroize();
      });

      it('mutating the getPK() result cannot rewrite the wallet identity', () => {
        const { wallet } = walletBackedBy(Container);
        const attacker = MLDSA87.newWallet();
        const attackerPk = attacker.getPK();
        const addressBefore = wallet.getAddressStr();
        const pkBefore = wallet.getPK();

        // The reported attack: lower-trust code holding only the "public,
        // safe to share" pk result writes its own key into it.
        wallet.getPK().set(attackerPk);

        expect(wallet.getAddressStr()).to.equal(addressBefore);
        expect(wallet.getAddressStr()).to.not.equal(attacker.getAddressStr());
        expect(wallet.getPK()).to.deep.equal(pkBefore);

        // The attacker's signature must not verify against the wallet's identity.
        const attackerSig = attacker.signDeterministic(MESSAGE);
        expect(MLDSA87.verify(attackerSig, MESSAGE, wallet.getPK(), wallet.getDescriptor())).to.equal(false);

        // The wallet's own signature still does.
        const ownSig = wallet.signDeterministic(MESSAGE);
        expect(MLDSA87.verify(ownSig, MESSAGE, wallet.getPK(), wallet.getDescriptor())).to.equal(true);

        attacker.zeroize();
        wallet.zeroize();
      });

      it('the documented sk.fill(0) hygiene step does not break signing', () => {
        const { wallet } = walletBackedBy(Container);

        // getSK()'s JSDoc tells callers to do exactly this.
        const dispensed = wallet.getSK();
        dispensed.fill(0);

        const sig = wallet.signDeterministic(MESSAGE);
        expect(MLDSA87.verify(sig, MESSAGE, wallet.getPK(), wallet.getDescriptor())).to.equal(true);
        wallet.zeroize();
      });

      it('zeroize() cannot reach a previously returned getSK() result', () => {
        const { wallet } = walletBackedBy(Container);
        const dispensed = wallet.getSK();

        wallet.zeroize();

        // getSK()'s JSDoc promises zeroize() cannot reach returned copies;
        // that promise must hold for subclass-backed wallets too.
        expect(dispensed.every((b) => b === 0)).to.equal(false);
        dispensed.fill(0);
      });

      it('the constructor does not retain the caller-supplied key buffers', () => {
        const { wallet, pkContainer, skContainer } = walletBackedBy(Container);
        const addressBefore = wallet.getAddressStr();
        const pkBefore = wallet.getPK();

        // Caller mutates the buffers they passed in.
        pkContainer.fill(0xff);
        skContainer.fill(0xff);

        expect(wallet.getAddressStr()).to.equal(addressBefore);
        expect(wallet.getPK()).to.deep.equal(pkBefore);

        const sig = wallet.signDeterministic(MESSAGE);
        expect(MLDSA87.verify(sig, MESSAGE, wallet.getPK(), wallet.getDescriptor())).to.equal(true);
        wallet.zeroize();
      });

      it('zeroize() still fails secret accessors loudly', () => {
        const { wallet } = walletBackedBy(Container);
        wallet.zeroize();
        expect(() => wallet.getSK()).to.throw('Wallet has been zeroized');
        // Public accessors intentionally survive.
        expect(wallet.getPK().constructor).to.equal(Uint8Array);
      });
    });
  });

  describe('negative control: plain Uint8Array', () => {
    it('behaves identically to the subclass-backed wallets', () => {
      const { wallet, pkContainer } = walletBackedBy(Uint8Array);
      const addressBefore = wallet.getAddressStr();

      expect(wallet.getPK().constructor).to.equal(Uint8Array);
      wallet.getPK().fill(0xff);
      pkContainer.fill(0xff);
      expect(wallet.getAddressStr()).to.equal(addressBefore);

      const dispensed = wallet.getSK();
      dispensed.fill(0);
      const sig = wallet.signDeterministic(MESSAGE);
      expect(MLDSA87.verify(sig, MESSAGE, wallet.getPK(), wallet.getDescriptor())).to.equal(true);
      wallet.zeroize();
    });
  });

  describe('factory-built wallets', () => {
    it('are unaffected and still return plain Uint8Array key copies', () => {
      const wallet = MLDSA87.newWallet();
      const address = wallet.getAddressStr();
      expect(wallet.getPK().constructor).to.equal(Uint8Array);
      expect(wallet.getSK().constructor).to.equal(Uint8Array);

      wallet.getPK().fill(0xff);
      expect(wallet.getAddressStr()).to.equal(address);
      wallet.zeroize();
    });
  });
});
