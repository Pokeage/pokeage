/* pokeAge engine: status effects.
   Moves carry a status and an effChance; this module turns a landed status into
   its turn-by-turn consequences. Damage-over-time is a fraction of max HP per
   turn, and paralyze/freeze/sleep can cost a turn. Kept standalone so callers
   opt in without changing the base battle loop. */

import { defaultRng, Rng } from './rng';
import type { MonsterInstance } from './types';

export type StatusKind = 'burn' | 'poison' | 'paralyze' | 'freeze' | 'sleep';

/** damage-over-time as a fraction of the target max HP, per turn. */
export const STATUS_DOT: Partial<Record<StatusKind, number>> = {
  burn: 1 / 16,
  poison: 1 / 8,
};

/** chance a status costs the holder its turn. */
export const STATUS_SKIP_CHANCE: Partial<Record<StatusKind, number>> = {
  paralyze: 0.25,
  freeze: 1.0,
  sleep: 1.0,
};

/** chance a freeze thaws or sleep ends at the start of a turn. */
export const STATUS_CLEAR_CHANCE: Partial<Record<StatusKind, number>> = {
  freeze: 0.2,
  sleep: 0.34,
};

export interface StatusTick {
  /** damage dealt to the holder this turn. */
  damage: number;
  /** whether the holder cannot act this turn. */
  immobilized: boolean;
  /** whether the status cleared at the start of this turn. */
  cleared: boolean;
}

/** apply one turn of a status to a monster. Mutates currentHP. */
export function applyStatusTick(
  mon: MonsterInstance,
  status: StatusKind | null | undefined,
  rng: Rng = defaultRng,
): StatusTick {
  const result: StatusTick = { damage: 0, immobilized: false, cleared: false };
  if (!status) return result;

  const clearChance = STATUS_CLEAR_CHANCE[status];
  if (clearChance && rng.chance(clearChance)) {
    result.cleared = true;
    return result;
  }

  const skip = STATUS_SKIP_CHANCE[status];
  if (skip && rng.chance(skip)) result.immobilized = true;

  const dot = STATUS_DOT[status];
  if (dot) {
    const maxHp = mon.stats.hp || mon.currentHP || 1;
    const dmg = Math.max(1, Math.floor(maxHp * dot));
    mon.currentHP = Math.max(0, mon.currentHP - dmg);
    result.damage = dmg;
  }

  return result;
}

/** whether a status deals damage over time. */
export function isDamaging(status: StatusKind): boolean {
  return STATUS_DOT[status] != null;
}

/** whether a status can cost a turn. */
export function isDisabling(status: StatusKind): boolean {
  return STATUS_SKIP_CHANCE[status] != null;
}
