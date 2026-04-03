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
    if enabled {
        require!(
            ctx.accounts.buyback_pool.floor_price > 0,
            PokeageError::FloorNotSet
        );
    }
    ctx.accounts.buyback_pool.instant_sell_enabled = enabled;
    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = authority @ PokeageError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    /// treasury sol home, must match config.
    /// CHECK: must equal config.treasury.
    #[account(mut, address = config.treasury)]
    pub treasury: UncheckedAccount<'info>,
}

pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
    require!(
        ctx.accounts.treasury.lamports() >= amount,
        PokeageError::InsufficientFunds
    );
    move_lamports_pda(
        &ctx.accounts.treasury.to_account_info(),
        &ctx.accounts.authority.to_account_info(),
        amount,
    )?;
    Ok(())
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = authority @ PokeageError::Unauthorized
    )]
    pub config: Account<'info, Config>,
}

pub fn set_pause(ctx: Context<SetPause>, flags: u8) -> Result<()> {
    ctx.accounts.config.paused = flags;
    Ok(())
}
