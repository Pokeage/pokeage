/* pokeAge engine: combat power scoring.
   Used to compare team strength, decide catch upgrades, and rank trainers. */

import { POWER_LEVEL_WEIGHT, POWER_RARITY_BONUS } from './constants';
import type { MonsterInstance, Trainer } from './types';

/** single monster CP: stat sum + level weight + rarity bonus. */
export function getMonsterPower(mon: MonsterInstance): number {
  if (!mon) return 0;
  const s = mon.stats;
  const statSum = (s.hp || 0) + (s.atk || 0) + (s.def || 0) + (s.spd || 0);
  const rarity = mon.rarity || 'common';
  const bonus = POWER_RARITY_BONUS[rarity] ?? 0;
  return statSum + (mon.level || 1) * POWER_LEVEL_WEIGHT + bonus;
}

/** trainer CP: sum of party CP. */
export function getTrainerPower(trainer: Trainer): number {
  if (!trainer || !trainer.team || trainer.team.length === 0) return 0;
  return trainer.team.reduce((sum, mon) => sum + getMonsterPower(mon), 0);
}

/** the weakest member across party and box, or null when both are empty. */
export function weakestOf(
  mons: MonsterInstance[],
): MonsterInstance | null {
  if (!mons.length) return null;
  return mons.reduce((w, m) => (getMonsterPower(m) < getMonsterPower(w) ? m : w));
}
