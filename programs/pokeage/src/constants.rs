//! economy constants for the pokeage program. all token amounts use 6 decimals.

/// $pokeage uses 6 decimals like the pump.fun token-2022 mint
pub const DECIMALS: u8 = 6;

/// whole-token to base-unit helper. pokeage(1) == 1_000_000 base units.
pub const fn pokeage(n: u64) -> u64 {
    n * 1_000_000
}

// one-time agent deploy burn
pub const DEPLOY_COST: u64 = pokeage(1_000);

// catch sinks by rarity
pub const CATCH_COMMON: u64 = pokeage(10);
pub const CATCH_RARE: u64 = pokeage(100);
pub const CATCH_LEGENDARY: u64 = pokeage(1_000);

// gym challenge sink
pub const GYM_COST: u64 = pokeage(50);

// forced evolution sink, intentionally steep
pub const FORCE_EVOLVE_COST: u64 = pokeage(75_000);

// sink split: 70 percent burned, 30 percent routed to the buyback pool
pub const BURN_BPS: u16 = 7000;
pub const POOL_BPS: u16 = 3000;

// secondary-market trade fee, 5 percent of price
pub const MARKET_FEE_BPS: u16 = 500;
// of the trade fee, 60 percent feeds the pool, 40 percent is the burn share
pub const POOL_SHARE_BPS: u16 = 6000;
pub const BURN_SHARE_BPS: u16 = 4000;

// instant sell pays floor times 50 percent
pub const INSTANT_SELL_BPS: u16 = 5000;

// flat listing fee in lamports, 0.001 sol
pub const LISTING_FEE_LAMPORTS: u64 = 1_000_000;

// basis-point denominator
pub const BPS_DENOM: u64 = 10_000;

// tier codes
pub const TIER_COMMON: u8 = 0;
pub const TIER_UNCOMMON: u8 = 1;
pub const TIER_RARE: u8 = 2;
pub const TIER_HOLO: u8 = 3;
pub const TIER_ULTRA: u8 = 4;
pub const TIER_SECRET: u8 = 5;
pub const MAX_TIER: u8 = 5;

// number of obtainable gym badges
pub const BADGE_COUNT: u8 = 12;

// rarity codes for catch_attempt
pub const RARITY_NORMAL: u8 = 0;
pub const RARITY_RARE: u8 = 1;
pub const RARITY_LEGENDARY: u8 = 2;

// nft mint fee per tier, lamports
pub const MINT_FEE_COMMON: u64 = 1_000_000; // 0.001 sol
pub const MINT_FEE_UNCOMMON: u64 = 3_000_000;
pub const MINT_FEE_RARE: u64 = 10_000_000;
pub const MINT_FEE_HOLO: u64 = 50_000_000;
pub const MINT_FEE_ULTRA: u64 = 200_000_000;
pub const MINT_FEE_SECRET: u64 = 1_000_000_000;

// pda seeds
pub const CONFIG_SEED: &[u8] = b"config";
pub const PLAYER_SEED: &[u8] = b"player";
pub const LISTING_SEED: &[u8] = b"listing";
pub const POOL_SEED: &[u8] = b"buyback_pool";
pub const CARD_SEED: &[u8] = b"card";
pub const ESCROW_SEED: &[u8] = b"escrow";

use anchor_lang::prelude::*;
use crate::errors::PokeageError;

/// lamport mint fee for a tier code. rejects out-of-range tiers.
pub fn mint_fee_for_tier(tier: u8) -> Result<u64> {
    let fee = match tier {
        TIER_COMMON => MINT_FEE_COMMON,
        TIER_UNCOMMON => MINT_FEE_UNCOMMON,
        TIER_RARE => MINT_FEE_RARE,
        TIER_HOLO => MINT_FEE_HOLO,
        TIER_ULTRA => MINT_FEE_ULTRA,
        TIER_SECRET => MINT_FEE_SECRET,
        _ => return Err(error!(PokeageError::InvalidTier)),
    };
    Ok(fee)
}

/// token sink cost for a catch rarity code.
pub fn catch_cost_for_rarity(rarity: u8) -> Result<u64> {
    let cost = match rarity {
        RARITY_NORMAL => CATCH_COMMON,
        RARITY_RARE => CATCH_RARE,
        RARITY_LEGENDARY => CATCH_LEGENDARY,
        _ => return Err(error!(PokeageError::InvalidRarity)),
    };
    Ok(cost)
}

/// `amount * bps / 10000` in u128 space, checked, then narrowed back to u64.
/// shared by fee and split math so rounding behaves identically everywhere.
pub fn bps_of(amount: u64, bps: u64) -> Result<u64> {
    let v = (amount as u128)
        .checked_mul(bps as u128)
        .ok_or(PokeageError::MathOverflow)?
        .checked_div(BPS_DENOM as u128)
        .ok_or(PokeageError::MathOverflow)?;
    if v > u64::MAX as u128 {
        return Err(error!(PokeageError::MathOverflow));
    }
    Ok(v as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_helper_scales_by_decimals() {
