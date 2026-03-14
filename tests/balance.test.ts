import { runBatch } from '../src/balance';
import { Engine } from '../src/engine';
import { newTrainer } from '../src/factory';
import { sampleRegistry } from '../src/data/monsters';
import { WORLD } from '../src/data/world';
import { Rng } from '../src/rng';

function make(seed: number): Engine {
  const trainer = newTrainer('p', 'B', sampleRegistry, { starterId: 4, balls: 30 });
  return new Engine(trainer, WORLD, (id) => sampleRegistry.getMonsterById(id), {
    rng: new Rng(seed),
  });
}

describe('batch harness', () => {
  it('aggregates several runs', () => {
    const report = runBatch(make, [1, 2, 3, 4, 5], 1500);
    expect(report.runs).toBe(5);
    expect(report.avgBattles).toBeGreaterThan(0);
    expect(report.avgTeamLevel).toBeGreaterThan(6);
    expect(report.fullClearRate).toBeGreaterThanOrEqual(0);
    expect(report.fullClearRate).toBeLessThanOrEqual(1);
  });

  it('is deterministic across identical seed lists', () => {
    const a = runBatch(make, [10, 20, 30], 800);
    const b = runBatch(make, [10, 20, 30], 800);
    expect(a).toEqual(b);
  });
});
