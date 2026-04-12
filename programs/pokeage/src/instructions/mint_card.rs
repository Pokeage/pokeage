//! mint_card: records a card on-chain and splits the sol mint fee 50/50.

use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::CardMinted;
use crate::state::{BuybackPool, CardMeta, Config};

#[derive(Accounts)]
pub struct MintCard<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [POOL_SEED],
        bump = buyback_pool.bump
    )]
    pub buyback_pool: Account<'info, BuybackPool>,

    /// the card mint key, recorded but not created here. metaplex mint happens
    /// off this program to keep the dep set small.
    /// CHECK: identity only, stored into card_meta.mint.
    pub card_mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = CardMeta::LEN,
        seeds = [CARD_SEED, card_mint.key().as_ref()],
        bump
    )]
    pub card_meta: Account<'info, CardMeta>,

    /// vault that holds the pool sol home, lamports added directly.
    /// CHECK: must equal config.buyback_vault.
    #[account(mut, address = config.buyback_vault)]
    pub buyback_vault: UncheckedAccount<'info>,

    /// treasury sink, must equal config.treasury.
    /// CHECK: must equal config.treasury.
    #[account(mut, address = config.treasury)]
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn mint_card_handler(ctx: Context<MintCard>, tier: u8, stage: u8, level: u8) -> Result<()> {
    require!(
        !ctx.accounts.config.is_paused(Config::PAUSE_MINT),
        PokeageError::FeaturePaused
    );
    require!(tier <= MAX_TIER, PokeageError::InvalidTier);

    let fee = mint_fee_for_tier(tier)?;
    // 50 percent to pool, remainder to treasury so the full fee is accounted
    let pool_cut = bps_of(fee, 5_000)?;
    let treasury_cut = fee.checked_sub(pool_cut).ok_or(PokeageError::MathOverflow)?;
