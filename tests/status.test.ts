import { applyStatusTick, isDamaging, isDisabling } from '../src/status';
import { createMonsterInstance } from '../src/stats';
import { sampleRegistry } from '../src/data/monsters';
import { Rng } from '../src/rng';

const mon = () => createMonsterInstance(sampleRegistry.getMonsterById(6)!, 40);

describe('status effects', () => {
  it('burn chips a sixteenth of max HP', () => {
    const m = mon();
    const max = m.stats.hp;
    const tick = applyStatusTick(m, 'burn', new Rng(1));
    expect(tick.damage).toBe(Math.max(1, Math.floor(max / 16)));
    expect(m.currentHP).toBe(max - tick.damage);
  });

  it('poison hits harder than burn', () => {
    const a = mon();
    const b = mon();
    const burn = applyStatusTick(a, 'burn', new Rng(1));
    const poison = applyStatusTick(b, 'poison', new Rng(1));
    expect(poison.damage).toBeGreaterThan(burn.damage);
  });

  it('freeze immobilizes until it thaws', () => {
    let immobilized = 0;
    let cleared = 0;
    for (let s = 0; s < 100; s++) {
      const t = applyStatusTick(mon(), 'freeze', new Rng(s));
      if (t.immobilized) immobilized++;
      if (t.cleared) cleared++;
    }
    expect(cleared).toBeGreaterThan(0);
    expect(immobilized).toBeGreaterThan(0);
  });

  it('no status is a no-op', () => {
    const m = mon();
    const hp = m.currentHP;
    const t = applyStatusTick(m, null, new Rng(1));
    expect(t.damage).toBe(0);
    expect(m.currentHP).toBe(hp);
  });

  it('classifies statuses', () => {
    expect(isDamaging('poison')).toBe(true);
    expect(isDamaging('paralyze')).toBe(false);
    expect(isDisabling('paralyze')).toBe(true);
  });
});
