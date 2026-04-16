//! secondary-market listing for a single card nft held in escrow.

use anchor_lang::prelude::*;

#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub card_mint: Pubkey,
    pub price: u64,
    pub tier: u8,
    pub level: u8,
    pub stage: u8,
    pub created_at: i64,
    pub active: bool,
    pub bump: u8,
}

impl Listing {
    // 8 disc + 2*32 pubkeys + 8 price + 3*1 u8 + 8 i64 + 1 bool + 1 bump
    pub const LEN: usize = 8 + (32 * 2) + 8 + 3 + 8 + 1 + 1;
}
