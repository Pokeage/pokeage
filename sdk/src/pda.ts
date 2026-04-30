/* pokeAge SDK: program-derived address helpers.
   Seeds match programs/pokeage/src/constants.rs. Each returns [address, bump]. */

import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, SEEDS } from './constants';

function pda(seeds: (Buffer | Uint8Array)[]): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
}

/** global config singleton. */
export function configPda(): [PublicKey, number] {
  return pda([SEEDS.config]);
}

/** buyback pool singleton. */
export function poolPda(): [PublicKey, number] {
  return pda([SEEDS.pool]);
}

/** per-owner player state. */
export function playerPda(owner: PublicKey): [PublicKey, number] {
  return pda([SEEDS.player, owner.toBytes()]);
}

/** per-card listing. */
export function listingPda(cardMint: PublicKey): [PublicKey, number] {
  return pda([SEEDS.listing, cardMint.toBytes()]);
}

/** per-card metadata. */
export function cardPda(cardMint: PublicKey): [PublicKey, number] {
  return pda([SEEDS.card, cardMint.toBytes()]);
}
