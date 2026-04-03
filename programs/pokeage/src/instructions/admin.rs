//! authority-gated admin instructions: floor, instant-sell toggle, treasury
//! withdraw, and the pause bitmask.

use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::PokeageError;
use crate::instructions::shared::move_lamports_pda;
use crate::state::{BuybackPool, Config};

#[derive(Accounts)]
pub struct UpdateFloor<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = authority @ PokeageError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    #[account(mut, seeds = [POOL_SEED], bump = buyback_pool.bump)]
    pub buyback_pool: Account<'info, BuybackPool>,
}

pub fn update_floor(ctx: Context<UpdateFloor>, floor_price: u64) -> Result<()> {
    let pool = &mut ctx.accounts.buyback_pool;
    pool.floor_price = floor_price;

    // auto-toggle: only enable instant sell when the pool can cover one payout
    if floor_price == 0 {
        pool.instant_sell_enabled = false;
    } else {
        let one_payout = bps_of(floor_price, INSTANT_SELL_BPS as u64)?;
        if pool.total_lamports < one_payout {
            pool.instant_sell_enabled = false;
        }
    }
    Ok(())
}

#[derive(Accounts)]
pub struct SetInstantSell<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = authority @ PokeageError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    #[account(mut, seeds = [POOL_SEED], bump = buyback_pool.bump)]
    pub buyback_pool: Account<'info, BuybackPool>,
}

pub fn set_instant_sell(ctx: Context<SetInstantSell>, enabled: bool) -> Result<()> {
    // guard: cannot enable without a floor, keeps the fail-closed invariant
