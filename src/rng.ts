/* Deterministic RNG.
   The live game used Math.random(), which makes battles impossible to replay or
   test. The engine takes an Rng instead so the same seed reproduces the same run.
   mulberry32: tiny, fast, good enough for game rolls (not cryptographic). */

export class Rng {
  private state: number;

  constructor(seed = 0x2545f491) {
    // mix the seed so small/zero seeds still spread well
    this.state = (seed ^ 0x9e3779b9) >>> 0;
  }

  /** next float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    if (max < min) [min, max] = [max, min];
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** float in [min, max). */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** true with probability p (clamped to [0, 1]). */
  chance(p: number): boolean {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return this.next() < p;
  }

  /** uniform pick from a non-empty array. */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** damage variance helper, the 0.85..hi roll used by the damage formula. */
  variance(hi = 1.0, lo = 0.85): number {
    return lo + this.next() * (hi - lo);
  }

  /** snapshot the internal state (for save/restore of a run). */
  snapshot(): number {
    return this.state >>> 0;
  }

  /** restore a snapshot taken earlier. */
  restore(state: number): void {
    this.state = state >>> 0;
  }
}

/** Shared default instance for callers that do not thread their own Rng. */
export const defaultRng = new Rng();

/** Build an Rng from an arbitrary string seed (e.g. a wallet address). */
export function rngFromString(seed: string): Rng {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return new Rng(h >>> 0);
}
