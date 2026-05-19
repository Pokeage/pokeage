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
    pub deploy_share: f64, // fraction of active users deploying that day
    pub catches_common: u32,
    pub catches_rare: u32,
    pub catches_legendary: u32,
    pub gym_runs: u32,
    pub force_evolves_per_1000: u32, // rare, expressed per thousand active users
}

impl Default for DailyProfile {
    /// baseline mix from the tokenomics doc: deploy is one-time so only a small
    /// slice deploys each day, catching dominates volume, evolves are rare.
    fn default() -> Self {
        DailyProfile {
            deploy_share: 0.05,
            catches_common: 8,
            catches_rare: 2,
            catches_legendary: 0,
            gym_runs: 1,
            force_evolves_per_1000: 3,
        }
    }
}

/// one row of the projection, all token figures in base units.
#[derive(Clone, Copy)]
pub struct ProjectionDay {
    pub day: u32,
    pub daily_sink: u64,
    pub daily_burn: u64,
    pub daily_pool: u64,
    pub cum_burn: u64,
    pub cum_pool: u64,
}

/// full projection result.
pub struct Projection {
    pub days: u32,
    pub daily_active: u64,
    pub rows: Vec<ProjectionDay>,
    pub total_sink: u64,
    pub total_burn: u64,
    pub total_pool: u64,
}

/// per-active-user daily sink in base units for a given profile.
fn daily_sink_per_user(p: &DailyProfile) -> Result<u64, CliError> {
    let mut sink: u64 = 0;

    // amortized deploy: deploy_share of users pay the one-time deploy cost.
    let deploy_units = (DEPLOY_COST as f64 * p.deploy_share).round() as u64;
    sink = sink.checked_add(deploy_units).ok_or(CliError::Math("deploy add overflow"))?;

    let common = CATCH_COMMON
        .checked_mul(p.catches_common as u64)
        .ok_or(CliError::Math("common catch overflow"))?;
    let rare = CATCH_RARE
        .checked_mul(p.catches_rare as u64)
        .ok_or(CliError::Math("rare catch overflow"))?;
    let legendary = CATCH_LEGENDARY
        .checked_mul(p.catches_legendary as u64)
        .ok_or(CliError::Math("legendary catch overflow"))?;
    let gym = GYM_COST
        .checked_mul(p.gym_runs as u64)
        .ok_or(CliError::Math("gym overflow"))?;

    // force evolve is expressed per thousand users, so divide back out.
    let evolve = FORCE_EVOLVE_COST
        .checked_mul(p.force_evolves_per_1000 as u64)
        .ok_or(CliError::Math("evolve overflow"))?
        / 1000;

    for part in [common, rare, legendary, gym, evolve] {
        sink = sink.checked_add(part).ok_or(CliError::Math("sink add overflow"))?;
    }
    Ok(sink)
}

/// simulates daily burn and pool accrual over the horizon. flat active count,
/// fixed profile, no growth curve. checked arithmetic throughout.
pub fn project(days: u32, daily_active: u64, profile: DailyProfile) -> Result<Projection, CliError> {
    if days == 0 {
        return Err(CliError::Input("days must be at least 1"));
    }

    let per_user = daily_sink_per_user(&profile)?;
    let daily_sink = per_user
        .checked_mul(daily_active)
        .ok_or(CliError::Math("daily sink overflow"))?;
    let (daily_burn, daily_pool) = split_sink(daily_sink)?;

    let mut rows = Vec::with_capacity(days as usize);
    let mut cum_burn: u64 = 0;
    let mut cum_pool: u64 = 0;

    for day in 1..=days {
        cum_burn = cum_burn.checked_add(daily_burn).ok_or(CliError::Math("cum burn overflow"))?;
        cum_pool = cum_pool.checked_add(daily_pool).ok_or(CliError::Math("cum pool overflow"))?;
        rows.push(ProjectionDay {
            day,
            daily_sink,
            daily_burn,
            daily_pool,
            cum_burn,
            cum_pool,
        });
    }

    let total_sink = daily_sink
        .checked_mul(days as u64)
        .ok_or(CliError::Math("total sink overflow"))?;

    Ok(Projection {
        days,
        daily_active,
        rows,
        total_sink,
        total_burn: cum_burn,
        total_pool: cum_pool,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_scale_matches_program() {
        assert_eq!(pokeage(1), 1_000_000);
        assert_eq!(DEPLOY_COST, 1_000_000_000);
        assert_eq!(FORCE_EVOLVE_COST, 75_000_000_000);
    }

    #[test]
    fn split_sink_is_lossless_70_30() {
        let (burn, pool) = split_sink(DEPLOY_COST).unwrap();
        assert_eq!(burn, 700_000_000);
        assert_eq!(pool, 300_000_000);
        assert_eq!(burn + pool, DEPLOY_COST);
    }

    #[test]
    fn split_sink_handles_odd_remainder() {
        let (burn, pool) = split_sink(7).unwrap();
        // 7 * 7000 / 10000 = 4 (truncated), pool gets the remaining 3.
        assert_eq!(burn, 4);
        assert_eq!(pool, 3);
        assert_eq!(burn + pool, 7);
    }

    #[test]
    fn instant_sell_is_half_floor() {
        assert_eq!(instant_sell_quote(2_000_000).unwrap(), 1_000_000);
        assert_eq!(instant_sell_quote(0).unwrap(), 0);
    }

    #[test]
    fn bps_of_stays_in_u128() {
        let r = bps_of(u64::MAX, 100).unwrap();
        assert_eq!(r, (u64::MAX as u128 * 100 / 10_000) as u64);
    }

    #[test]
    fn mint_fee_table_is_monotonic() {
        let mut prev = 0u64;
        for fee in MINT_FEE_BY_TIER {
            assert!(fee > prev);
            prev = fee;
        }
    }

    #[test]
    fn fmt_helpers_pad_fraction() {
        assert_eq!(fmt_page(1_500_000), "1.500000");
        assert_eq!(fmt_page(7), "0.000007");
        assert_eq!(fmt_sol(1_000_000_000), "1.000000000");
        assert_eq!(fmt_sol(1), "0.000000001");
    }

    #[test]
    fn projection_accumulates_and_splits() {
        let p = project(30, 1_000, DailyProfile::default()).unwrap();
        assert_eq!(p.rows.len(), 30);
        let last = p.rows.last().unwrap();
        // cumulative on the last day equals daily times days.
        assert_eq!(last.cum_burn, last.daily_burn * 30);
        assert_eq!(last.cum_pool, last.daily_pool * 30);
        // burn plus pool equals the full sink each day.
        assert_eq!(last.daily_burn + last.daily_pool, last.daily_sink);
        assert_eq!(p.total_sink, last.daily_sink * 30);
        assert_eq!(p.total_burn, last.cum_burn);
    }

    #[test]
    fn projection_rejects_zero_days() {
        assert!(project(0, 100, DailyProfile::default()).is_err());
    }

    #[test]
    fn projection_scales_with_users() {
        let one = project(1, 1, DailyProfile::default()).unwrap();
        let many = project(1, 1_000, DailyProfile::default()).unwrap();
        assert_eq!(many.total_sink, one.total_sink * 1_000);
    }
}
