import { Rng, defaultRng, rngFromString } from '../src/rng';

describe('seedable rng', () => {
  it('reproduces a sequence for a fixed seed', () => {
    const a = new Rng(12345);
    const b = new Rng(12345);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = new Rng(1).next();
    const b = new Rng(2).next();
    expect(a).not.toBe(b);
  });

  it('keeps floats in [0, 1)', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int is inclusive on both ends', () => {
    const r = new Rng(9);
    let lo = false;
    let hi = false;
    for (let i = 0; i < 500; i++) {
      const v = r.int(1, 3);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(3);
      if (v === 1) lo = true;
      if (v === 3) hi = true;
    }
    expect(lo && hi).toBe(true);
  });

  it('chance is monotonic at the bounds', () => {
    const r = new Rng(3);
    expect(r.chance(0)).toBe(false);
    expect(r.chance(1)).toBe(true);
  });

  it('snapshots and restores state', () => {
    const r = new Rng(42);
    r.next();
    const snap = r.snapshot();
    const after = [r.next(), r.next()];
    r.restore(snap);
    expect([r.next(), r.next()]).toEqual(after);
  });

  it('derives a stable rng from a string seed', () => {
    const a = rngFromString('wallet-abc').next();
    const b = rngFromString('wallet-abc').next();
    const c = rngFromString('wallet-xyz').next();
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('exposes a shared default instance', () => {
    expect(typeof defaultRng.next()).toBe('number');
  });
});
