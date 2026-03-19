import { newTrainer, giveMonster } from '../src/factory';
import { createMonsterInstance } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';

describe('trainer factory', () => {
  it('creates a trainer with a starter and balls', () => {
    const t = newTrainer('p1', 'RED', sampleRegistry, {
      starterId: 7,
      starterLevel: 8,
      balls: 12,
    });
    expect(t.name).toBe('RED');
    expect(t.team.length).toBe(1);
    expect(t.team[0].templateId).toBe(7);
    expect(t.team[0].level).toBe(8);
    expect(t.items.ball).toBe(12);
    expect(t.location).toBe('seedling');
  });

  it('defaults to starter 1 at level 5', () => {
    const t = newTrainer('p2', 'BLUE', sampleRegistry);
    expect(t.team[0].templateId).toBe(1);
    expect(t.team[0].level).toBe(5);
  });

  it('handles an unknown starter id gracefully', () => {
    const t = newTrainer('p3', 'GREEN', sampleRegistry, { starterId: 9999 });
    expect(t.team.length).toBe(0);
  });

  it('giveMonster fills party then box', () => {
    const t = newTrainer('p4', 'GOLD', sampleRegistry);
    for (let i = 0; i < 5; i++) {
      giveMonster(t, createMonsterInstance(sampleRegistry.getMonsterById(10)!, 5));
    }
    expect(t.team.length).toBe(4);
    expect(t.box.length).toBe(2); // starter + 5 given = party 4, box 2
  });
});
