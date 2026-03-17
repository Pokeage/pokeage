import { catchRate, attemptCatch } from '../src/catch';
import { createMonsterInstance } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';
import { Rng } from '../src/rng';

const common = sampleRegistry.getMonsterById(28)!;
const legend = sampleRegistry.getMonsterById(40)!;

describe('catch rate', () => {
  it('is much lower for legendaries than commons', () => {
    const c = createMonsterInstance(common, 10);
    c.rarity = 'common';
    const l = createMonsterInstance(legend, 10);
    l.rarity = 'legendary';
    expect(catchRate(c)).toBeGreaterThan(catchRate(l));
  });

  it('drops with target level', () => {
    const low = createMonsterInstance(common, 5);
    const high = createMonsterInstance(common, 50);
    low.rarity = high.rarity = 'common';
    expect(catchRate(low)).toBeGreaterThanOrEqual(catchRate(high));
  });

  it('guarantees a catch at the masterball multiplier', () => {
    const l = createMonsterInstance(legend, 50);
    l.rarity = 'legendary';
    expect(catchRate(l, 999)).toBe(1);
  });

  it('clamps within bounds', () => {
    const l = createMonsterInstance(legend, 55);
    l.rarity = 'legendary';
    const r = catchRate(l);
    expect(r).toBeGreaterThanOrEqual(0.005);
    expect(r).toBeLessThanOrEqual(0.9);
  });
});

describe('catch attempt', () => {
  it('is deterministic for a seed', () => {
    const a = createMonsterInstance(common, 10);
    a.rarity = 'common';
    const r1 = attemptCatch(a, 1, new Rng(5));
    const r2 = attemptCatch(a, 1, new Rng(5));
    expect(r1.caught).toBe(r2.caught);
    expect(r1.ballsUsed).toBe(1);
  });
});
