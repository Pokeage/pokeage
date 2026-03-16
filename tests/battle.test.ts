import { simulateBattle, simulateAuto, simulateGym } from '../src/battle';
import { createMonsterInstance, makeCombatant } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';
import { Rng } from '../src/rng';

const fire = sampleRegistry.getMonsterById(6)!; // Pyrothane
const grass = sampleRegistry.getMonsterById(3)!; // Verdrake

describe('battle determinism', () => {
  it('reproduces the same fight for the same seed', () => {
    const a1 = createMonsterInstance(fire, 30);
    const b1 = createMonsterInstance(grass, 30);
    const a2 = createMonsterInstance(fire, 30);
    const b2 = createMonsterInstance(grass, 30);

    const r1 = simulateBattle(a1, b1, new Rng(42));
    const r2 = simulateBattle(a2, b2, new Rng(42));

    expect(r1.won).toBe(r2.won);
    expect(r1.events.length).toBe(r2.events.length);
    expect(r1.events.map((e) => e.dmg)).toEqual(r2.events.map((e) => e.dmg));
  });

  it('respects the turn cap', () => {
    const a = createMonsterInstance(fire, 50);
    const b = createMonsterInstance(grass, 50);
    const res = simulateBattle(a, b, new Rng(7));
    expect(res.turnsUsed).toBeLessThanOrEqual(24);
  });

  it('type advantage tilts the win rate', () => {
    let fireWins = 0;
    for (let s = 0; s < 60; s++) {
      const a = createMonsterInstance(fire, 30);
      const b = createMonsterInstance(grass, 30);
      if (simulateBattle(a, b, new Rng(s)).won) fireWins++;
    }
    // fire is super effective vs grass
    expect(fireWins).toBeGreaterThan(30);
  });
});

describe('auto and gym sims', () => {
  it('auto sim returns a survivor HP within bounds', () => {
    const a = createMonsterInstance(fire, 20);
    const b = createMonsterInstance(grass, 18);
    const res = simulateAuto(a, b, new Rng(1));
    expect(res.hpRemaining).toBeGreaterThanOrEqual(0);
    expect(res.hpRemaining).toBeLessThanOrEqual(a.stats.hp);
  });

  it('gym sim resolves a full team chain', () => {
    const party = [
      createMonsterInstance(fire, 40),
      createMonsterInstance(grass, 40),
    ];
    const gymTeam = [
      { monsterId: 1, level: 20 },
      { monsterId: 16, level: 20 },
    ];
    const res = simulateGym(
      party,
      gymTeam,
      (id) => sampleRegistry.getMonsterById(id),
      new Rng(3),
    );
    expect(res.gymDefeated + res.partyFainted).toBeGreaterThan(0);
    expect(typeof res.won).toBe('boolean');
  });
});
