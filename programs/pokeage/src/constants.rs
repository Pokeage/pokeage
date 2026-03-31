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
