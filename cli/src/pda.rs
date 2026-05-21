//! pda derivations. seeds mirror programs/pokeage constants.rs exactly.

use solana_sdk::pubkey::Pubkey;

pub const CONFIG_SEED: &[u8] = b"config";
pub const POOL_SEED: &[u8] = b"buyback_pool";
pub const PLAYER_SEED: &[u8] = b"player";
pub const LISTING_SEED: &[u8] = b"listing";

/// global config pda, seed b"config".
pub fn config_pda(program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[CONFIG_SEED], program_id)
}

/// buyback pool pda, seed b"buyback_pool".
pub fn pool_pda(program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[POOL_SEED], program_id)
}

/// per-player pda, seeds b"player" + owner.
pub fn player_pda(program_id: &Pubkey, owner: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[PLAYER_SEED, owner.as_ref()], program_id)
}

/// listing pda, seeds b"listing" + card_mint.
pub fn listing_pda(program_id: &Pubkey, card_mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[LISTING_SEED, card_mint.as_ref()], program_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    fn pid() -> Pubkey {
        Pubkey::from_str("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS").unwrap()
    }

    #[test]
    fn pdas_are_deterministic() {
        let p = pid();
        assert_eq!(config_pda(&p), config_pda(&p));
        assert_eq!(pool_pda(&p), pool_pda(&p));
        // config and pool seeds differ, so the keys must differ.
        assert_ne!(config_pda(&p).0, pool_pda(&p).0);
    }

    #[test]
    fn player_and_listing_depend_on_input() {
        let p = pid();
        let a = Pubkey::new_unique();
        let b = Pubkey::new_unique();
        assert_ne!(player_pda(&p, &a).0, player_pda(&p, &b).0);
        assert_ne!(listing_pda(&p, &a).0, listing_pda(&p, &b).0);
        assert_eq!(player_pda(&p, &a), player_pda(&p, &a));
    }

    #[test]
    fn config_and_pool_bumps_are_stable() {
        let p = pid();
        // same program id always yields the same canonical bump.
        assert_eq!(config_pda(&p).1, config_pda(&p).1);
        assert_eq!(pool_pda(&p).1, pool_pda(&p).1);
    }
}
