//! instant_sell: fail-closed floor buy. pool pays floor*50% for the card.

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    self, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::InstantSold;
use crate::instructions::shared::move_lamports_pda;
use crate::state::{BuybackPool, Config};

#[derive(Accounts)]
pub struct InstantSell<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [POOL_SEED],
        bump = buyback_pool.bump
    )]
    pub buyback_pool: Account<'info, BuybackPool>,

    pub card_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = card_mint,
        token::authority = seller
    )]
    pub seller_card: InterfaceAccount<'info, TokenAccount>,

    /// vault-owned ata that collects bought-back cards.
    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = card_mint,
        associated_token::authority = buyback_vault
    )]
    pub vault_card: InterfaceAccount<'info, TokenAccount>,

    /// pool sol home, pays the payout.
    /// CHECK: must equal config.buyback_vault, also holds the card ata.
    #[account(mut, address = config.buyback_vault)]
    pub buyback_vault: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn instant_sell_handler(ctx: Context<InstantSell>) -> Result<()> {
    require!(
        !ctx.accounts.config.is_paused(Config::PAUSE_INSTANT_SELL),
        PokeageError::FeaturePaused
    );

    // fail-closed: both gates must be open
    require!(
        ctx.accounts.buyback_pool.instant_sell_enabled,
        PokeageError::InstantSellDisabled
    );
    require!(
        ctx.accounts.buyback_pool.floor_price > 0,
        PokeageError::FloorNotSet
    );

    let floor = ctx.accounts.buyback_pool.floor_price;
    let payout = bps_of(floor, INSTANT_SELL_BPS as u64)?;

    require!(
        ctx.accounts.buyback_pool.total_lamports >= payout,
        PokeageError::PoolInsufficient
    );

    // cei: debit pool accounting before moving anything
    let pool = &mut ctx.accounts.buyback_pool;
    pool.total_lamports = pool
        .total_lamports
        .checked_sub(payout)
        .ok_or(PokeageError::MathOverflow)?;
    pool.lifetime_out = pool
        .lifetime_out
        .checked_add(payout)
        .ok_or(PokeageError::MathOverflow)?;

    // card seller -> vault
    let xfer = TransferChecked {
        from: ctx.accounts.seller_card.to_account_info(),
        mint: ctx.accounts.card_mint.to_account_info(),
        to: ctx.accounts.vault_card.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };
    token_interface::transfer_checked(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), xfer),
        1,
        ctx.accounts.card_mint.decimals,
    )?;

    // payout: vault lamports -> seller. vault is a pda we control via config.
    move_lamports_pda(
        &ctx.accounts.buyback_vault.to_account_info(),
        &ctx.accounts.seller.to_account_info(),
        payout,
    )?;

    emit!(InstantSold {
        seller: ctx.accounts.seller.key(),
        payout,
    });
    Ok(())
}
