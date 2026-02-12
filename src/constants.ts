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
  rare: 100,
  legendary: 200,
};

// ── Affection / bond ────────────────────────────────────────
export const AFFECTION_MAX = 100;
/** base gain per win, scaled by foe/own level ratio. */
export const AFFECTION_BASE = 0.5;
export const AFFECTION_MIN_GAIN = 0.1;
export const AFFECTION_MAX_GAIN = 2.0;

// ── Offline progression ─────────────────────────────────────
export const MAX_OFFLINE_HOURS = 24;
export const TICK_MS = 15000;
export const HEAL_TICK_MS = 4000;

// ── XP rewards ──────────────────────────────────────────────
/** rookie catch-up multipliers, by lead level band. */
export const ROOKIE_MULT_UNDER_30 = 4;
export const ROOKIE_MULT_UNDER_45 = 2.5;
export const ROOKIE_MULT_DEFAULT = 1.8;

// ── Team / box ──────────────────────────────────────────────
export const PARTY_SIZE = 4;
export const BOX_SIZE = 6;
export const SAME_TYPE_LIMIT = 2;

// ── $PAGE token economy (matches programs/pokeage/src/constants.rs) ─
/** token decimals (pump.fun Token-2022). */
export const POKEAGE_DECIMALS = 6;
const U = (n: number) => n * 10 ** POKEAGE_DECIMALS;

/** burn sinks, in whole $PAGE. */
export const COST_DEPLOY = U(1_000);
export const COST_CATCH_COMMON = U(10);
export const COST_CATCH_RARE = U(100);
export const COST_CATCH_LEGENDARY = U(1_000);
export const COST_GYM = U(50);
export const COST_FORCE_EVOLVE = U(75_000);

/** sink split: 70% burned, 30% to the buyback pool. */
export const BURN_BPS = 7000;
export const POOL_BPS = 3000;
export const BPS_DENOM = 10_000;

/** marketplace trade fee and its internal split. */
export const MARKET_FEE_BPS = 500;
export const MARKET_POOL_SHARE_BPS = 6000;
export const MARKET_BURN_SHARE_BPS = 4000;

/** instant sell pays floor * 50%. */
export const INSTANT_SELL_BPS = 5000;

/** listing fee in lamports (0.001 SOL). */
export const LISTING_FEE_LAMPORTS = 1_000_000;

/** NFT mint fee per tier, in lamports. */
export const MINT_FEE_LAMPORTS: Record<RarityTier, number> = {
  common: 1_000_000,
  uncommon: 3_000_000,
