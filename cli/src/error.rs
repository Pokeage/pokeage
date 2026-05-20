//! custom error enum for the pokeage cli. rpc and io errors flow through anyhow,
//! these are the domain failures worth naming.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum CliError {
    #[error("account not found at {0}, not initialized")]
    AccountMissing(String),

    #[error("account data too short to decode: have {have} bytes, need at least {need}")]
    ShortData { have: usize, need: usize },

    #[error("borsh decode failed: {0}")]
    Decode(String),

    #[error("bad input: {0}")]
    Input(&'static str),

    #[error("arithmetic error: {0}")]
    Math(&'static str),

    #[error("invalid pubkey: {0}")]
    BadPubkey(String),

    #[error("keypair load failed at {path}: {source}")]
    Keypair {
        path: String,
        source: anyhow::Error,
    },
}
