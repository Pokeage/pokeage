//! gym_challenge: burns gym_cost 70/30, awards a badge, bumps win count.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::GymChallenged;
use crate::instructions::shared::{apply_sink, SinkAccounts};
use crate::state::{Config, PlayerState};

#[derive(Accounts)]
pub struct GymChallenge<'info> {
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

pub fn gym_challenge_handler(ctx: Context<GymChallenge>, badge_index: u8) -> Result<()> {
    require!(ctx.accounts.player_state.agent_deployed, PokeageError::AgentNotDeployed);
    require!(badge_index < BADGE_COUNT, PokeageError::InvalidBadgeIndex);

    // cei: state first
    let ps = &mut ctx.accounts.player_state;
    ps.set_badge(badge_index);
    ps.gym_wins = ps.gym_wins.checked_add(1).ok_or(PokeageError::MathOverflow)?;
    ps.last_action = Clock::get()?.unix_timestamp;

    let sink = SinkAccounts {
        page_mint: ctx.accounts.page_mint.clone(),
        payer_token: ctx.accounts.player_token.clone(),
        pool_token: ctx.accounts.pool_token.clone(),
        payer: ctx.accounts.player.clone(),
        token_program: ctx.accounts.token_program.clone(),
    };
    let split = apply_sink(&sink, GYM_COST)?;

    let config = &mut ctx.accounts.config;
    config.total_burned = config
        .total_burned
        .checked_add(split.burned)
        .ok_or(PokeageError::MathOverflow)?;

    emit!(GymChallenged {
        player: ctx.accounts.player.key(),
        badge_index,
    });
    Ok(())
}
