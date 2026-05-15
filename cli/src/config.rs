//! resolved cli config: rpc url, keypair path, program id. builds the rpc
//! client and reads the operator keypair from a solana json byte array.

use std::path::PathBuf;
use std::str::FromStr;

use anyhow::{anyhow, Context, Result};
use solana_client::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::{read_keypair_file, Keypair};

use crate::error::CliError;

/// anchor placeholder program id, replaced at real deploy.
pub const PROGRAM_ID: &str = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

/// runtime configuration shared by every command.
pub struct CliConfig {
    pub rpc_url: String,
    pub keypair_path: PathBuf,
    pub program_id: Pubkey,
}

impl CliConfig {
    /// resolves config from parsed flags. parses the program id once so command
    /// code never re-parses the const string.
    pub fn resolve(rpc_url: String, keypair_path: PathBuf) -> Result<Self> {
        let program_id = Pubkey::from_str(PROGRAM_ID)
            .map_err(|e| CliError::BadPubkey(format!("{PROGRAM_ID}: {e}")))?;
        Ok(CliConfig {
            rpc_url,
            keypair_path,
            program_id,
        })
    }

    /// rpc client at confirmed commitment, the right tradeoff for read views.
    pub fn rpc(&self) -> RpcClient {
        RpcClient::new_with_commitment(self.rpc_url.clone(), CommitmentConfig::confirmed())
    }

    /// reads the operator keypair. only the read commands that need a signer
    /// call this, so a missing key never blocks pure-read views.
    pub fn keypair(&self) -> Result<Keypair> {
        let path = self.keypair_path.clone();
        read_keypair_file(&path).map_err(|e| {
            CliError::Keypair {
                path: path.display().to_string(),
                source: anyhow!("{e}"),
            }
            .into()
        })
    }
}

/// expands a leading `~` to the user home dir. solana paths conventionally use
/// `~/.config/solana/id.json`, which clap hands us verbatim.
pub fn expand_home(raw: &str) -> Result<PathBuf> {
    if let Some(rest) = raw.strip_prefix("~/").or_else(|| raw.strip_prefix("~\\")) {
        let home = home_dir().context("could not resolve home directory for ~ expansion")?;
        return Ok(home.join(rest));
    }
    if raw == "~" {
        return home_dir().context("could not resolve home directory");
    }
    Ok(PathBuf::from(raw))
}

/// home dir from the platform env vars, no extra crate needed.
fn home_dir() -> Option<PathBuf> {
    if let Ok(h) = std::env::var("HOME") {
        if !h.is_empty() {
            return Some(PathBuf::from(h));
        }
    }
    if let Ok(p) = std::env::var("USERPROFILE") {
        if !p.is_empty() {
            return Some(PathBuf::from(p));
        }
    }
    match (std::env::var("HOMEDRIVE"), std::env::var("HOMEPATH")) {
        (Ok(d), Ok(p)) if !d.is_empty() && !p.is_empty() => Some(PathBuf::from(format!("{d}{p}"))),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn program_id_parses() {
        let cfg = CliConfig::resolve(
            "https://api.devnet.solana.com".into(),
            PathBuf::from("id.json"),
        )
        .unwrap();
        assert_eq!(cfg.program_id.to_string(), PROGRAM_ID);
    }

    #[test]
    fn plain_path_passes_through() {
        let p = expand_home("/tmp/id.json").unwrap();
        assert_eq!(p, PathBuf::from("/tmp/id.json"));
    }

    #[test]
    fn tilde_expands_to_home() {
        std::env::set_var("HOME", "/home/op");
        let p = expand_home("~/.config/solana/id.json").unwrap();
        assert_eq!(p, PathBuf::from("/home/op/.config/solana/id.json"));
    }
}
