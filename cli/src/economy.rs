//! economy constants and pure projection math. mirrors programs/pokeage
//! constants.rs so cli output and the chain agree without a shared crate.

use crate::error::CliError;

/// $pokeage base-unit decimals.
pub const DECIMALS: u8 = 6;

/// whole-token to base-unit scale. one $pokeage == 1_000_000 base units.
pub const ONE_PAGE: u64 = 1_000_000;

/// whole-token to base-unit helper.
pub const fn pokeage(n: u64) -> u64 {
    n * ONE_PAGE
}

// token sinks, base units.
pub const DEPLOY_COST: u64 = pokeage(1_000);
pub const CATCH_COMMON: u64 = pokeage(10);
pub const CATCH_RARE: u64 = pokeage(100);
pub const CATCH_LEGENDARY: u64 = pokeage(1_000);
pub const GYM_COST: u64 = pokeage(50);
pub const FORCE_EVOLVE_COST: u64 = pokeage(75_000);

// sink split: 70 percent burned, 30 percent to the buyback pool.
pub const BURN_BPS: u16 = 7000;
pub const POOL_BPS: u16 = 3000;

// secondary-market trade fee, 5 percent of price.
pub const MARKET_FEE_BPS: u16 = 500;

// instant sell pays floor times 50 percent.
pub const INSTANT_SELL_BPS: u16 = 5000;

// flat listing fee in lamports, 0.001 sol.
pub const LISTING_FEE_LAMPORTS: u64 = 1_000_000;

// basis-point denominator.
pub const BPS_DENOM: u64 = 10_000;

// lamports per sol, for display.
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

/// nft mint fee per tier code, lamports. index 0..=5.
pub const MINT_FEE_BY_TIER: [u64; 6] = [
    1_000_000,     // common, 0.001 sol
    3_000_000,     // uncommon
    10_000_000,    // rare
    50_000_000,    // holo
    200_000_000,   // ultra
    1_000_000_000, // secret, 1 sol
];

/// tier labels aligned with MINT_FEE_BY_TIER.
pub const TIER_NAMES: [&str; 6] = [
    "common", "uncommon", "rare", "holo", "ultra", "secret",
];

/// `amount * bps / 10000` in u128 space, checked, narrowed back to u64.
pub fn bps_of(amount: u64, bps: u64) -> Result<u64, CliError> {
    let v = (amount as u128)
        .checked_mul(bps as u128)
        .ok_or(CliError::Math("bps mul overflow"))?
        .checked_div(BPS_DENOM as u128)
        .ok_or(CliError::Math("bps div by zero"))?;
    if v > u64::MAX as u128 {
        return Err(CliError::Math("bps result exceeds u64"));
    }
    Ok(v as u64)
}

/// splits a sink amount into (burn, pool). pool is the remainder so the two
/// parts always sum back to the input with no truncation loss.
pub fn split_sink(amount: u64) -> Result<(u64, u64), CliError> {
    let burn = bps_of(amount, BURN_BPS as u64)?;
    let pool = amount.checked_sub(burn).ok_or(CliError::Math("sink underflow"))?;
    Ok((burn, pool))
}

/// instant-sell quote, floor price times the instant-sell bps.
pub fn instant_sell_quote(floor_price: u64) -> Result<u64, CliError> {
    bps_of(floor_price, INSTANT_SELL_BPS as u64)
}

/// base units to a fixed 6-decimal display string.
pub fn fmt_page(base_units: u64) -> String {
    let whole = base_units / ONE_PAGE;
    let frac = base_units % ONE_PAGE;
    format!("{}.{:06}", whole, frac)
}

/// lamports to a fixed 9-decimal sol display string.
pub fn fmt_sol(lamports: u64) -> String {
    let whole = lamports / LAMPORTS_PER_SOL;
    let frac = lamports % LAMPORTS_PER_SOL;
    format!("{}.{:09}", whole, frac)
}

/// per-user daily activity profile fed into the projection. counts are the
/// number of each sink action an active user performs in one day.
#[derive(Clone, Copy)]
pub struct DailyProfile {
