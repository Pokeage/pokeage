//! borsh mirrors of the on-chain accounts. kept independent of the program
//! crate so the cli builds without the anchor toolchain. field order matches
//! the program exactly, after the 8-byte discriminator rpc.rs strips.

use borsh::BorshDeserialize;

/// 32-byte raw key. avoids pulling solana's Pubkey into the borsh derive,
/// which keeps the decode path free of anchor trait wiring.
#[derive(BorshDeserialize, Clone, Copy, PartialEq, Eq)]
pub struct RawKey(pub [u8; 32]);

impl RawKey {
    /// base58 string, the form solana explorers and the cli print.
    pub fn to_base58(&self) -> String {
        bs58::encode(self.0).into_string()
    }

    /// all-zero key, used for the default/system address.
    pub fn is_zero(&self) -> bool {
        self.0.iter().all(|b| *b == 0)
    }
}

impl std::fmt::Display for RawKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.to_base58())
    }
}

/// global program config. mirrors state::config::Config.
#[derive(BorshDeserialize)]
pub struct Config {
    pub authority: RawKey,
    pub page_mint: RawKey,
    pub treasury: RawKey,
    pub buyback_vault: RawKey,
    pub burn_bps: u16,
    pub pool_bps: u16,
    pub market_fee_bps: u16,
    pub instant_sell_bps: u16,
    pub listing_fee: u64,
    pub total_burned: u64,
    pub total_cards_minted: u64,
    pub paused: u8,
    pub bump: u8,
}

impl Config {
    // pause bitflags packed into the single paused byte, mirror of the program.
    pub const PAUSE_CATCH: u8 = 1;
    pub const PAUSE_MINT: u8 = 2;
    pub const PAUSE_MARKET: u8 = 4;
    pub const PAUSE_INSTANT_SELL: u8 = 8;

    /// true when the given pause flag bit is set.
    pub fn is_paused(&self, flag: u8) -> bool {
        self.paused & flag != 0
    }

    /// human label list of every active pause flag.
    pub fn active_pauses(&self) -> Vec<&'static str> {
        let mut out = Vec::new();
        if self.is_paused(Self::PAUSE_CATCH) {
            out.push("catch");
        }
        if self.is_paused(Self::PAUSE_MINT) {
            out.push("mint");
        }
        if self.is_paused(Self::PAUSE_MARKET) {
            out.push("market");
        }
        if self.is_paused(Self::PAUSE_INSTANT_SELL) {
            out.push("instant_sell");
        }
        out
    }
}

/// per-player progress. mirrors state::player::PlayerState.
#[derive(BorshDeserialize)]
pub struct PlayerState {
    pub owner: RawKey,
    pub agent_deployed: bool,
    pub total_caught: u64,
    pub gym_wins: u32,
    pub badges: u16,
    pub last_action: i64,
    pub bump: u8,
}

impl PlayerState {
    /// number of obtainable gym badges, mirror of BADGE_COUNT.
    pub const BADGE_COUNT: u8 = 12;

    /// true when badge i is owned. out-of-range index reads false.
    pub fn has_badge(&self, i: u8) -> bool {
        if i >= Self::BADGE_COUNT {
            return false;
        }
        self.badges & (1u16 << i) != 0
    }

    /// count of owned badges across the 12-bit mask.
    pub fn badge_count(&self) -> u32 {
        (self.badges & 0x0FFF).count_ones()
    }
}

/// buyback pool. mirrors state::pool::BuybackPool.
#[derive(BorshDeserialize)]
pub struct BuybackPool {
    pub total_lamports: u64,
    pub lifetime_in: u64,
    pub lifetime_out: u64,
    pub floor_price: u64,
    pub instant_sell_enabled: bool,
    pub bump: u8,
}

/// secondary-market listing. mirrors state::listing::Listing.
#[derive(BorshDeserialize)]
pub struct Listing {
    pub seller: RawKey,
    pub card_mint: RawKey,
    pub price: u64,
    pub tier: u8,
    pub level: u8,
    pub stage: u8,
    pub created_at: i64,
    pub active: bool,
    pub bump: u8,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn raw_key_base58_roundtrip() {
        let bytes = [7u8; 32];
        let k = RawKey(bytes);
        let s = k.to_base58();
        let back = bs58::decode(&s).into_vec().unwrap();
        assert_eq!(back, bytes.to_vec());
    }

    #[test]
    fn zero_key_detected() {
        assert!(RawKey([0u8; 32]).is_zero());
        assert!(!RawKey([1u8; 32]).is_zero());
    }

    #[test]
    fn config_decodes_from_borsh() {
        // hand-pack a config body (no discriminator, rpc strips that)
        let mut buf = Vec::new();
        buf.extend_from_slice(&[1u8; 32]); // authority
        buf.extend_from_slice(&[2u8; 32]); // page_mint
        buf.extend_from_slice(&[3u8; 32]); // treasury
        buf.extend_from_slice(&[4u8; 32]); // buyback_vault
        buf.extend_from_slice(&7000u16.to_le_bytes());
