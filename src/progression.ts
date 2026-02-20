/* pokeAge engine: XP, leveling, and evolution.
   XP curve splits at level 10 into a steeper segment. Each level recomputes
   stats via the interpolation model, heals the HP delta, and fires evolution
   when the level crosses ev1/ev2. Legendaries (ev1/ev2 null) never evolve. */

import {
  MAX_LEVEL,
  XP_CURVE_SPLIT,
  ROOKIE_MULT_UNDER_30,
  ROOKIE_MULT_UNDER_45,
  ROOKIE_MULT_DEFAULT,
} from './constants';
import { statsAtLevel } from './stats';
import type { MonsterInstance, MonsterTemplate } from './types';

/** xp required to advance from `level` to `level + 1`. */
export function getXpForLevel(level: number): number {
  if (level <= XP_CURVE_SPLIT) return Math.floor(50 * Math.pow(level, 1.5));
  return Math.floor(80 * Math.pow(level, 1.7));
}

/** total xp to reach a level from level 1 (handy for UI bars and tests). */
export function cumulativeXp(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += getXpForLevel(l);
  return total;
}

export type ProgressEvent =
  | { type: 'levelup'; level: number }
  | { type: 'evolve'; stage: number };

/** grant xp, leveling and evolving as needed. Mutates `mon`, returns events. */
export function grantXp(
  mon: MonsterInstance,
  amount: number,
  template: MonsterTemplate,
): ProgressEvent[] {
  mon.xp += amount;
  const events: ProgressEvent[] = [];

  while (mon.xp >= getXpForLevel(mon.level) && mon.level < MAX_LEVEL) {
    mon.xp -= getXpForLevel(mon.level);
    mon.level++;

    const oldHp = mon.stats.hp;
    mon.stats = statsAtLevel(template, mon.level);
    // carry HP forward and heal the gain from this level
    mon.currentHP = Math.min(
      mon.stats.hp,
      mon.currentHP + (mon.stats.hp - oldHp),
    );

    events.push({ type: 'levelup', level: mon.level });

    if (mon.ev1 && mon.stage === 0 && mon.level >= mon.ev1) {
      mon.stage = 1;
      events.push({ type: 'evolve', stage: 1 });
    } else if (mon.ev2 && mon.stage === 1 && mon.level >= mon.ev2) {
      mon.stage = 2;
      events.push({ type: 'evolve', stage: 2 });
    }
  }

  return events;
}

/** rookie catch-up multiplier by lead level (early levels grant more xp). */
export function rookieMultiplier(level: number): number {
  if (level < 30) return ROOKIE_MULT_UNDER_30;
  if (level < 45) return ROOKIE_MULT_UNDER_45;
  return ROOKIE_MULT_DEFAULT;
}

/** xp reward for beating a wild of `wildLevel` with a lead of `leadLevel`. */
export function wildXpReward(
  leadLevel: number,
  wildLevel: number,
  buffMult = 1,
): number {
  const levelDiff = Math.max(0.4, 1 - (leadLevel - wildLevel) * 0.02);
  const rookie = rookieMultiplier(leadLevel);
  return Math.max(
    12,
    Math.floor((5 + wildLevel * 2.5) * levelDiff * rookie * buffMult),
  );
}

/** xp reward for clearing a gym with `teamSize` leaders. */
export function gymXpReward(
  memberLevel: number,
  teamSize: number,
  buffMult = 1,
): number {
  const rookie = rookieMultiplier(memberLevel);
  return Math.floor((15 + teamSize * 8) * rookie * buffMult);
}
