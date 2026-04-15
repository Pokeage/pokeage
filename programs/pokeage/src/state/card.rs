//! on-chain record for a minted card. mirrors tier/stage/level for indexing.

use anchor_lang::prelude::*;

#[account]
pub struct CardMeta {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub tier: u8,
    pub stage: u8,
    pub level: u8,
    pub minted_at: i64,
    pub bump: u8,
}

impl CardMeta {
    // 8 disc + 2*32 pubkeys + 3*1 u8 + 8 i64 + 1 bump
    pub const LEN: usize = 8 + (32 * 2) + 3 + 8 + 1;
}
