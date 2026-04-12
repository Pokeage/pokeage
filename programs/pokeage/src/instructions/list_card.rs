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

pub fn list_card_handler(ctx: Context<ListCard>, price: u64, tier: u8, level: u8, stage: u8) -> Result<()> {
    require!(
        !ctx.accounts.config.is_paused(Config::PAUSE_MARKET),
        PokeageError::FeaturePaused
    );
    require!(price > 0, PokeageError::InvalidPrice);

    // cei: open listing record first
    let now = Clock::get()?.unix_timestamp;
    let listing = &mut ctx.accounts.listing;
    listing.seller = ctx.accounts.seller.key();
    listing.card_mint = ctx.accounts.card_mint.key();
    listing.price = price;
    listing.tier = tier;
    listing.level = level;
    listing.stage = stage;
    listing.created_at = now;
    listing.active = true;
    listing.bump = ctx.bumps.listing;

    let fee = ctx.accounts.config.listing_fee;
    let pool = &mut ctx.accounts.buyback_pool;
    pool.total_lamports = pool
        .total_lamports
        .checked_add(fee)
        .ok_or(PokeageError::MathOverflow)?;
    pool.lifetime_in = pool
        .lifetime_in
        .checked_add(fee)
        .ok_or(PokeageError::MathOverflow)?;

    // listing fee: seller -> pool vault
    if fee > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller.to_account_info(),
                    to: ctx.accounts.buyback_vault.to_account_info(),
                },
            ),
            fee,
        )?;
    }

    // move the card into escrow, amount 1 decimals 0 for an nft
    let xfer = TransferChecked {
        from: ctx.accounts.seller_card.to_account_info(),
        mint: ctx.accounts.card_mint.to_account_info(),
        to: ctx.accounts.escrow_card.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };
    token_interface::transfer_checked(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), xfer),
        1,
        ctx.accounts.card_mint.decimals,
    )?;

    emit!(CardListed {
        listing: ctx.accounts.listing.key(),
        price,
    });
    Ok(())
}
