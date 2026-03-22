import { placeNewMonster, shouldCatch } from '../src/team';
import { newTrainer } from '../src/factory';
import { createMonsterInstance } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';

function trainer() {
  return newTrainer('p', 'T', sampleRegistry, { starterId: 4, balls: 5 });
}

const strong = () => {
  const m = createMonsterInstance(sampleRegistry.getMonsterById(3)!, 50);
  return m;
};
const weak = () => createMonsterInstance(sampleRegistry.getMonsterById(28)!, 3);

describe('placement', () => {
  it('fills the party first', () => {
    const t = trainer();
    const res = placeNewMonster(t, weak());
    expect(res.where).toBe('party');
    expect(t.team.length).toBe(2);
  });

  it('overflows into the box once the party is full', () => {
    const t = trainer();
    while (t.team.length < 4) placeNewMonster(t, weak());
    const res = placeNewMonster(t, weak());
    expect(res.where).toBe('box');
  });

  it('replaces the weakest when full and the newcomer is stronger', () => {
    const t = trainer();
    for (let i = 0; i < 9; i++) placeNewMonster(t, weak());
    const res = placeNewMonster(t, strong());
    expect(res.placed).toBe(true);
    expect(res.released).toBeDefined();
  });
});

describe('catch decision', () => {
  it('skips duplicates already owned', () => {
    const t = trainer();
    const dup = createMonsterInstance(sampleRegistry.getMonsterById(4)!, 6);
    dup.rarity = 'common';
    expect(shouldCatch(t, dup)).toBe(false);
  });

  it('catches a fresh species when balls remain', () => {
    const t = trainer();
    const wild = createMonsterInstance(sampleRegistry.getMonsterById(10)!, 6);
    wild.rarity = 'common';
    expect(shouldCatch(t, wild)).toBe(true);
  });

  it('never catches with zero balls', () => {
    const t = trainer();
    t.items.ball = 0;
    const wild = createMonsterInstance(sampleRegistry.getMonsterById(10)!, 6);
    expect(shouldCatch(t, wild)).toBe(false);
  });
});
