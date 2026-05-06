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

The compiled binary lands at `target/debug/pokeage` (or `target/release/pokeage`).
Run the test suite:

```
cargo test -p pokeage-cli
```

## Economy constants

The constants mirror `programs/pokeage/src/constants.rs` so CLI output and the chain
agree without a shared crate. Token sinks: deploy 1,000, catch 10 / 100 / 1,000,
gym 50, force evolve 75,000 (all `$PAGE`). Every sink splits 70 percent burned,
30 percent to the buyback pool. Market fee is 5 percent, instant sell pays 50
percent of floor, listing fee is 0.001 SOL.

## Examples

Local config view, no network needed:

```
$ pokeage config
pokeage cli config
  rpc url      https://api.devnet.solana.com
  keypair      /home/op/.config/solana/id.json
  program id   Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

derived pdas
  config       7Xk... (bump 254)
  buyback pool 9Qm... (bump 251)

economy constants (token amounts in $PAGE, 6 decimals)
  deploy cost        1000.000000 $PAGE  (1000000000 base units)
  catch common         10.000000 $PAGE  (10000000 base units)
  ...
```

Chain stats against a deployed cluster:

```
$ pokeage stats --rpc-url https://api.devnet.solana.com
pokeage economy stats
  config pda   7Xk...
  pool pda     9Qm...

config
  total burned     1240500.000000 $PAGE
  cards minted     318
  burn / pool bps  7000 / 3000
  paused           none

buyback pool
  balance          42.500000000 SOL
  floor price      0.100000000 SOL
  instant sell     enabled
