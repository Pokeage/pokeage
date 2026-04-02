//! immutable reason codes for the pokeage program. codes start at 6000 in the idl.

use anchor_lang::prelude::*;

#[error_code]
pub enum PokeageError {
    #[msg("agent already deployed for this player")]
    AgentAlreadyDeployed,
    #[msg("agent not deployed yet")]
    AgentNotDeployed,
    #[msg("this feature is currently paused")]
    FeaturePaused,
    #[msg("rarity code out of range")]
    InvalidRarity,
    #[msg("tier code out of range")]
    InvalidTier,
    #[msg("badge index out of range")]
    InvalidBadgeIndex,
    #[msg("listing is not active")]
    ListingInactive,
    #[msg("signer is not the listing owner")]
    NotListingOwner,
    #[msg("buyback pool has insufficient lamports")]
    PoolInsufficient,
    #[msg("instant sell is disabled")]
    InstantSellDisabled,
    #[msg("floor price is not set")]
    FloorNotSet,
    #[msg("checked math overflow")]
    MathOverflow,
    #[msg("fee config is invalid")]
    InvalidFeeConfig,
    #[msg("signer is not authorized")]
    Unauthorized,
    #[msg("insufficient funds for this action")]
    InsufficientFunds,
    #[msg("price must be greater than zero")]
    InvalidPrice,
}
