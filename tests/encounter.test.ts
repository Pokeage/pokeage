import { generateWildMonster } from '../src/encounter';
import { sampleRegistry } from '../src/data/monsters';
import { ROUTES } from '../src/data/world';
import { Rng } from '../src/rng';

const resolve = (id: number) => sampleRegistry.getMonsterById(id);
const route1 = ROUTES[0];
const lateRoute = ROUTES[11]; // has a legendary in the rare pool

describe('wild encounters', () => {
  it('spawns within the route level band for commons', () => {
    for (let s = 0; s < 40; s++) {
      const mon = generateWildMonster(route1, resolve, new Rng(s));
      expect(mon).not.toBeNull();
      expect(mon!.level).toBeGreaterThanOrEqual(route1.levelRange[0]);
      // commons stay within band; rares can spawn above it
      if (mon!.rarity !== 'rare' && mon!.rarity !== 'legendary') {
        expect(mon!.level).toBeLessThanOrEqual(route1.levelRange[1]);
      }
    }
  });

  it('is deterministic for a seed', () => {
    const a = generateWildMonster(lateRoute, resolve, new Rng(99));
    const b = generateWildMonster(lateRoute, resolve, new Rng(99));
    expect(a!.templateId).toBe(b!.templateId);
    expect(a!.level).toBe(b!.level);
  });

  it('legend buff increases legendary spawns', () => {
    const count = (buff: number) => {
      let legends = 0;
      for (let s = 0; s < 400; s++) {
        const mon = generateWildMonster(lateRoute, resolve, new Rng(s), {
          legend: buff,
        });
        if (mon && mon.rarity === 'legendary') legends++;
      }
      return legends;
    };
    expect(count(20)).toBeGreaterThan(count(1));
  });

  it('returns null when the pool resolves to nothing', () => {
    const broken = { ...route1, wildPool: [9999], rarePool: [] };
    expect(generateWildMonster(broken, resolve, new Rng(1))).toBeNull();
  });
});
