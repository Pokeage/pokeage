//! buyback pool. funds instant-sell payouts and accumulates market fees.

use anchor_lang::prelude::*;

#[account]
pub struct BuybackPool {
    pub total_lamports: u64,
    pub lifetime_in: u64,
    pub lifetime_out: u64,
    pub floor_price: u64,
    pub instant_sell_enabled: bool,
    pub bump: u8,
}

impl BuybackPool {
    // 8 disc + 4*8 u64 + 1 bool + 1 bump
    pub const LEN: usize = 8 + (8 * 4) + 1 + 1;
}
