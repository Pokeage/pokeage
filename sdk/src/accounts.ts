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
    bump: r.u8(),
  };
}

function decodeListing(buf: Buffer): ListingAccount {
  const r = new BorshReader(buf).skip(DISC_LEN);
  return {
    seller: new PublicKey(r.pubkey()),
    cardMint: new PublicKey(r.pubkey()),
    price: r.u64(),
    tier: r.u8(),
    level: r.u8(),
    stage: r.u8(),
    createdAt: r.i64(),
    active: r.bool(),
    bump: r.u8(),
  };
}

async function fetch<T>(
  connection: Connection,
  address: PublicKey,
  decode: (buf: Buffer) => T,
): Promise<T | null> {
  const info = await connection.getAccountInfo(address);
  if (!info) return null;
  return decode(info.data as Buffer);
}

export function getConfig(connection: Connection): Promise<ConfigAccount | null> {
  return fetch(connection, configPda()[0], decodeConfig);
}

export function getPool(connection: Connection): Promise<PoolAccount | null> {
  return fetch(connection, poolPda()[0], decodePool);
}

export function getPlayer(
  connection: Connection,
  owner: PublicKey,
): Promise<PlayerAccount | null> {
  return fetch(connection, playerPda(owner)[0], decodePlayer);
}

export function getListing(
  connection: Connection,
  cardMint: PublicKey,
): Promise<ListingAccount | null> {
  return fetch(connection, listingPda(cardMint)[0], decodeListing);
}

export const decoders = {
  config: decodeConfig,
  player: decodePlayer,
  pool: decodePool,
  listing: decodeListing,
};
