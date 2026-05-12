//! `pokeage stats`: fetches Config + BuybackPool and prints chain-level numbers.

use anyhow::Result;

use crate::commands::NOT_INIT;
use crate::config::CliConfig;
use crate::economy as e;
use crate::pda;
use crate::rpc;
use crate::state::{BuybackPool, Config, RawKey};

/// fetches both accounts and prints a combined economy snapshot.
pub fn run(cfg: &CliConfig) -> Result<()> {
    let client = cfg.rpc();
    let (config_pda, _) = pda::config_pda(&cfg.program_id);
    let (pool_pda, _) = pda::pool_pda(&cfg.program_id);

    println!("pokeage economy stats");
    println!("  rpc          {}", cfg.rpc_url);
    println!("  config pda   {}", config_pda);
    println!("  pool pda     {}", pool_pda);
    println!();

    match rpc::try_fetch_and_decode::<Config>(&client, &config_pda)? {
        Some(c) => print_config(&c),
        None => println!("config       {}", NOT_INIT),
    }
    println!();

    match rpc::try_fetch_and_decode::<BuybackPool>(&client, &pool_pda)? {
        Some(p) => print_pool(&p),
        None => println!("buyback pool {}", NOT_INIT),
    }

    Ok(())
}

fn print_config(c: &Config) {
    println!("config");
    println!("  authority        {}", fmt_key(&c.authority));
    println!("  pokeage mint        {}", fmt_key(&c.page_mint));
    println!("  treasury         {}", fmt_key(&c.treasury));
    println!("  buyback vault    {}", fmt_key(&c.buyback_vault));
    println!("  total burned     {} $PAGE ({} base)", e::fmt_page(c.total_burned), c.total_burned);
    println!("  cards minted     {}", c.total_cards_minted);
    println!("  burn / pool bps  {} / {}", c.burn_bps, c.pool_bps);
    println!("  market fee bps   {}", c.market_fee_bps);
    println!("  instant sell bps {}", c.instant_sell_bps);
    println!("  listing fee      {} lamports", c.listing_fee);
    let pauses = c.active_pauses();
    if pauses.is_empty() {
        println!("  paused           none");
    } else {
        println!("  paused           {}", pauses.join(", "));
    }
    println!("  config bump      {}", c.bump);
}

fn print_pool(p: &BuybackPool) {
    let quote = e::instant_sell_quote(p.floor_price).unwrap_or(0);
    println!("buyback pool");
    println!("  balance          {} SOL ({} lamports)", e::fmt_sol(p.total_lamports), p.total_lamports);
    println!("  lifetime in      {} SOL", e::fmt_sol(p.lifetime_in));
    println!("  lifetime out     {} SOL", e::fmt_sol(p.lifetime_out));
    println!("  floor price      {} SOL ({} lamports)", e::fmt_sol(p.floor_price), p.floor_price);
    println!("  instant sell     {}", if p.instant_sell_enabled { "enabled" } else { "disabled" });
    println!("  instant quote    {} SOL ({}% of floor)", e::fmt_sol(quote), e::INSTANT_SELL_BPS / 100);
    println!("  pool bump        {}", p.bump);
}

/// formats a key, flagging the all-zero default so unwired addresses are obvious.
fn fmt_key(k: &RawKey) -> String {
    if k.is_zero() {
        format!("{} (unset)", k)
    } else {
        k.to_string()
    }
}
