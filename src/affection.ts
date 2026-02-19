/* pokeAge engine: bond / affection.
   A monster gains affection on each win, scaled by how tough the foe was so
   farming weak mobs does not fast-track the bond. At AFFECTION_MAX the card
   claim (the on-chain mint gate) unlocks. */

import {
  AFFECTION_BASE,
  AFFECTION_MIN_GAIN,
  AFFECTION_MAX_GAIN,
  AFFECTION_MAX,
} from './constants';
import type { MonsterInstance } from './types';

/** affection gained for beating a foe of `foeLevel`. */
export function affectionGainFor(
  mon: MonsterInstance,
  foeLevel: number,
): number {
  const myLv = Math.max(1, mon.level || 1);
  const raw = AFFECTION_BASE * (foeLevel / myLv);
  return Math.min(AFFECTION_MAX_GAIN, Math.max(AFFECTION_MIN_GAIN, raw));
}

/** apply an affection gain, clamped to the max. returns true if it just hit max. */
export function addAffection(mon: MonsterInstance, gain: number): boolean {
  const before = mon.affection || 0;
  mon.affection = Math.min(AFFECTION_MAX, before + gain);
  return before < AFFECTION_MAX && mon.affection >= AFFECTION_MAX;
}

/** whether the card claim gate is unlocked for this monster. */
export function canClaimCard(mon: MonsterInstance): boolean {
  return (mon.affection || 0) >= AFFECTION_MAX;
}
