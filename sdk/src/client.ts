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
  }

  // ── reads ─────────────────────────────────────────────────
  fetchConfig() {
    return getConfig(this.connection);
  }
  fetchPool() {
    return getPool(this.connection);
  }
  fetchPlayer(owner: PublicKey) {
    return getPlayer(this.connection, owner);
  }
  fetchListing(cardMint: PublicKey) {
    return getListing(this.connection, cardMint);
  }
  pageBalance(owner: PublicKey, mint: PublicKey): Promise<TokenBalance> {
    return getTokenBalance(this.connection, owner, mint);
  }

  // ── quotes (off-chain, match on-chain charges) ────────────
  marketPriceSol(tierCode: number, level: number, stage: number): number {
    return cardPriceSol(tierFromCode(tierCode), level, stage);
  }
  mintFee(tierCode: number): number {
    return mintFeeLamports(tierFromCode(tierCode));
  }
  /** instant-sell payout for a card given the current pool floor. */
  async instantSellPayout(): Promise<bigint> {
    const pool = await this.fetchPool();
    if (!pool) return 0n;
    return BigInt(instantSellQuote(Number(pool.floorPrice)));
  }

  // ── instruction builders with token accounts resolved ─────
  deployAgent(authority: PublicKey, mint: PublicKey): TransactionInstruction {
    return ix.deployAgent(this.sink(authority, mint));
  }
  catchAttempt(
    authority: PublicKey,
    mint: PublicKey,
    rarity: CatchRarity,
  ): TransactionInstruction {
    return ix.catchAttempt(this.sink(authority, mint), rarity);
  }
  gymChallenge(
    authority: PublicKey,
    mint: PublicKey,
    badgeIndex: number,
  ): TransactionInstruction {
    return ix.gymChallenge(this.sink(authority, mint), badgeIndex);
  }
  forceEvolve(authority: PublicKey, mint: PublicKey): TransactionInstruction {
    return ix.forceEvolve(this.sink(authority, mint));
  }

  private sink(authority: PublicKey, mint: PublicKey): ix.SinkAccounts {
    const poolAuthority = this.pool();
    return {
      authority,
      pageMint: mint,
      playerAta: this.pageAta(authority, mint),
      poolAta: this.pageAta(poolAuthority, mint),
    };
  }
}
