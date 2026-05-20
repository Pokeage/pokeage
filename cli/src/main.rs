//! pokeage cli entrypoint. read-only operator views over the pokeage $pokeage
//! economy plus a local tokenomics projection. no transaction signing.

mod commands;
mod config;
mod economy;
mod error;
mod pda;
mod rpc;
mod state;

use anyhow::Result;
use clap::{Parser, Subcommand};

use config::{expand_home, CliConfig};

/// pokeage: read-only cli for the pokeage $pokeage on-chain economy.
#[derive(Parser)]
#[command(
    name = "pokeage",
    version,
    about = "read-only operator cli for the pokeAge $PAGE economy",
    long_about = None
)]
struct Cli {
    /// solana rpc endpoint.
    #[arg(long, global = true, default_value = "https://api.devnet.solana.com")]
    rpc_url: String,

    /// operator keypair path. tilde is expanded to the home dir.
    #[arg(long, global = true, default_value = "~/.config/solana/id.json")]
    keypair: String,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// print resolved settings, derived pdas, and the economy table.
    Config,
    /// fetch Config + BuybackPool and print chain economy stats.
    Stats,
    /// print buyback pool detail and the live instant-sell quote.
    Pool,
    /// derive a player pda and print progress.
    Player {
        /// owner pubkey (base58).
        pubkey: String,
    },
    /// derive a card listing pda and print marketplace detail.
    Listing {
        /// card mint pubkey (base58).
        card_mint: String,
    },
    /// run a local tokenomics projection, no rpc.
    Sim {
        /// horizon length in days.
        #[arg(long, default_value_t = 30)]
        days: u32,
        /// flat daily active user count.
        #[arg(long, default_value_t = 1_000)]
        users: u64,
    },
    /// print crate version and program id.
    Version,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let keypair_path = expand_home(&cli.keypair)?;
    let cfg = CliConfig::resolve(cli.rpc_url.clone(), keypair_path)?;

    match cli.command {
        Commands::Config => commands::config::run(&cfg),
        Commands::Stats => commands::stats::run(&cfg),
        Commands::Pool => commands::pool::run(&cfg),
        Commands::Player { pubkey } => commands::player::run(&cfg, &pubkey),
        Commands::Listing { card_mint } => commands::listing::run(&cfg, &card_mint),
        Commands::Sim { days, users } => commands::sim::run(days, users),
        Commands::Version => commands::version::run(),
    }
}
