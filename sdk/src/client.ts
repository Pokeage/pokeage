/* pokeAge SDK: high-level client.
   Wraps a connection, derives PDAs and associated token accounts, exposes read
   helpers, and builds the common instructions with token accounts filled in. */

import {
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  DEFAULT_RPC,
  CatchRarity,
} from './constants';
import {
  configPda,
  poolPda,
  playerPda,
  listingPda,
  cardPda,
} from './pda';
import { getConfig, getPool, getPlayer, getListing } from './accounts';
import { getTokenBalance, TokenBalance } from './token';
import * as ix from './instructions';
import {
  cardPriceSol,
  instantSellQuote,
  mintFeeLamports,
  tierFromCode,
} from '@pokeage/engine';

export interface PokeageClientOptions {
  programId?: PublicKey;
}

export class PokeageClient {
  readonly connection: Connection;
  readonly programId: PublicKey;

  constructor(connection: Connection, opts: PokeageClientOptions = {}) {
    this.connection = connection;
    this.programId = opts.programId ?? PROGRAM_ID;
  }

  static fromRpc(url: string = DEFAULT_RPC): PokeageClient {
    return new PokeageClient(new Connection(url, 'confirmed'));
  }

  // ── PDAs ──────────────────────────────────────────────────
  config = () => configPda()[0];
  pool = () => poolPda()[0];
  player = (owner: PublicKey) => playerPda(owner)[0];
  listing = (cardMint: PublicKey) => listingPda(cardMint)[0];
  card = (cardMint: PublicKey) => cardPda(cardMint)[0];

  /** associated $PAGE token account for an owner (Token-2022). */
  pageAta(owner: PublicKey, mint: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(
      mint,
      owner,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
