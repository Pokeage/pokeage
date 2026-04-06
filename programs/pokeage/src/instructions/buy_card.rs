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
    /// CHECK: must equal config.buyback_vault.
    #[account(mut, address = config.buyback_vault)]
    pub buyback_vault: UncheckedAccount<'info>,

    /// burn-share sink. for sol we cannot burn so it parks in treasury for a
    /// later token buy-and-burn.
    /// CHECK: must equal config.treasury.
    #[account(mut, address = config.treasury)]
    pub treasury: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn buy_card_handler(ctx: Context<BuyCard>) -> Result<()> {
    require!(
        !ctx.accounts.config.is_paused(Config::PAUSE_MARKET),
        PokeageError::FeaturePaused
    );

    let price = ctx.accounts.listing.price;
    let fee_bps = ctx.accounts.config.market_fee_bps as u64;
    let fee = bps_of(price, fee_bps)?;
    let pool_cut = bps_of(fee, POOL_SHARE_BPS as u64)?;
    // burn share is the remainder, routed to treasury for buy-and-burn
    let burn_cut = fee.checked_sub(pool_cut).ok_or(PokeageError::MathOverflow)?;
    let seller_net = price.checked_sub(fee).ok_or(PokeageError::MathOverflow)?;

    let listing_key = ctx.accounts.listing.key();
    let card_mint_key = ctx.accounts.card_mint.key();

    // cei: mutate pool and flip listing before transfers
    let pool = &mut ctx.accounts.buyback_pool;
    pool.total_lamports = pool
        .total_lamports
        .checked_add(pool_cut)
        .ok_or(PokeageError::MathOverflow)?;
    pool.lifetime_in = pool
        .lifetime_in
        .checked_add(pool_cut)
        .ok_or(PokeageError::MathOverflow)?;
    ctx.accounts.listing.active = false;

    // buyer -> seller, net of fee
    if seller_net > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
            ),
            seller_net,
        )?;
    }
    // buyer -> pool vault, pool share of fee
    if pool_cut > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.buyback_vault.to_account_info(),
                },
            ),
            pool_cut,
        )?;
    }
    // buyer -> treasury, burn share of fee
    if burn_cut > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            burn_cut,
        )?;
    }

    // card escrow -> buyer
    let seeds: &[&[u8]] = &[LISTING_SEED, card_mint_key.as_ref(), &[ctx.accounts.listing.bump]];
    let signer = &[seeds];
    let xfer = TransferChecked {
        from: ctx.accounts.escrow_card.to_account_info(),
        mint: ctx.accounts.card_mint.to_account_info(),
        to: ctx.accounts.buyer_card.to_account_info(),
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

    emit!(CardSold {
        listing: listing_key,
        buyer: ctx.accounts.buyer.key(),
        price,
        fee,
    });
    Ok(())
}
