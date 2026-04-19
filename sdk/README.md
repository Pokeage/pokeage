# @pokeage/sdk

TypeScript client for the pokeAge `$PAGE` on-chain economy. It derives the
program PDAs, decodes the account structs, reads Token-2022 balances correctly,
and builds the program instructions. Price quotes reuse the engine model so an
off-chain estimate matches the on-chain charge.

The program is pre-deployment, so the program id is the Anchor placeholder and
`$PAGE` is passed in at call time rather than hardcoded.

## Install

```bash
git clone --recurse-submodules https://github.com/Pokeage/pokeage.git
cd pokeage
npm install
```

## Reading state

```ts
import { PokeageClient, badgeList } from '@pokeage/sdk';
import { PublicKey } from '@solana/web3.js';

const client = PokeageClient.fromRpc('https://api.devnet.solana.com');

const config = await client.fetchConfig();
const pool = await client.fetchPool();
// pool: { totalLamports, floorPrice, instantSellEnabled, ... } or null

const owner = new PublicKey('YourWalletPubkeyHere1111111111111111111111');
const player = await client.fetchPlayer(owner);
// player: { agentDeployed, totalCaught, gymWins, badges, ... } or null
if (player) console.log('badges:', badgeList(player.badges));
```

## Token-2022 balances

A mint filtered `getTokenAccountsByOwner` only inspects the legacy token program
and returns nothing for a Token-2022 holder. `getTokenBalance` queries both
programs and sums them.

```ts
const mint = new PublicKey('YourPokeageMintWhenLaunched11111111111111111');
const bal = await client.pageBalance(owner, mint);
// { amount: 1000000000n, uiAmount: 1000, decimals: 6 }
```

## Building instructions

```ts
import { instructions, CatchRarity } from '@pokeage/sdk';

const ix = client.catchAttempt(owner, mint, CatchRarity.Rare);
// returns a web3.js TransactionInstruction; sign and send it yourself
```

## Quotes

```ts
client.marketPriceSol(3 /* holo */, 100, 2); // estimated market price in SOL
client.mintFee(4 /* ultra */);               // mint fee in lamports
await client.instantSellPayout();            // floor * 50% from the live pool
```

## Layout

| File | Purpose |
| --- | --- |
| `constants.ts` | program id, token programs, seeds, discriminators |
| `pda.ts` | config, pool, player, listing, card PDAs |
| `accounts.ts` | fetch and Borsh-decode each account |
| `token.ts` | Token-2022 balance across both programs |
| `instructions.ts` | low-level instruction builders |
| `client.ts` | high-level `PokeageClient` |
| `borsh.ts` | tiny little-endian Borsh codec |

Status: pre-deployment, devnet oriented, single author, not audited. The
canonical instruction ABI is `programs/pokeage/idl/pokeage.json`.
