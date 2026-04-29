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
