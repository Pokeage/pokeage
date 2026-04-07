//! cancel_listing: returns the escrowed card and closes the listing account.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    self, CloseAccount, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::*;
use crate::errors::PokeageError;
use crate::events::ListingCancelled;
use crate::state::Listing;

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [LISTING_SEED, card_mint.key().as_ref()],
        bump = listing.bump,
        constraint = listing.seller == seller.key() @ PokeageError::NotListingOwner,
        constraint = listing.active @ PokeageError::ListingInactive,
        close = seller
    )]
    pub listing: Account<'info, Listing>,

    pub card_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = card_mint,
        token::authority = seller
    )]
    pub seller_card: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = card_mint,
        token::authority = listing
    )]
    pub escrow_card: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn cancel_listing_handler(ctx: Context<CancelListing>) -> Result<()> {
    let card_mint_key = ctx.accounts.card_mint.key();
    let seeds: &[&[u8]] = &[LISTING_SEED, card_mint_key.as_ref(), &[ctx.accounts.listing.bump]];
    let signer = &[seeds];

    // cei: flip inactive before any transfer. account is closed at end anyway.
    let listing_key = ctx.accounts.listing.key();
    ctx.accounts.listing.active = false;

    // return card escrow -> seller
    let xfer = TransferChecked {
        from: ctx.accounts.escrow_card.to_account_info(),
        mint: ctx.accounts.card_mint.to_account_info(),
        to: ctx.accounts.seller_card.to_account_info(),
        authority: ctx.accounts.listing.to_account_info(),
    };
    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            xfer,
            signer,
        ),
        1,
        ctx.accounts.card_mint.decimals,
    )?;

    // reclaim escrow ata rent to the seller
    let close = CloseAccount {
        account: ctx.accounts.escrow_card.to_account_info(),
        destination: ctx.accounts.seller.to_account_info(),
        authority: ctx.accounts.listing.to_account_info(),
    };
    token_interface::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close,
        signer,
    ))?;

    emit!(ListingCancelled { listing: listing_key });
    Ok(())
}
