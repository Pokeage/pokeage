# Examples

Runnable scripts that exercise the engine and SDK. They import directly from the
source so no build step is needed beyond `ts-node`.

```bash
git clone --recurse-submodules https://github.com/OWNER/REPO.git
cd REPO
npm install
```

| Script | What it does |
| --- | --- |
| `simulate-run.ts` | Runs a full deterministic playthrough and prints final team, badges, and totals. |
| `battle.ts` | Simulates a single 1v1 fight and prints the turn-by-turn log. |
| `offline.ts` | Replays offline progression for an absent player (capped at 24h). |
| `economy-quote.ts` | Prints the card price model and on-chain economy quotes. |
| `balance.ts` | Reads a Token-2022 balance across both token programs over RPC. |

Run any of them:

```bash
npx ts-node examples/simulate-run.ts 2024 2000
npx ts-node examples/battle.ts 11
npx ts-node examples/offline.ts 8
npx ts-node examples/economy-quote.ts
npx ts-node examples/balance.ts <ownerPubkey> <mintPubkey>
```

Every run with the same seed produces the same outcome: the engine takes a
seeded `Rng`, so battles and encounters are fully reproducible.
