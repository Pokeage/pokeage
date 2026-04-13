//! shared token-sink helper. splits a pokeage amount 70 burn / 30 pool.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    self, Burn, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::{bps_of, BURN_BPS, POOL_BPS};
use crate::errors::PokeageError;

/// result of a sink split, base units.
pub struct SinkSplit {
    pub burned: u64,
    pub to_pool: u64,
}

/// computes the 70/30 split with checked math. pool part is the remainder so
/// nothing is lost to integer truncation.
pub fn compute_split(total: u64) -> Result<SinkSplit> {
    let burned = bps_of(total, BURN_BPS as u64)?;
    // remainder goes to the pool, keeps burn + pool == total exactly
    let to_pool = total.checked_sub(burned).ok_or(PokeageError::MathOverflow)?;
    // pool_bps is declared for clarity, ratio must stay 70/30
    let _ = POOL_BPS;
    Ok(SinkSplit { burned, to_pool })
}

/// accounts every sink instruction needs to move tokens. the payer signs.
pub struct SinkAccounts<'info> {
    pub page_mint: InterfaceAccount<'info, Mint>,
    pub payer_token: InterfaceAccount<'info, TokenAccount>,
    pub pool_token: InterfaceAccount<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}

/// burns 70 percent from payer_token and moves 30 percent to pool_token.
/// returns the realized split for event/config bookkeeping.
pub fn apply_sink(accounts: &SinkAccounts, total: u64) -> Result<SinkSplit> {
    require!(
        accounts.payer_token.amount >= total,
        PokeageError::InsufficientFunds
    );

    let split = compute_split(total)?;
    let decimals = accounts.page_mint.decimals;

    // burn part
    if split.burned > 0 {
        let burn_cpi = Burn {
            mint: accounts.page_mint.to_account_info(),
            from: accounts.payer_token.to_account_info(),
            authority: accounts.payer.to_account_info(),
        };
        token_interface::burn(
            CpiContext::new(accounts.token_program.to_account_info(), burn_cpi),
            split.burned,
        )?;
    }

    // pool part
    if split.to_pool > 0 {
        let xfer_cpi = TransferChecked {
            from: accounts.payer_token.to_account_info(),
            mint: accounts.page_mint.to_account_info(),
            to: accounts.pool_token.to_account_info(),
            authority: accounts.payer.to_account_info(),
        };
        token_interface::transfer_checked(
            CpiContext::new(accounts.token_program.to_account_info(), xfer_cpi),
            split.to_pool,
            decimals,
        )?;
    }

    Ok(split)
}

/// moves lamports between two program-owned (or system) accounts using a
/// direct balance adjustment. used when the source is a pda we own.
pub fn move_lamports_pda(from: &AccountInfo, to: &AccountInfo, amount: u64) -> Result<()> {
    let from_balance = from.lamports();
    require!(from_balance >= amount, PokeageError::InsufficientFunds);

    **from.try_borrow_mut_lamports()? = from_balance
        .checked_sub(amount)
        .ok_or(PokeageError::MathOverflow)?;
    let to_balance = to.lamports();
    **to.try_borrow_mut_lamports()? = to_balance
        .checked_add(amount)
        .ok_or(PokeageError::MathOverflow)?;
    Ok(())
}
