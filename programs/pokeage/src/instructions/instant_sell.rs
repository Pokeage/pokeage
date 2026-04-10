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
