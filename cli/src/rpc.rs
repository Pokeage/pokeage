//! thin read helpers over RpcClient. fetch_and_decode strips the 8-byte anchor
//! discriminator then borsh-decodes into a cli mirror struct.

use anyhow::Result;
use borsh::BorshDeserialize;
use solana_client::client_error::ClientErrorKind;
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_request::RpcError;
use solana_sdk::pubkey::Pubkey;

use crate::error::CliError;

/// length of the anchor account discriminator prepended to every account.
pub const DISCRIMINATOR_LEN: usize = 8;

/// raw account bytes, or AccountMissing when the account does not exist.
pub fn get_account_data(client: &RpcClient, pubkey: &Pubkey) -> Result<Vec<u8>> {
    match client.get_account_data(pubkey) {
        Ok(data) => Ok(data),
        Err(e) => {
            if is_account_not_found(&e) {
                Err(CliError::AccountMissing(pubkey.to_string()).into())
            } else {
                Err(e.into())
            }
        }
    }
}

/// lamport balance of an address.
pub fn get_balance(client: &RpcClient, pubkey: &Pubkey) -> Result<u64> {
    Ok(client.get_balance(pubkey)?)
}

/// fetches an anchor account, strips the discriminator, borsh-decodes the body.
pub fn fetch_and_decode<T: BorshDeserialize>(client: &RpcClient, pubkey: &Pubkey) -> Result<T> {
    let data = get_account_data(client, pubkey)?;
    decode_account::<T>(&data)
}

/// fetches an anchor account but maps "missing" to None so callers can print a
/// graceful "not initialized" line instead of erroring out.
pub fn try_fetch_and_decode<T: BorshDeserialize>(
    client: &RpcClient,
    pubkey: &Pubkey,
) -> Result<Option<T>> {
    match fetch_and_decode::<T>(client, pubkey) {
        Ok(v) => Ok(Some(v)),
        Err(e) => {
            if e.downcast_ref::<CliError>()
                .map(|c| matches!(c, CliError::AccountMissing(_)))
                .unwrap_or(false)
            {
                Ok(None)
            } else {
                Err(e)
            }
        }
    }
}

/// strips the 8-byte discriminator and borsh-decodes the remaining body. split
/// out so it is unit-testable without a live rpc.
pub fn decode_account<T: BorshDeserialize>(data: &[u8]) -> Result<T> {
    if data.len() < DISCRIMINATOR_LEN {
        return Err(CliError::ShortData {
            have: data.len(),
            need: DISCRIMINATOR_LEN,
        }
        .into());
    }
    let body = &data[DISCRIMINATOR_LEN..];
    T::try_from_slice(body).map_err(|e| CliError::Decode(e.to_string()).into())
}

/// classifies a client error as a missing-account result. solana rpc returns a
/// specific code for unknown accounts.
fn is_account_not_found(e: &solana_client::client_error::ClientError) -> bool {
    match e.kind() {
        ClientErrorKind::RpcError(RpcError::ForUser(msg)) => {
            let m = msg.to_lowercase();
            m.contains("accountnotfound") || m.contains("not found")
        }
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::Config;

    #[test]
    fn decode_rejects_short_data() {
        let data = [0u8; 4];
        let r = decode_account::<Config>(&data);
        assert!(r.is_err());
        let err = r.err().unwrap();
        let cli = err.downcast_ref::<CliError>().unwrap();
        assert!(matches!(cli, CliError::ShortData { have: 4, need: 8 }));
    }

    #[test]
    fn decode_strips_discriminator_then_reads_body() {
        let mut data = Vec::new();
        data.extend_from_slice(&[0xAA; DISCRIMINATOR_LEN]); // fake discriminator
        data.extend_from_slice(&[1u8; 32]); // authority
        data.extend_from_slice(&[2u8; 32]); // page_mint
        data.extend_from_slice(&[3u8; 32]); // treasury
        data.extend_from_slice(&[4u8; 32]); // buyback_vault
        data.extend_from_slice(&7000u16.to_le_bytes());
        data.extend_from_slice(&3000u16.to_le_bytes());
        data.extend_from_slice(&500u16.to_le_bytes());
        data.extend_from_slice(&5000u16.to_le_bytes());
        data.extend_from_slice(&1_000_000u64.to_le_bytes());
        data.extend_from_slice(&55u64.to_le_bytes());
        data.extend_from_slice(&3u64.to_le_bytes());
        data.push(0);
        data.push(253);

        let cfg = decode_account::<Config>(&data).unwrap();
        assert_eq!(cfg.total_burned, 55);
        assert_eq!(cfg.total_cards_minted, 3);
        assert_eq!(cfg.bump, 253);
    }
}
