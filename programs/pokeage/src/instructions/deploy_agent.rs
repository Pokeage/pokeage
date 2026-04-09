//! deploy_agent: one-time agent deploy, burns deploy_cost split 70/30.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::AgentDeployed;
use crate::instructions::shared::{apply_sink, SinkAccounts};
use crate::state::{Config, PlayerState};

#[derive(Accounts)]
pub struct DeployAgent<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init_if_needed,
        payer = player,
        space = PlayerState::LEN,
        seeds = [PLAYER_SEED, player.key().as_ref()],
        bump
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
    pub system_program: Program<'info, System>,
}

pub fn deploy_agent_handler(ctx: Context<DeployAgent>) -> Result<()> {
    let ps = &mut ctx.accounts.player_state;
    require!(!ps.agent_deployed, PokeageError::AgentAlreadyDeployed);

    // cei: set state first, then move tokens
    ps.owner = ctx.accounts.player.key();
    ps.agent_deployed = true;
    ps.last_action = Clock::get()?.unix_timestamp;
    if ps.bump == 0 {
        ps.bump = ctx.bumps.player_state;
    }

    let sink = SinkAccounts {
        page_mint: ctx.accounts.page_mint.clone(),
        payer_token: ctx.accounts.player_token.clone(),
        pool_token: ctx.accounts.pool_token.clone(),
        payer: ctx.accounts.player.clone(),
        token_program: ctx.accounts.token_program.clone(),
    };
    let split = apply_sink(&sink, DEPLOY_COST)?;

    let config = &mut ctx.accounts.config;
    config.total_burned = config
        .total_burned
        .checked_add(split.burned)
        .ok_or(PokeageError::MathOverflow)?;

    emit!(AgentDeployed {
        player: ctx.accounts.player.key(),
        burned: split.burned,
    });
    Ok(())
}
