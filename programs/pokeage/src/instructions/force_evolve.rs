//! force_evolve: burns the steep force_evolve_cost split 70/30.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::Evolved;
use crate::instructions::shared::{apply_sink, SinkAccounts};
use crate::state::{Config, PlayerState};

#[derive(Accounts)]
pub struct ForceEvolve<'info> {
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

pub fn force_evolve_handler(ctx: Context<ForceEvolve>) -> Result<()> {
    require!(ctx.accounts.player_state.agent_deployed, PokeageError::AgentNotDeployed);

    // cei: stamp action first
    let ps = &mut ctx.accounts.player_state;
    ps.last_action = Clock::get()?.unix_timestamp;

    let sink = SinkAccounts {
        page_mint: ctx.accounts.page_mint.clone(),
        payer_token: ctx.accounts.player_token.clone(),
        pool_token: ctx.accounts.pool_token.clone(),
        payer: ctx.accounts.player.clone(),
        token_program: ctx.accounts.token_program.clone(),
    };
    let split = apply_sink(&sink, FORCE_EVOLVE_COST)?;

    let config = &mut ctx.accounts.config;
    config.total_burned = config
        .total_burned
        .checked_add(split.burned)
        .ok_or(PokeageError::MathOverflow)?;

    emit!(Evolved {
        player: ctx.accounts.player.key(),
        burned: split.burned,
    });
    Ok(())
}
