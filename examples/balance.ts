/* Read a $PAGE Token-2022 balance over RPC.
   $PAGE is not launched yet, so pass any Token-2022 mint to try the lookup.
   Usage: npx ts-node examples/balance.ts <ownerPubkey> <mintPubkey> [rpcUrl] */

import { Connection, PublicKey } from '@solana/web3.js';
import { getTokenBalance, detectTokenProgram } from '../sdk/src';

async function main() {
  const owner = process.argv[2];
  const mint = process.argv[3];
  const rpc = process.argv[4] || 'https://api.mainnet-beta.solana.com';
  if (!owner || !mint) {
    console.error('usage: balance.ts <ownerPubkey> <mintPubkey> [rpcUrl]');
    process.exit(1);
  }

  const connection = new Connection(rpc, 'confirmed');
  const ownerKey = new PublicKey(owner);
  const mintKey = new PublicKey(mint);

  const program = await detectTokenProgram(connection, mintKey);
  console.log(`mint owner program: ${program ? program.toBase58() : 'not found'}`);

  const bal = await getTokenBalance(connection, ownerKey, mintKey);
  console.log(`balance: ${bal.uiAmount} (${bal.amount} base units, ${bal.decimals} decimals)`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
