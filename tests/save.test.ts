import {
  saveTrainer,
  loadTrainer,
  serializeTrainer,
  deserializeTrainer,
} from '../src/save';
import { newTrainer } from '../src/factory';
import { Engine } from '../src/engine';
import { sampleRegistry } from '../src/data/monsters';
import { WORLD } from '../src/data/world';
import { Rng } from '../src/rng';

function playedTrainer() {
  const t = newTrainer('p1', 'SAVER', sampleRegistry, { starterId: 4, balls: 20 });
  const eng = new Engine(t, WORLD, (id) => sampleRegistry.getMonsterById(id), {
    rng: new Rng(321),
  });
  for (let i = 0; i < 300; i++) eng.tick();
  return t;
}

describe('save and load', () => {
  it('round-trips a trainer through JSON', () => {
    const t = playedTrainer();
    const restored = deserializeTrainer(serializeTrainer(t));
    expect(restored.name).toBe(t.name);
    expect(restored.totalBattles).toBe(t.totalBattles);
    expect(restored.team.length).toBe(t.team.length);
    expect(restored.badges).toEqual(t.badges);
  });

  it('drops cached moves and rebuilds clean state', () => {
    const t = playedTrainer();
    t.team[0].moves = [{ id: 1, name: 'x', type: 'normal', power: 1, acc: 1, pp: 1, status: null, effChance: 0, crit: false, multi: false }];
    const save = saveTrainer(t);
    expect(save.trainer.team[0].moves).toBeUndefined();
  });

  it('rejects an unsupported version', () => {
    const t = playedTrainer();
    const save = saveTrainer(t);
    save.version = 99;
    expect(() => loadTrainer(save)).toThrow();
  });

  it('keeps rng state when provided', () => {
    const t = playedTrainer();
    const save = saveTrainer(t, 123456);
    expect(save.rngState).toBe(123456);
  });
});
