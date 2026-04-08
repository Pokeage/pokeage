//! catch_attempt: burns a rarity-scaled cost split 70/30, bumps caught count.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::CatchAttempted;
use crate::instructions::shared::{apply_sink, SinkAccounts};
use crate::state::{Config, PlayerState};

#[derive(Accounts)]
pub struct CatchAttempt<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, player.key().as_ref()],
        bump = player_state.bump,
        constraint = player_state.owner == player.key() @ PokeageError::Unauthorized
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(address = config.page_mint)]
    pub page_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = page_mint,
        token::authority = player
    )]
    pub player_token: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, token::mint = page_mint)]
    pub pool_token: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn catch_attempt_handler(ctx: Context<CatchAttempt>, rarity: u8) -> Result<()> {
    require!(
        !ctx.accounts.config.is_paused(Config::PAUSE_CATCH),
        PokeageError::FeaturePaused
    );
    require!(ctx.accounts.player_state.agent_deployed, PokeageError::AgentNotDeployed);

    let cost = catch_cost_for_rarity(rarity)?;

    // cei: bump state first
    let ps = &mut ctx.accounts.player_state;
    ps.total_caught = ps.total_caught.checked_add(1).ok_or(PokeageError::MathOverflow)?;
    ps.last_action = Clock::get()?.unix_timestamp;

    let sink = SinkAccounts {
        page_mint: ctx.accounts.page_mint.clone(),
        payer_token: ctx.accounts.player_token.clone(),
        pool_token: ctx.accounts.pool_token.clone(),
        payer: ctx.accounts.player.clone(),
        token_program: ctx.accounts.token_program.clone(),
    };
    let split = apply_sink(&sink, cost)?;

    let config = &mut ctx.accounts.config;
    config.total_burned = config
        .total_burned
        .checked_add(split.burned)
        .ok_or(PokeageError::MathOverflow)?;

    emit!(CatchAttempted {
        player: ctx.accounts.player.key(),
        rarity,
        burned: split.burned,
        to_pool: split.to_pool,
    });
    Ok(())
}
