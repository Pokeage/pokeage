/* pokeAge engine: card price model.
   Mirrors the tokenomics doc: market price = tier base * level band * evolution
   stage. Mint fees and the instant-sell quote come from the same constants the
   on-chain program uses, so off-chain estimates match on-chain charges. */

import {
  TIER_BASE_PRICE_SOL,
  LEVEL_PRICE_MULT,
  STAGE_PRICE_MULT,
  MINT_FEE_LAMPORTS,
  INSTANT_SELL_BPS,
  BPS_DENOM,
  TIER_ORDER,
} from './constants';
import type { RarityTier } from './types';

/** level band multiplier (1.0 at low levels up to 10x at level 100). */
export function levelMultiplier(level: number): number {
  for (const band of LEVEL_PRICE_MULT) {
    if (level <= band.max) return band.mult;
  }
  return LEVEL_PRICE_MULT[LEVEL_PRICE_MULT.length - 1].mult;
}

/** evolution-stage multiplier (applied to rare and below). */
export function stageMultiplier(stage: number): number {
  return STAGE_PRICE_MULT[Math.min(stage, STAGE_PRICE_MULT.length - 1)] || 1;
}

/** estimated market price in SOL for a card. */
export function cardPriceSol(
  tier: RarityTier,
  level: number,
  stage: number,
): number {
  const base = TIER_BASE_PRICE_SOL[tier] ?? TIER_BASE_PRICE_SOL.common;
  // ultra and secret are scarcity-priced; stage multiplier only lifts rare and below
  const applyStage = tier === 'ultra' || tier === 'secret' ? 1 : stageMultiplier(stage);
  return base * levelMultiplier(level) * applyStage;
}

/** NFT mint fee in lamports for a tier. */
export function mintFeeLamports(tier: RarityTier): number {
  return MINT_FEE_LAMPORTS[tier] ?? MINT_FEE_LAMPORTS.common;
}

/** instant-sell payout in lamports given a floor price (lamports). */
export function instantSellQuote(floorLamports: number): number {
  return Math.floor((floorLamports * INSTANT_SELL_BPS) / BPS_DENOM);
}

/** tier name from its on-chain code (0..5). */
export function tierFromCode(code: number): RarityTier {
  return TIER_ORDER[Math.min(Math.max(code, 0), TIER_ORDER.length - 1)];
}

/** on-chain code (0..5) for a tier name. */
export function tierToCode(tier: RarityTier): number {
  const i = TIER_ORDER.indexOf(tier);
  return i < 0 ? 0 : i;
}
