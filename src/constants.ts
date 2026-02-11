/* pokeAge engine: tuning constants.
   Every value here mirrors the live game so the extracted engine produces the
   same balance. Grouped by subsystem. */

import type { MonsterType, RarityTier } from './types';

// ── Progression ─────────────────────────────────────────────
/** hard level cap. */
export const MAX_LEVEL = 55;
/** stat growth interpolates base -> Lv50 target across this many levels. */
export const GROWTH_SPAN = 49;
/** xp curve splits at this level into a steeper segment. */
export const XP_CURVE_SPLIT = 10;

// ── Battle ──────────────────────────────────────────────────
/** standard damage variance band (low, high). */
export const DAMAGE_VARIANCE: [number, number] = [0.85, 1.0];
/** same-type attack bonus. */
export const STAB = 1.5;
/** critical hit chance and multiplier. */
export const CRIT_CHANCE = 0.0625;
export const CRIT_MULT = 1.5;
/** per-hit damage cap as a fraction of the target max HP. */
export const HIT_CAP_NORMAL = 0.3;
/** super-effective hits get a higher cap so matchups still matter. */
export const HIT_CAP_SUPER = 0.4;
/** turn limit for the live battle loop. */
export const BATTLE_TURN_CAP = 24;
/** default move power when a move carries none. */
export const DEFAULT_MOVE_POWER = 50;

// ── Encounter ───────────────────────────────────────────────
/** rare-pool roll in a normal rare zone. */
export const RARE_ZONE_CHANCE = 0.02;
/** rare-pool roll when the pool holds a legendary. */
export const LEGEND_ZONE_CHANCE = 0.008;
/** wild encounter rate is multiplied by this when stepping tall grass. */
export const ENCOUNTER_RATE_MULT = 4;
/** flee threshold: wilds more than this many levels above the lead are skipped. */
export const FLEE_LEVEL_GAP = 2;

// ── Catch ───────────────────────────────────────────────────
export const CATCH_RATE: Record<Rarity_, number> = {
  common: 0.4,
  rare: 0.08,
  legendary: 0.015,
};
/** higher-level targets are slightly harder to catch. */
export const CATCH_LEVEL_PENALTY = 0.005;
export const CATCH_RATE_MIN = 0.005;
export const CATCH_RATE_MAX = 0.9;
/** a ball multiplier at or above this value is a guaranteed catch (master ball). */
export const MASTERBALL_MULT = 999;

type Rarity_ = 'common' | 'rare' | 'legendary';

// ── Power / CP ──────────────────────────────────────────────
export const POWER_LEVEL_WEIGHT = 3;
export const POWER_RARITY_BONUS: Record<Rarity_, number> = {
  common: 0,
