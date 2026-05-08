//! command handlers. each file owns one subcommand.

pub mod config;
pub mod listing;
pub mod player;
pub mod pool;
pub mod sim;
pub mod stats;
pub mod version;

/// shared label for the "not initialized" path.
pub const NOT_INIT: &str = "not initialized";
