//! `pokeage player <PUBKEY>`: derives the player pda and prints progress.

use std::str::FromStr;

use anyhow::Result;
use solana_sdk::pubkey::Pubkey;

use crate::commands::NOT_INIT;
use crate::config::CliConfig;
use crate::error::CliError;
use crate::pda;
use crate::rpc;
use crate::state::PlayerState;

/// resolves the owner pubkey, derives the pda, fetches and prints state.
pub fn run(cfg: &CliConfig, owner_str: &str) -> Result<()> {
    let owner = Pubkey::from_str(owner_str)
        .map_err(|e| CliError::BadPubkey(format!("{owner_str}: {e}")))?;

    let client = cfg.rpc();
    let (player_pda, bump) = pda::player_pda(&cfg.program_id, &owner);

    println!("pokeage player");
    println!("  owner        {}", owner);
    println!("  player pda   {} (bump {})", player_pda, bump);
    println!();

    let state = match rpc::try_fetch_and_decode::<PlayerState>(&client, &player_pda)? {
        Some(s) => s,
        None => {
            println!("player       {}", NOT_INIT);
            return Ok(());
        }
    };

    // the stored owner should match the derived pda input; flag any drift.
    if state.owner != crate::state::RawKey(owner.to_bytes()) {
        println!("  warning      stored owner {} does not match query", state.owner);
    }

    println!("progress");
    println!("  agent        {}", if state.agent_deployed { "deployed" } else { "not deployed" });
    println!("  total caught {}", state.total_caught);
    println!("  gym wins     {}", state.gym_wins);
    println!("  badges       {} of {}", state.badge_count(), PlayerState::BADGE_COUNT);
    println!("  last action  {} (unix)", state.last_action);
    println!("  state bump   {}", state.bump);
    println!();

    println!("badge map (1 = owned)");
    let mut line = String::new();
    for i in 0..PlayerState::BADGE_COUNT {
        line.push(if state.has_badge(i) { '1' } else { '0' });
        line.push(' ');
    }
    println!("  bits {}", line.trim_end());
    println!("  index 0 .. {}", PlayerState::BADGE_COUNT - 1);

    Ok(())
}
