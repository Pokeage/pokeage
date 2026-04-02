//! on-chain events emitted by pokeage handlers. indexers read these.

use anchor_lang::prelude::*;

#[event]
pub struct AgentDeployed {
    pub player: Pubkey,
    pub burned: u64,
}

#[event]
pub struct CatchAttempted {
    pub player: Pubkey,
    pub rarity: u8,
    pub burned: u64,
    pub to_pool: u64,
}

#[event]
pub struct GymChallenged {
    pub player: Pubkey,
    pub badge_index: u8,
}

#[event]
pub struct Evolved {
    pub player: Pubkey,
    pub burned: u64,
}

#[event]
pub struct CardMinted {
    pub card_mint: Pubkey,
    pub tier: u8,
    pub fee: u64,
}

#[event]
pub struct CardListed {
    pub listing: Pubkey,
    pub price: u64,
}

#[event]
pub struct ListingCancelled {
    pub listing: Pubkey,
}

#[event]
pub struct CardSold {
    pub listing: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
    pub fee: u64,
}

#[event]
pub struct InstantSold {
    pub seller: Pubkey,
    pub payout: u64,
}
