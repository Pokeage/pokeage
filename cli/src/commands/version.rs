//! `pokeage version`: crate version and program id.

use anyhow::Result;

use crate::config::PROGRAM_ID;

/// prints crate name, version, and the target program id.
pub fn run() -> Result<()> {
    println!("{} {}", env!("CARGO_PKG_NAME"), env!("CARGO_PKG_VERSION"));
    println!("program id {}", PROGRAM_ID);
    println!("token $PAGE, 6 decimals, devnet-oriented, pre-deployment");
    Ok(())
}
