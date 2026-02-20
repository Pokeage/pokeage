/* pokeAge engine: catch rate model.
   Base rate is set by rarity, reduced slightly by the target level, then
   clamped. A ball multiplier scales the rate; at or above MASTERBALL_MULT the
   catch is guaranteed. */

import {
  CATCH_RATE,
  CATCH_LEVEL_PENALTY,
  CATCH_RATE_MIN,
  CATCH_RATE_MAX,
  MASTERBALL_MULT,
} from './constants';
import { defaultRng, Rng } from './rng';
import type { CatchResult, MonsterInstance, Rarity } from './types';

/** effective catch rate for a wild, given an optional ball multiplier. */
export function catchRate(wild: MonsterInstance, ballMult = 1): number {
  const rarity: Rarity = wild.rarity || 'common';
  const base = CATCH_RATE[rarity] ?? CATCH_RATE.common;
  const penalty = Math.max(0, wild.level * CATCH_LEVEL_PENALTY);
  let rate = Math.min(CATCH_RATE_MAX, Math.max(CATCH_RATE_MIN, base - penalty));
  if (ballMult >= MASTERBALL_MULT) return 1.0;
  if (ballMult > 1) rate = Math.min(1.0, rate * ballMult);
  return rate;
}

/** attempt one catch throw. ballMult > 1 boosts; >= 999 guarantees. */
export function attemptCatch(
  wild: MonsterInstance,
  ballMult = 1,
  rng: Rng = defaultRng,
): CatchResult {
  const rate = catchRate(wild, ballMult);
  return { caught: rng.chance(rate), ballsUsed: 1, rate };
}
