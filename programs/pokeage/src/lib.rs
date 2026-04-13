//! pokeage on-chain economy for pokeage. token sinks burn 70 percent and route 30
//! percent to a buyback pool, a card marketplace runs in sol with a fail-closed
//! instant-sell floor. one program, single authority, pre-deployment.

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod pokeage {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        burn_bps: u16,
        pool_bps: u16,
        market_fee_bps: u16,
        listing_fee: u64,
    ) -> Result<()> {
        instructions::initialize::initialize_handler(
            ctx,
            burn_bps,
            pool_bps,
            market_fee_bps,
            listing_fee,
        )
    }

    pub fn deploy_agent(ctx: Context<DeployAgent>) -> Result<()> {
        instructions::deploy_agent::deploy_agent_handler(ctx)
    }

    pub fn catch_attempt(ctx: Context<CatchAttempt>, rarity: u8) -> Result<()> {
        instructions::catch_attempt::catch_attempt_handler(ctx, rarity)
    }

    pub fn gym_challenge(ctx: Context<GymChallenge>, badge_index: u8) -> Result<()> {
        instructions::gym_challenge::gym_challenge_handler(ctx, badge_index)
    }

    pub fn force_evolve(ctx: Context<ForceEvolve>) -> Result<()> {
        instructions::force_evolve::force_evolve_handler(ctx)
    }

    pub fn mint_card(ctx: Context<MintCard>, tier: u8, stage: u8, level: u8) -> Result<()> {
        instructions::mint_card::mint_card_handler(ctx, tier, stage, level)
    }

    pub fn list_card(
        ctx: Context<ListCard>,
        price: u64,
        tier: u8,
        level: u8,
        stage: u8,
    ) -> Result<()> {
        instructions::list_card::list_card_handler(ctx, price, tier, level, stage)
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        instructions::cancel_listing::cancel_listing_handler(ctx)
    }

    pub fn buy_card(ctx: Context<BuyCard>) -> Result<()> {
        instructions::buy_card::buy_card_handler(ctx)
    }

    pub fn instant_sell(ctx: Context<InstantSell>) -> Result<()> {
        instructions::instant_sell::instant_sell_handler(ctx)
    }

    pub fn update_floor(ctx: Context<UpdateFloor>, floor_price: u64) -> Result<()> {
        instructions::admin::update_floor(ctx, floor_price)
    }

    pub fn set_instant_sell(ctx: Context<SetInstantSell>, enabled: bool) -> Result<()> {
        instructions::admin::set_instant_sell(ctx, enabled)
    }

    pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        instructions::admin::withdraw_treasury(ctx, amount)
    }

    pub fn set_pause(ctx: Context<SetPause>, flags: u8) -> Result<()> {
        instructions::admin::set_pause(ctx, flags)
    }
}
