/* pokeAge engine: trainer construction helpers. */

import { createMonsterInstance } from './stats';
import type { Registry } from './data/monsters';
import type { MonsterInstance, Trainer } from './types';

export interface NewTrainerOptions {
  /** starter species id (defaults to the first starter). */
  starterId?: number;
  starterLevel?: number;
  /** starting ball count. */
  balls?: number;
  location?: string;
}

/** create a fresh trainer with a single starter and a few balls. */
export function newTrainer(
  id: string,
  name: string,
  registry: Registry,
  opts: NewTrainerOptions = {},
): Trainer {
  const starterId = opts.starterId ?? 1;
  const level = opts.starterLevel ?? 5;
  const tpl = registry.getMonsterById(starterId);
  const team: MonsterInstance[] = [];
  if (tpl) team.push(createMonsterInstance(tpl, level));

  return {
    id,
    name,
    team,
    box: [],
    badges: [],
    location: opts.location ?? 'seedling',
    items: { ball: opts.balls ?? 10 },
    totalBattles: 0,
    totalCaught: 0,
    strategy: {},
  };
}

/** add a caught/created instance directly (used by examples and tests). */
export function giveMonster(
  trainer: Trainer,
  mon: MonsterInstance,
): void {
  if (trainer.team.length < 4) trainer.team.push(mon);
  else (trainer.box = trainer.box || []).push(mon);
}
