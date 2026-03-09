/* pokeAge engine: save and load.
   Serializes a trainer (and an optional rng snapshot) to a plain JSON-safe
   object and restores it. Cached move lists are dropped on save and rebuilt
   lazily after load, so saves stay small and version-independent. */

import type { MonsterInstance, Trainer } from './types';

export const SAVE_VERSION = 1;

export interface SavedGame {
  version: number;
  trainer: Trainer;
  /** optional rng state so a run can resume bit-for-bit. */
  rngState?: number;
}

function stripMon(m: MonsterInstance): MonsterInstance {
  const { moves, ...rest } = m;
  return { ...rest };
}

/** produce a JSON-safe snapshot of a trainer. */
export function saveTrainer(trainer: Trainer, rngState?: number): SavedGame {
  return {
    version: SAVE_VERSION,
    rngState,
    trainer: {
      ...trainer,
      team: trainer.team.map(stripMon),
      box: (trainer.box || []).map(stripMon),
    },
  };
}

/** serialize a trainer to a JSON string. */
export function serializeTrainer(trainer: Trainer, rngState?: number): string {
  return JSON.stringify(saveTrainer(trainer, rngState));
}

/** restore a trainer from a snapshot, filling any missing fields. */
export function loadTrainer(save: SavedGame): Trainer {
  if (!save || typeof save !== 'object') {
    throw new Error('invalid save');
  }
  if (save.version !== SAVE_VERSION) {
    throw new Error(`unsupported save version ${save.version}`);
  }
  const t = save.trainer;
  return {
    id: t.id,
    name: t.name,
    team: (t.team || []).map(normalizeMon),
    box: (t.box || []).map(normalizeMon),
    badges: t.badges || [],
    location: t.location || 'seedling',
    items: t.items || { ball: 0 },
    totalBattles: t.totalBattles || 0,
    totalCaught: t.totalCaught || 0,
    strategy: t.strategy || {},
  };
}

/** parse a serialized trainer string. */
export function deserializeTrainer(json: string): Trainer {
  return loadTrainer(JSON.parse(json) as SavedGame);
}

function normalizeMon(m: MonsterInstance): MonsterInstance {
  return {
    ...m,
    xp: m.xp || 0,
    stage: m.stage || 0,
    affection: m.affection || 0,
    currentHP: m.currentHP ?? m.stats.hp,
  };
}
