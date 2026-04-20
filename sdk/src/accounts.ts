/* pokeAge SDK: account fetch and decode.
   Each decoder skips the 8-byte Anchor discriminator, then reads fields in the
   program's declaration order. Returns null when the account does not exist. */

import { Connection, PublicKey } from '@solana/web3.js';
import { BorshReader } from './borsh';
import { configPda, poolPda, playerPda, listingPda } from './pda';
import type {
  ConfigAccount,
  PlayerAccount,
  PoolAccount,
  ListingAccount,
} from './types';

const DISC_LEN = 8;

function decodeConfig(buf: Buffer): ConfigAccount {
  const r = new BorshReader(buf).skip(DISC_LEN);
  return {
    authority: new PublicKey(r.pubkey()),
    pageMint: new PublicKey(r.pubkey()),
    treasury: new PublicKey(r.pubkey()),
    buybackVault: new PublicKey(r.pubkey()),
    burnBps: r.u16(),
    poolBps: r.u16(),
    marketFeeBps: r.u16(),
    instantSellBps: r.u16(),
    listingFee: r.u64(),
    totalBurned: r.u64(),
    totalCardsMinted: r.u64(),
    paused: r.u8(),
    bump: r.u8(),
  };
}

function decodePlayer(buf: Buffer): PlayerAccount {
  const r = new BorshReader(buf).skip(DISC_LEN);
  return {
    owner: new PublicKey(r.pubkey()),
    agentDeployed: r.bool(),
    totalCaught: r.u64(),
    gymWins: r.u32(),
    badges: r.u16(),
    lastAction: r.i64(),
    bump: r.u8(),
  };
}

function decodePool(buf: Buffer): PoolAccount {
  const r = new BorshReader(buf).skip(DISC_LEN);
  return {
    totalLamports: r.u64(),
    lifetimeIn: r.u64(),
    lifetimeOut: r.u64(),
    floorPrice: r.u64(),
    instantSellEnabled: r.bool(),
