/* pokeAge SDK: decoded account shapes.
   u64/i64 fields are bigint to avoid precision loss on token and lamport amounts. */

import { PublicKey } from '@solana/web3.js';

export interface ConfigAccount {
  authority: PublicKey;
  pageMint: PublicKey;
  treasury: PublicKey;
  buybackVault: PublicKey;
  burnBps: number;
  poolBps: number;
  marketFeeBps: number;
  instantSellBps: number;
  listingFee: bigint;
  totalBurned: bigint;
  totalCardsMinted: bigint;
  paused: number;
  bump: number;
}

export interface PlayerAccount {
  owner: PublicKey;
  agentDeployed: boolean;
  totalCaught: bigint;
  gymWins: number;
  badges: number;
  lastAction: bigint;
  bump: number;
}

export interface PoolAccount {
  totalLamports: bigint;
  lifetimeIn: bigint;
  lifetimeOut: bigint;
  floorPrice: bigint;
  instantSellEnabled: boolean;
  bump: number;
}

export interface ListingAccount {
  seller: PublicKey;
  cardMint: PublicKey;
  price: bigint;
  tier: number;
  level: number;
  stage: number;
  createdAt: bigint;
  active: boolean;
  bump: number;
}

/** decode a 12-bit badge bitmask into an index list. */
export function badgeList(badges: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 12; i++) if (badges & (1 << i)) out.push(i);
  return out;
}

/** whether a pause bit is set in a config. */
export function isPaused(config: ConfigAccount, flag: number): boolean {
  return (config.paused & flag) !== 0;
}
