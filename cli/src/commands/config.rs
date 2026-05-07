//! `pokeage config`: prints resolved settings, derived pdas, and the economy table.
//! pure local, no rpc.

use anyhow::Result;
use solana_sdk::signer::Signer;

use crate::config::CliConfig;
use crate::economy as e;
use crate::pda;

/// renders the config view to stdout.
pub fn run(cfg: &CliConfig) -> Result<()> {
    let (config_pda, config_bump) = pda::config_pda(&cfg.program_id);
    let (pool_pda, pool_bump) = pda::pool_pda(&cfg.program_id);

    println!("pokeage cli config");
    println!("  rpc url      {}", cfg.rpc_url);
    println!("  keypair      {}", cfg.keypair_path.display());
    // operator pubkey is informational; a missing key never blocks read views.
    match cfg.keypair() {
        Ok(kp) => println!("  operator     {}", kp.pubkey()),
        Err(_) => println!("  operator     (keypair not loaded)"),
    }
    println!("  program id   {}", cfg.program_id);
    println!();
    println!("derived pdas");
    println!("  config       {} (bump {})", config_pda, config_bump);
    println!("  buyback pool {} (bump {})", pool_pda, pool_bump);
    println!();

    println!("economy constants (token amounts in $PAGE, {} decimals)", e::DECIMALS);
    print_token("deploy cost", e::DEPLOY_COST);
    print_token("catch common", e::CATCH_COMMON);
    print_token("catch rare", e::CATCH_RARE);
    print_token("catch legendary", e::CATCH_LEGENDARY);
    print_token("gym cost", e::GYM_COST);
    print_token("force evolve", e::FORCE_EVOLVE_COST);
    println!();

    println!("sink split");
    println!("  burn bps     {} ({}%)", e::BURN_BPS, e::BURN_BPS / 100);
    println!("  pool bps     {} ({}%)", e::POOL_BPS, e::POOL_BPS / 100);
    println!();

    println!("market");
    println!("  market fee   {} bps ({}%)", e::MARKET_FEE_BPS, e::MARKET_FEE_BPS / 100);
    println!("  instant sell {} bps ({}% of floor)", e::INSTANT_SELL_BPS, e::INSTANT_SELL_BPS / 100);
    println!("  listing fee  {} lamports ({} SOL)", e::LISTING_FEE_LAMPORTS, e::fmt_sol(e::LISTING_FEE_LAMPORTS));
    println!();

    println!("nft mint fee by tier (lamports / SOL)");
    for (i, fee) in e::MINT_FEE_BY_TIER.iter().enumerate() {
        println!(
            "  {:<9} tier {}  {:>13}  {} SOL",
            e::TIER_NAMES[i],
            i,
            fee,
            e::fmt_sol(*fee)
        );
    }

    Ok(())
}

/// prints a token row with whole-token and base-unit forms.
fn print_token(label: &str, base_units: u64) {
    println!(
        "  {:<15} {:>12} $PAGE  ({} base units)",
        label,
        e::fmt_page(base_units),
        base_units
    );
}
