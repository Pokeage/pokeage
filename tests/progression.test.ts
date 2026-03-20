import {
  getXpForLevel,
  cumulativeXp,
  grantXp,
  wildXpReward,
  rookieMultiplier,
} from '../src/progression';
import { createMonsterInstance } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';
import { MAX_LEVEL } from '../src/constants';

const grassStarter = sampleRegistry.getMonsterById(1)!;

describe('xp curve', () => {
  it('splits at level 10 into a steeper segment', () => {
    expect(getXpForLevel(10)).toBe(Math.floor(50 * Math.pow(10, 1.5)));
    expect(getXpForLevel(11)).toBe(Math.floor(80 * Math.pow(11, 1.7)));
  });

  it('is monotonically increasing', () => {
    for (let l = 1; l < 54; l++) {
      expect(getXpForLevel(l + 1)).toBeGreaterThan(getXpForLevel(l));
    }
  });

  it('cumulative xp adds up the per-level costs', () => {
    expect(cumulativeXp(3)).toBe(getXpForLevel(1) + getXpForLevel(2));
  });
});

describe('leveling and evolution', () => {
  it('levels up and grows stats', () => {
    const mon = createMonsterInstance(grassStarter, 5);
    const beforeAtk = mon.stats.atk;
    grantXp(mon, 100000, grassStarter);
    expect(mon.level).toBeGreaterThan(5);
    expect(mon.stats.atk).toBeGreaterThanOrEqual(beforeAtk);
  });

  it('evolves at ev1 and ev2 thresholds', () => {
    const mon = createMonsterInstance(grassStarter, 1);
    grantXp(mon, 5_000_000, grassStarter);
    expect(mon.level).toBe(MAX_LEVEL);
    expect(mon.stage).toBe(2);
  });

  it('legendaries never evolve', () => {
    const legend = sampleRegistry.getMonsterById(40)!;
    const mon = createMonsterInstance(legend, 1);
    grantXp(mon, 5_000_000, legend);
    expect(mon.stage).toBe(0);
  });
});

describe('rewards', () => {
  it('grants more xp to rookies', () => {
    expect(rookieMultiplier(10)).toBeGreaterThan(rookieMultiplier(50));
    expect(wildXpReward(10, 10)).toBeGreaterThan(wildXpReward(50, 10));
  });

  it('never drops below the floor', () => {
    expect(wildXpReward(55, 2)).toBeGreaterThanOrEqual(12);
  });
});
