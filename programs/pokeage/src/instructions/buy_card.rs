//! buy_card: buyer pays price, fee splits 60 pool / 40 burn-share, card moves out.

use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    self, CloseAccount, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::CardSold;
use crate::state::{BuybackPool, Config, Listing};

#[derive(Accounts)]
pub struct BuyCard<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Box<Account<'info, Config>>,

    #[account(
        mut,
        seeds = [POOL_SEED],
        bump = buyback_pool.bump
    )]
    pub buyback_pool: Box<Account<'info, BuybackPool>>,

    #[account(
        mut,
        seeds = [LISTING_SEED, card_mint.key().as_ref()],
        bump = listing.bump,
        constraint = listing.active @ PokeageError::ListingInactive,
        close = seller
    )]
    pub listing: Box<Account<'info, Listing>>,

    /// seller receives net proceeds. must match the listing record.
    /// CHECK: validated against listing.seller.
    #[account(mut, address = listing.seller)]
    pub seller: UncheckedAccount<'info>,

    pub card_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = card_mint,
        associated_token::authority = buyer
    )]
    pub buyer_card: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = card_mint,
        token::authority = listing
    )]
    pub escrow_card: Box<InterfaceAccount<'info, TokenAccount>>,

    /// pool sol home, receives the pool share of the fee.
