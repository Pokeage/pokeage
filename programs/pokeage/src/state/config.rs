//! global program config plus pause bitflags.

use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub authority: Pubkey,
    pub page_mint: Pubkey,
    pub treasury: Pubkey,
    pub buyback_vault: Pubkey,
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
    // pause bitflags, combined into the single paused byte
    pub const PAUSE_CATCH: u8 = 1;
    pub const PAUSE_MINT: u8 = 2;
    pub const PAUSE_MARKET: u8 = 4;
    pub const PAUSE_INSTANT_SELL: u8 = 8;

    // 8 disc + 4*32 pubkeys + 4*2 u16 + 3*8 u64 + 2*1 u8
    pub const LEN: usize = 8 + (32 * 4) + (2 * 4) + (8 * 3) + 1 + 1;

    /// true when the given pause flag bit is set
    pub fn is_paused(&self, flag: u8) -> bool {
        self.paused & flag != 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn blank() -> Config {
        Config {
            authority: Pubkey::default(),
            page_mint: Pubkey::default(),
            treasury: Pubkey::default(),
            buyback_vault: Pubkey::default(),
            burn_bps: 7000,
            pool_bps: 3000,
            market_fee_bps: 500,
            instant_sell_bps: 5000,
            listing_fee: 1_000_000,
            total_burned: 0,
            total_cards_minted: 0,
            paused: 0,
            bump: 0,
        }
    }

    #[test]
    fn pause_flags_are_independent() {
        let mut c = blank();
        c.paused = Config::PAUSE_CATCH | Config::PAUSE_MARKET;
        assert!(c.is_paused(Config::PAUSE_CATCH));
        assert!(c.is_paused(Config::PAUSE_MARKET));
        assert!(!c.is_paused(Config::PAUSE_MINT));
        assert!(!c.is_paused(Config::PAUSE_INSTANT_SELL));
    }

    #[test]
    fn no_pause_reads_clear() {
        let c = blank();
        assert!(!c.is_paused(Config::PAUSE_CATCH));
        assert!(!c.is_paused(Config::PAUSE_INSTANT_SELL));
    }
}
