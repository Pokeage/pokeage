/* pokeAge SDK: instruction builders.
   Each builder returns a web3.js TransactionInstruction. Account ordering mirrors
   the program's Accounts contexts; idl/pokeage.json is the canonical reference.
   Token sinks (deploy, catch, gym, evolve) burn 70% and route 30% to the pool. */

import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { BorshWriter } from './borsh';
import {
  PROGRAM_ID,
  IX_DISC,
  TOKEN_2022_PROGRAM_ID,
  CatchRarity,
} from './constants';
import { configPda, poolPda, playerPda, listingPda } from './pda';

type Disc = readonly number[];

function ix(
  data: Buffer,
  keys: { pubkey: PublicKey; isSigner: boolean; isWritable: boolean }[],
): TransactionInstruction {
  return new TransactionInstruction({ programId: PROGRAM_ID, keys, data });
}

const w = (pubkey: PublicKey, isSigner = false) => ({
  pubkey,
  isSigner,
  isWritable: true,
});
const r = (pubkey: PublicKey, isSigner = false) => ({
  pubkey,
  isSigner,
  isWritable: false,
});

/** shared accounts for a token sink instruction. */
export interface SinkAccounts {
  authority: PublicKey;
  pageMint: PublicKey;
  playerAta: PublicKey;
  poolAta: PublicKey;
}

function sinkKeys(a: SinkAccounts) {
  const [config] = configPda();
  const [pool] = poolPda();
  const [player] = playerPda(a.authority);
  return [
    w(config),
    w(pool),
    w(player),
    w(a.authority, true),
    w(a.pageMint),
    w(a.playerAta),
    w(a.poolAta),
    r(TOKEN_2022_PROGRAM_ID),
    r(SystemProgram.programId),
  ];
}

function sinkData(disc: Disc, extra?: (b: BorshWriter) => void): Buffer {
  const b = new BorshWriter().disc(disc);
  if (extra) extra(b);
  return b.build();
}

export function initialize(params: {
  authority: PublicKey;
  pageMint: PublicKey;
  treasury: PublicKey;
  buybackVault: PublicKey;
  burnBps: number;
  poolBps: number;
  marketFeeBps: number;
  listingFee: bigint | number;
}): TransactionInstruction {
  const [config] = configPda();
  const [pool] = poolPda();
  const data = new BorshWriter()
    .disc(IX_DISC.initialize)
    .u16(params.burnBps)
    .u16(params.poolBps)
    .u16(params.marketFeeBps)
    .u64(params.listingFee)
    .build();
  return ix(data, [
    w(config),
    w(pool),
    w(params.authority, true),
    r(params.pageMint),
    r(params.treasury),
    r(params.buybackVault),
    r(SystemProgram.programId),
  ]);
}

export function deployAgent(a: SinkAccounts): TransactionInstruction {
  return ix(sinkData(IX_DISC.deploy_agent), sinkKeys(a));
}

export function catchAttempt(
  a: SinkAccounts,
  rarity: CatchRarity,
): TransactionInstruction {
  return ix(
    sinkData(IX_DISC.catch_attempt, (b) => b.u8(rarity)),
    sinkKeys(a),
  );
}

export function gymChallenge(
  a: SinkAccounts,
  badgeIndex: number,
): TransactionInstruction {
  return ix(
    sinkData(IX_DISC.gym_challenge, (b) => b.u8(badgeIndex)),
    sinkKeys(a),
  );
}

export function forceEvolve(a: SinkAccounts): TransactionInstruction {
  return ix(sinkData(IX_DISC.force_evolve), sinkKeys(a));
}

export function updateFloor(
  authority: PublicKey,
  floorPrice: bigint | number,
): TransactionInstruction {
  const [config] = configPda();
  const [pool] = poolPda();
  const data = new BorshWriter()
    .disc(IX_DISC.update_floor)
    .u64(floorPrice)
    .build();
  return ix(data, [r(config), w(pool), w(authority, true)]);
}

export function setInstantSell(
  authority: PublicKey,
  enabled: boolean,
): TransactionInstruction {
  const [config] = configPda();
  const [pool] = poolPda();
  const data = new BorshWriter()
    .disc(IX_DISC.set_instant_sell)
    .bool(enabled)
    .build();
  return ix(data, [r(config), w(pool), w(authority, true)]);
}

export function setPause(
  authority: PublicKey,
  flags: number,
): TransactionInstruction {
  const [config] = configPda();
  const data = new BorshWriter().disc(IX_DISC.set_pause).u8(flags).build();
  return ix(data, [w(config), w(authority, true)]);
}

export function withdrawTreasury(params: {
  authority: PublicKey;
  treasury: PublicKey;
  amount: bigint | number;
}): TransactionInstruction {
  const [config] = configPda();
  const data = new BorshWriter()
    .disc(IX_DISC.withdraw_treasury)
    .u64(params.amount)
