import { Engine } from '../src/engine';
import { newTrainer } from '../src/factory';
import { runOfflineCatchup } from '../src/offline';
import { sampleRegistry } from '../src/data/monsters';
import { WORLD } from '../src/data/world';
import { Rng } from '../src/rng';

function freshEngine(seed: number) {
  const trainer = newTrainer('p1', 'TESTER', sampleRegistry, {
    starterId: 4,
    starterLevel: 6,
    balls: 20,
  });
  return new Engine(
    trainer,
    WORLD,
    (id) => sampleRegistry.getMonsterById(id),
    { rng: new Rng(seed) },
  );
}

describe('engine run', () => {
  it('produces battles and progress over many ticks', () => {
    const eng = freshEngine(123);
    for (let i = 0; i < 400; i++) eng.tick();
    expect(eng.trainer.totalBattles).toBeGreaterThan(0);
    const teamLv = eng.trainer.team.reduce((s, m) => s + m.level, 0);
    expect(teamLv).toBeGreaterThan(6);
  });

  it('is deterministic for a fixed seed', () => {
    const a = freshEngine(777);
    const b = freshEngine(777);
    for (let i = 0; i < 300; i++) {
      a.tick();
      b.tick();
    }
    expect(a.trainer.totalBattles).toBe(b.trainer.totalBattles);
    expect(a.trainer.totalCaught).toBe(b.trainer.totalCaught);
    expect(a.trainer.badges).toEqual(b.trainer.badges);
  });

  it('never exceeds the roster cap', () => {
    const eng = freshEngine(9);
    for (let i = 0; i < 1000; i++) eng.tick();
    const total = eng.trainer.team.length + eng.trainer.box.length;
    expect(total).toBeLessThanOrEqual(10);
  });
});

describe('offline catch-up', () => {
  it('caps the replay at 24 hours', () => {
    const eng = freshEngine(55);
    const summary = runOfflineCatchup(eng, 1000 * 3600 * 1000);
    expect(summary.capped).toBe(true);
    expect(summary.durationMs).toBe(24 * 3600 * 1000);
  });

  it('makes progress for a multi-hour absence', () => {
    const eng = freshEngine(56);
    const summary = runOfflineCatchup(eng, 6 * 3600 * 1000);
    expect(summary.ticks).toBeGreaterThan(0);
    expect(summary.battles).toBeGreaterThanOrEqual(0);
  });
});
