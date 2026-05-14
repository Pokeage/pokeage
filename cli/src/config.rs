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
