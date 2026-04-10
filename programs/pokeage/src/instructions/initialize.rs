//! initialize: creates the config and buyback pool pdas.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::state::{BuybackPool, Config};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Config::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = authority,
        space = BuybackPool::LEN,
        seeds = [POOL_SEED],
        bump
    )]
    pub buyback_pool: Account<'info, BuybackPool>,

    pub page_mint: InterfaceAccount<'info, Mint>,

    /// treasury sink, a system-owned or pda account that collects sol fees.
    /// CHECK: validated only as a lamport destination, stored in config.
    pub treasury: UncheckedAccount<'info>,

    /// buyback vault, holds bought-back cards and the pool token balance owner.
    /// CHECK: stored in config, used as the lamport home of the pool.
    pub buyback_vault: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_handler(
    ctx: Context<Initialize>,
    burn_bps: u16,
    pool_bps: u16,
    market_fee_bps: u16,
    listing_fee: u64,
) -> Result<()> {
    require!(
        (burn_bps as u64)
            .checked_add(pool_bps as u64)
            .ok_or(PokeageError::MathOverflow)?
            == BPS_DENOM,
        PokeageError::InvalidFeeConfig
    );
    // cap market fee at 20 percent to protect traders
    require!(market_fee_bps <= 2000, PokeageError::InvalidFeeConfig);

    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.page_mint = ctx.accounts.page_mint.key();
    config.treasury = ctx.accounts.treasury.key();
    config.buyback_vault = ctx.accounts.buyback_vault.key();
    config.burn_bps = burn_bps;
    config.pool_bps = pool_bps;
    config.market_fee_bps = market_fee_bps;
    config.instant_sell_bps = INSTANT_SELL_BPS;
    config.listing_fee = listing_fee;
    config.total_burned = 0;
    config.total_cards_minted = 0;
    config.paused = 0;
    config.bump = ctx.bumps.config;

    let pool = &mut ctx.accounts.buyback_pool;
    pool.total_lamports = 0;
    pool.lifetime_in = 0;
    pool.lifetime_out = 0;
    pool.floor_price = 0;
    // fail-closed: pool starts disabled until authority sets a floor
    pool.instant_sell_enabled = false;
    pool.bump = ctx.bumps.buyback_pool;

    Ok(())
}
