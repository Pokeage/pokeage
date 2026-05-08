//! `pokeage listing <CARD_MINT>`: derives the listing pda for a card and prints it.

use std::str::FromStr;

use anyhow::Result;
use solana_sdk::pubkey::Pubkey;

use crate::commands::NOT_INIT;
use crate::config::CliConfig;
use crate::economy as e;
use crate::error::CliError;
use crate::pda;
use crate::rpc;
use crate::state::Listing;

/// resolves the card mint, derives the listing pda, fetches and prints it.
pub fn run(cfg: &CliConfig, card_mint_str: &str) -> Result<()> {
    let card_mint = Pubkey::from_str(card_mint_str)
        .map_err(|e| CliError::BadPubkey(format!("{card_mint_str}: {e}")))?;

    let client = cfg.rpc();
    let (listing_pda, bump) = pda::listing_pda(&cfg.program_id, &card_mint);

    println!("pokeage listing");
    println!("  card mint    {}", card_mint);
    println!("  listing pda  {} (bump {})", listing_pda, bump);
    println!();

    let listing = match rpc::try_fetch_and_decode::<Listing>(&client, &listing_pda)? {
        Some(l) => l,
        None => {
            println!("listing      {}", NOT_INIT);
            return Ok(());
        }
    };

    let tier_name = e::TIER_NAMES
        .get(listing.tier as usize)
        .copied()
        .unwrap_or("unknown");
    let fee = e::bps_of(listing.price, e::MARKET_FEE_BPS as u64).unwrap_or(0);
    let seller_net = listing.price.saturating_sub(fee);

    // the stored card_mint must equal the pda seed; flag any mismatch.
    if listing.card_mint != crate::state::RawKey(card_mint.to_bytes()) {
        println!("  warning      stored card_mint {} differs from query", listing.card_mint);
    }

    println!("detail");
    println!("  seller       {}", listing.seller);
    println!("  card mint    {}", listing.card_mint);
    println!("  active       {}", if listing.active { "yes" } else { "no (sold or cancelled)" });
    println!("  price        {} SOL ({} lamports)", e::fmt_sol(listing.price), listing.price);
    println!("  tier         {} ({})", listing.tier, tier_name);
    println!("  level        {}", listing.level);
    println!("  stage        {}", listing.stage);
    println!("  created at   {} (unix)", listing.created_at);
    println!("  listing bump {}", listing.bump);
    println!();

    println!("settlement at this price");
    println!("  market fee   {} SOL ({}%)", e::fmt_sol(fee), e::MARKET_FEE_BPS / 100);
    println!("  seller net   {} SOL", e::fmt_sol(seller_net));

    Ok(())
}
