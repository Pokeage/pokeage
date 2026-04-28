/* pokeAge SDK: program ids, seeds, and Anchor discriminators.
   The $PAGE mint is not launched yet, so the mint is passed in at call time
   rather than hardcoded here. Discriminators are the first 8 bytes of
   sha256("global:<ix>") and sha256("account:<Account>"), matching Anchor. */

import { PublicKey } from '@solana/web3.js';

/** placeholder program id until deployment (Anchor default). */
export const PROGRAM_ID = new PublicKey(
  'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
);

/** SPL token programs. $PAGE launches as Token-2022. */
export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const POKEAGE_DECIMALS = 6;
export const DEFAULT_RPC = 'https://api.devnet.solana.com';

/** PDA seeds (must match the program). */
export const SEEDS = {
  config: Buffer.from('config'),
  player: Buffer.from('player'),
  listing: Buffer.from('listing'),
  pool: Buffer.from('buyback_pool'),
  card: Buffer.from('card'),
} as const;

/** instruction discriminators. */
export const IX_DISC = {
  initialize: [175, 175, 109, 31, 13, 152, 155, 237],
  deploy_agent: [111, 5, 144, 253, 234, 112, 104, 160],
  catch_attempt: [117, 199, 5, 173, 1, 110, 92, 78],
  gym_challenge: [99, 2, 232, 170, 219, 168, 157, 184],
  force_evolve: [125, 17, 242, 123, 243, 240, 122, 193],
  mint_card: [58, 198, 225, 36, 193, 210, 202, 108],
  list_card: [113, 226, 80, 193, 197, 19, 75, 161],
  cancel_listing: [41, 183, 50, 232, 230, 233, 157, 70],
  buy_card: [113, 142, 149, 246, 22, 115, 156, 154],
  instant_sell: [45, 174, 93, 204, 210, 186, 239, 229],
  update_floor: [38, 80, 204, 37, 6, 62, 192, 200],
  set_instant_sell: [67, 116, 92, 97, 147, 205, 199, 45],
  withdraw_treasury: [40, 63, 122, 158, 144, 216, 83, 96],
  set_pause: [63, 32, 154, 2, 56, 103, 79, 45],
} as const;

/** account discriminators. */
export const ACCOUNT_DISC = {
  Config: [155, 12, 170, 224, 30, 250, 204, 130],
  PlayerState: [56, 3, 60, 86, 174, 16, 244, 195],
  Listing: [218, 32, 50, 73, 43, 134, 26, 58],
  BuybackPool: [30, 9, 48, 171, 48, 116, 22, 165],
  CardMeta: [64, 183, 9, 78, 105, 222, 254, 255],
} as const;

/** catch rarity codes accepted by catch_attempt. */
export enum CatchRarity {
  Normal = 0,
  Rare = 1,
  Legendary = 2,
}

/** pause bitflags (mirror Config). */
export const PAUSE = {
  CATCH: 1,
  MINT: 2,
  MARKET: 4,
  INSTANT_SELL: 8,
} as const;
