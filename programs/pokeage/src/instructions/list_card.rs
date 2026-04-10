//! list_card: escrows the card nft and opens a listing. charges a flat fee.

use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    self, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::CardListed;
use crate::state::{BuybackPool, Config, Listing};

#[derive(Accounts)]
pub struct ListCard<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Box<Account<'info, Config>>,

    #[account(
        mut,
        seeds = [POOL_SEED],
        bump = buyback_pool.bump
    )]
    pub buyback_pool: Box<Account<'info, BuybackPool>>,

    pub card_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = seller,
        space = Listing::LEN,
        seeds = [LISTING_SEED, card_mint.key().as_ref()],
        bump
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        mut,
        token::mint = card_mint,
        token::authority = seller
    )]
    pub seller_card: Box<InterfaceAccount<'info, TokenAccount>>,

    /// program-owned escrow ata, authority is the listing pda.
    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = card_mint,
        associated_token::authority = listing
    )]
    pub escrow_card: Box<InterfaceAccount<'info, TokenAccount>>,

    /// pool sol home, receives the listing fee lamports.
    /// CHECK: must equal config.buyback_vault.
    #[account(mut, address = config.buyback_vault)]
    pub buyback_vault: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
