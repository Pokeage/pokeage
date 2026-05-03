/* pokeAge SDK: token balance lookup.
   $PAGE is an SPL Token-2022 mint. A getTokenAccountsByOwner call filtered by
   mint only inspects the legacy Token program by default and returns an empty
   result for a Token-2022 holder. This queries BOTH programs and sums, which is
   the correct way to read a pump.fun era Token-2022 balance. */

import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from './constants';

export interface TokenBalance {
  /** raw amount in base units. */
  amount: bigint;
  /** human amount scaled by decimals. */
  uiAmount: number;
  decimals: number;
}

async function balanceForProgram(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  programId: PublicKey,
): Promise<TokenBalance> {
  const res = await connection.getParsedTokenAccountsByOwner(owner, {
    mint,
    programId,
  });
  let amount = 0n;
  let decimals = 0;
  for (const { account } of res.value) {
    const info = account.data.parsed.info.tokenAmount;
    amount += BigInt(info.amount);
    decimals = info.decimals;
  }
  return { amount, decimals, uiAmount: 0 };
}

/** total balance of a mint across both token programs. */
export async function getTokenBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
): Promise<TokenBalance> {
  const [legacy, t22] = await Promise.all([
    balanceForProgram(connection, owner, mint, TOKEN_PROGRAM_ID),
    balanceForProgram(connection, owner, mint, TOKEN_2022_PROGRAM_ID),
  ]);
  const decimals = t22.decimals || legacy.decimals;
  const amount = legacy.amount + t22.amount;
  const uiAmount = decimals ? Number(amount) / 10 ** decimals : Number(amount);
  return { amount, decimals, uiAmount };
}

/** which token program owns a given mint, or null if the mint is not found. */
export async function detectTokenProgram(
  connection: Connection,
  mint: PublicKey,
): Promise<PublicKey | null> {
  const info = await connection.getAccountInfo(mint);
  if (!info) return null;
  if (info.owner.equals(TOKEN_2022_PROGRAM_ID)) return TOKEN_2022_PROGRAM_ID;
  if (info.owner.equals(TOKEN_PROGRAM_ID)) return TOKEN_PROGRAM_ID;
  return null;
}
