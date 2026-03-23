import { generateOpponent, generateOpponents } from '../src/trainers';
import { analyzeTeam, offensiveCoverage, sharedWeaknesses } from '../src/analytics';
import { createMonsterInstance } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';
import { getTrainerPower } from '../src/power';
import { Rng } from '../src/rng';

describe('opponent generation', () => {
  it('builds a level-scaled team', () => {
    const t = generateOpponent(0, 30, sampleRegistry, new Rng(1), { teamSize: 3 });
    expect(t.team.length).toBe(3);
    for (const m of t.team) {
      expect(m.level).toBeGreaterThan(20);
      expect(m.level).toBeLessThan(40);
    }
  });

  it('is deterministic for a seed', () => {
    const a = generateOpponent(2, 25, sampleRegistry, new Rng(7));
    const b = generateOpponent(2, 25, sampleRegistry, new Rng(7));
    expect(a.team.map((m) => m.templateId)).toEqual(b.team.map((m) => m.templateId));
  });

  it('excludes legendaries by default', () => {
    const field = generateOpponents(8, 40, sampleRegistry, new Rng(3));
    for (const t of field) {
      for (const m of t.team) expect(m.rarity).not.toBe('legendary');
    }
  });

  it('sorts the field by power descending', () => {
    const field = generateOpponents(6, 35, sampleRegistry, new Rng(4));
    for (let i = 1; i < field.length; i++) {
      expect(getTrainerPower(field[i - 1])).toBeGreaterThanOrEqual(
        getTrainerPower(field[i]),
      );
    }
  });
});

describe('team analysis', () => {
  it('reports offensive coverage', () => {
    const fire = createMonsterInstance(sampleRegistry.getMonsterById(4)!, 30);
    const cover = offensiveCoverage([fire]);
    expect(cover).toContain('grass');
  });

  it('finds shared weaknesses', () => {
    const grassA = createMonsterInstance(sampleRegistry.getMonsterById(1)!, 30);
    const grassB = createMonsterInstance(sampleRegistry.getMonsterById(29)!, 30);
    expect(sharedWeaknesses([grassA, grassB])).toContain('fire');
  });

  it('summarizes a team', () => {
    const team = [
      createMonsterInstance(sampleRegistry.getMonsterById(4)!, 40),
      createMonsterInstance(sampleRegistry.getMonsterById(7)!, 30),
    ];
    const report = analyzeTeam(team);
    expect(report.size).toBe(2);
    expect(report.averageLevel).toBe(35);
    expect(report.totalPower).toBeGreaterThan(0);
  });
});
