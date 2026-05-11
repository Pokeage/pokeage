//! `pokeage pool`: buyback pool detail plus the live instant-sell quote.

use anyhow::Result;

use crate::commands::NOT_INIT;
use crate::config::CliConfig;
use crate::economy as e;
use crate::pda;
use crate::rpc;
use crate::state::BuybackPool;

/// fetches the pool pda and prints balance, floor, and the floor*50% quote.
pub fn run(cfg: &CliConfig) -> Result<()> {
    let client = cfg.rpc();
    let (pool_pda, bump) = pda::pool_pda(&cfg.program_id);

    println!("pokeage buyback pool");
    println!("  pda          {} (bump {})", pool_pda, bump);
    println!();

    let pool = match rpc::try_fetch_and_decode::<BuybackPool>(&client, &pool_pda)? {
        Some(p) => p,
        None => {
            println!("pool         {}", NOT_INIT);
            return Ok(());
        }
    };

    let quote = e::instant_sell_quote(pool.floor_price)?;
    let drained = pool.lifetime_out;
    let net = pool.lifetime_in.saturating_sub(pool.lifetime_out);

    // tracked field vs the pda's real lamport balance. drift means rent or an
    // out-of-band transfer the program did not account for.
    let on_chain = rpc::get_balance(&client, &pool_pda)?;

    println!("balance");
    println!("  tracked      {} SOL ({} lamports)", e::fmt_sol(pool.total_lamports), pool.total_lamports);
    println!("  on chain     {} SOL ({} lamports)", e::fmt_sol(on_chain), on_chain);
    println!("  current      {} SOL ({} lamports)", e::fmt_sol(pool.total_lamports), pool.total_lamports);
    println!("  lifetime in  {} SOL", e::fmt_sol(pool.lifetime_in));
    println!("  lifetime out {} SOL", e::fmt_sol(drained));
    println!("  net inflow   {} SOL", e::fmt_sol(net));
    println!();

    println!("floor and instant sell");
    println!("  floor price  {} SOL ({} lamports)", e::fmt_sol(pool.floor_price), pool.floor_price);
    println!("  enabled      {}", if pool.instant_sell_enabled { "yes" } else { "no" });
    println!("  quote        {} SOL", e::fmt_sol(quote));
    println!("  quote basis  floor * {}% = {}%-haircut", e::INSTANT_SELL_BPS / 100, 100 - e::INSTANT_SELL_BPS / 100);

    // capacity at the current quote, how many instant sells the pool can cover.
    if quote > 0 {
        let capacity = pool.total_lamports / quote;
        println!("  capacity     {} instant sells at current quote", capacity);
    } else {
        println!("  capacity     unbounded (zero quote)");
    }

    Ok(())
}
