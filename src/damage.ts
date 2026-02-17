/* pokeAge engine: damage math.
   Two formulas ship here:
   - calcDamage: the standard battle formula used by the live battle loop,
     ((2L/5 + 2) * power * Atk/Def) / 50 + 2, scaled by type and variance.
     Returns raw damage; STAB, crit, and the per-hit cap are applied by the
     battle loop so multipliers cannot stack past the cap.
   - calcDamageSimple: the lightweight formula used by the offline/auto sim. */

import { DEFAULT_MOVE_POWER, DAMAGE_VARIANCE } from './constants';
import { getTypeMultiplier } from './typechart';
import { defaultRng, Rng } from './rng';
import type { MonsterInstance } from './types';

export interface DamageRoll {
  dmg: number;
  typeMod: number;
}

/** standard formula. movePower defaults to DEFAULT_MOVE_POWER. */
export function calcDamage(
  attacker: MonsterInstance,
  defender: MonsterInstance,
  movePower: number = DEFAULT_MOVE_POWER,
  rng: Rng = defaultRng,
): DamageRoll {
  const level = attacker.level || 5;
  const power = movePower || DEFAULT_MOVE_POWER;
  const aStat = Math.max(1, attacker.stats.atk);
  const dStat = Math.max(1, defender.stats.def);
  const typeMod = getTypeMultiplier(attacker.type, defender.type);
  if (typeMod === 0) return { dmg: 0, typeMod };
  const variance = rng.variance(DAMAGE_VARIANCE[1], DAMAGE_VARIANCE[0]);
  const raw =
    (((2 * level) / 5 + 2) * power * (aStat / dStat)) / 50 + 2;
  const dmg = Math.max(1, Math.floor(raw * typeMod * variance));
  return { dmg, typeMod };
}

/** lightweight formula: atk minus half def, scaled by type and level. */
export function calcDamageSimple(
  attacker: MonsterInstance,
  defender: MonsterInstance,
  rng: Rng = defaultRng,
): number {
  const baseDmg = Math.max(
    1,
    attacker.stats.atk - Math.floor(defender.stats.def * 0.5),
  );
  const typeBonus = getTypeMultiplier(attacker.type, defender.type);
  const variance = rng.float(0.85, 1.15);
  const levelMod = 1 + (attacker.level - 1) * 0.02;
  return Math.max(1, Math.floor(baseDmg * typeBonus * variance * levelMod));
}
