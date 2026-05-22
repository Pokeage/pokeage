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
