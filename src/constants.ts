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
  rare: 10_000_000,
  holo: 50_000_000,
  ultra: 200_000_000,
  secret: 1_000_000_000,
};

/** tier code <-> name mapping used by the SDK and program. */
export const TIER_ORDER: RarityTier[] = [
  'common',
  'uncommon',
  'rare',
  'holo',
  'ultra',
  'secret',
];

// ── Price model (off-chain display, mirrors TOKENOMICS) ──────
/** base market price in SOL by tier (stage 0, level band 1). */
export const TIER_BASE_PRICE_SOL: Record<RarityTier, number> = {
  common: 0.001,
  uncommon: 0.005,
  rare: 0.05,
  holo: 0.3,
  ultra: 3,
  secret: 30,
};

/** level-band price multipliers. */
export const LEVEL_PRICE_MULT: { max: number; mult: number }[] = [
  { max: 20, mult: 1.0 },
  { max: 40, mult: 1.5 },
  { max: 60, mult: 2.5 },
  { max: 80, mult: 4.0 },
  { max: 99, mult: 6.0 },
  { max: 100, mult: 10.0 },
];

/** evolution-stage price multipliers (applied to rare and below). */
export const STAGE_PRICE_MULT = [1.0, 2.0, 4.0];

// ── Type colors (UI parity) ─────────────────────────────────
export const TYPE_COLORS: Record<MonsterType, string> = {
  fire: '#c03028',
  water: '#5080b0',
  grass: '#508050',
  electric: '#b8a020',
  ice: '#70a0b0',
  dragon: '#6038a0',
  fighting: '#903028',
  poison: '#804080',
  ground: '#a08840',
  flying: '#7070c0',
  psychic: '#d05080',
  bug: '#889810',
  rock: '#a08860',
  ghost: '#605088',
  dark: '#504038',
  steel: '#9898a0',
  normal: '#908870',
};
