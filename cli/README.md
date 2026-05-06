# pokeage-cli

Read-only operator CLI for the pokeAge `$PAGE` on-chain economy. It reads the
program's `Config`, `BuybackPool`, and per-player accounts over RPC, derives the
PDAs locally, and runs a pure tokenomics projection. No transactions are signed
or sent. Every view is a read.

Binary name: `pokeage`. Crate: `pokeage-cli`. Token decimals: 6. Program id is the
Anchor placeholder `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` until a real
deploy replaces it.

## Status

Pre-deployment, devnet-oriented, single author, not audited. The program id is a
placeholder, so `stats`, `pool`, and `player` will report "not initialized"
against any cluster where the program is not deployed and seeded. The `config`,
`sim`, and `version` commands are fully local and work with no network.

## Commands

| Command | Network | What it does |
|---|---|---|
| `pokeage config` | local | Resolved RPC url, keypair, program id, derived PDAs, full economy constants table. |
| `pokeage stats` | RPC | Fetches `Config` + `BuybackPool`, prints total burned, cards minted, pool balance, floor, pauses. |
| `pokeage pool` | RPC | Buyback pool detail plus the live instant-sell quote (floor times 50 percent) and payout capacity. |
| `pokeage player <PUBKEY>` | RPC | Derives the player PDA, prints agent state, total caught, gym wins, and the 12-bit badge map. |
| `pokeage listing <CARD_MINT>` | RPC | Derives the listing PDA for a card mint, prints price, tier, level, stage, and the fee settlement split. |
| `pokeage sim --days N --users N` | local | Runs the economy projection, prints a daily burn and pool accrual table with cumulative totals. |
| `pokeage version` | local | Crate version and program id. |

## Global flags

| Flag | Default | Meaning |
|---|---|---|
| `--rpc-url` | `https://api.devnet.solana.com` | Solana RPC endpoint. |
| `--keypair` | `~/.config/solana/id.json` | Operator keypair path. A leading `~` is expanded to the home dir. |

Flags are global, so they may appear before or after the subcommand.

## Build

The crate is a member of the workspace at `product/Cargo.toml`. Build just the
CLI from the workspace root:

```
cargo build -p pokeage-cli
```

Release binary:

```
cargo build -p pokeage-cli --release
```

