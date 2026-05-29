# pokeAge architecture

pokeAge is a monster-RPG that splits cleanly into two halves: a deterministic
simulation engine that decides what happens in the game, and an on-chain economy
that settles the value of those outcomes in $PAGE and SOL. The two halves never
share mutable state. The engine resolves a fight, a catch, or a level-up; the
chain only sees the result of a player action and moves tokens accordingly.

This document covers the monorepo layout, the off-chain / on-chain split, the
data flow between them, the determinism model, and how the four packages relate.

## Goals and non-goals

The engine is framework-free and pure. No DOM, no network, no globals, no wall
clock. Every random draw comes from an injected `Rng`, so a run is reproducible
from a single seed. That makes the balance testable and lets offline progression
replay the exact ticks a player missed.

The program is intentionally small. It runs token sinks, card mint fees, and a
SOL card marketplace with a fail-closed instant-sell floor. It does not run
combat, leveling, or encounter logic on-chain. Game outcomes are computed off-
chain by the engine; the chain charges and settles.

## Monorepo layout

```
product/
  src/                 engine: deterministic TypeScript simulation (the IP)
    data/              sample roster and world data
  programs/pokeage/       program: Solana Anchor economy in Rust (pre-deployment)
    src/instructions/  one handler module per instruction
    src/state/         account structs
    idl/pokeage.json      generated IDL
  sdk/                 TypeScript SDK: PDAs, borsh codec, token reads
  cli/                 Rust CLI: read-only operator views and projections
  docs/                this documentation
```

The engine source modules are: [types](../src/types.ts),
[rng](../src/rng.ts), [constants](../src/constants.ts),
[typechart](../src/typechart.ts), [moves](../src/moves.ts),
[damage](../src/damage.ts), [stats](../src/stats.ts),
[progression](../src/progression.ts), [power](../src/power.ts),
[catch](../src/catch.ts), [affection](../src/affection.ts),
[encounter](../src/encounter.ts), [battle](../src/battle.ts),
[team](../src/team.ts), [offline](../src/offline.ts),
[engine](../src/engine.ts), [pricing](../src/pricing.ts),
[factory](../src/factory.ts). The public surface is re-exported from
[index.ts](../src/index.ts).

## The off-chain / on-chain split

The engine owns simulation. Given a trainer, a world, and a seed, it decides
the next action and mutates the trainer in memory. It has no concept of a wallet,
a token balance, or a transaction. It produces structured results
(`TickResult`, `BattleResult`, `EncounterResult`) that a host can render, store,
or use to drive a transaction.

The program owns value. It holds `Config`, per-player `PlayerState`, the
`BuybackPool`, marketplace `Listing` accounts, and `CardMeta` records. It charges
$PAGE sinks for game actions (deploy, catch, gym, force-evolve), charges SOL
mint fees for cards, and runs the marketplace. It never decides whether a catch
succeeded or a gym was cleared; the client asserts that and pays the matching
sink.

The two are kept consistent by sharing constants, not code. The engine's
[constants.ts](../src/constants.ts) economy block mirrors the program's
[constants.rs](../programs/pokeage/src/constants.rs): same decimals, same sink
costs, same 70/30 split, same mint-fee table. The off-chain price model in
[pricing.ts](../src/pricing.ts) produces estimates that match what the chain
will charge, so a UI can quote a mint fee or an instant-sell payout before the
user signs.

## Module graph

```mermaid
graph TD
  types[types.ts]
  rng[rng.ts]
  constants[constants.ts]
  typechart[typechart.ts]
  moves[moves.ts]
  damage[damage.ts]
  stats[stats.ts]
  progression[progression.ts]
  catch[catch.ts]
  affection[affection.ts]
  encounter[encounter.ts]
  battle[battle.ts]
  team[team.ts]
  power[power.ts]
  engine[engine.ts]
  offline[offline.ts]
  pricing[pricing.ts]

  damage --> typechart
  damage --> rng
  damage --> constants
  moves --> types
  battle --> damage
  battle --> moves
  battle --> stats
  stats --> constants
  progression --> stats
  encounter --> stats
  encounter --> rng
  team --> power
  engine --> encounter
  engine --> battle
  engine --> catch
  engine --> progression
  engine --> team
  engine --> affection
  offline --> engine
  pricing --> constants
```

`types.ts` and `constants.ts` are leaves that everything else depends on. The
`engine.ts` tick orchestrator sits on top and pulls in encounter, battle, catch,
progression, team, and affection. `offline.ts` is a thin wrapper that replays
engine ticks. `pricing.ts` is independent of the simulation and depends only on
the shared economy constants.

## Data flow: action to settlement

A single player action moves through three stages. The engine decides the
outcome, the host turns the outcome into a transaction, and the program settles
the value.

1. The host calls `engine.tick()` (or a specific helper such as
   `simulateBattle`). The engine draws from the injected `Rng`, resolves the
   outcome, mutates the trainer, and returns a `TickResult`.
2. If the outcome carries an on-chain cost (a catch attempt, a gym clear, a
   force-evolve, a card mint or trade), the host builds the matching instruction
   using the [SDK](../sdk/src/constants.ts): derive PDAs, encode args with the
   borsh codec, attach the player's token accounts.
3. The program charges the sink or fee, splits it, updates counters, and emits
   an event. Token sinks burn 70 percent and route 30 percent to the buyback
   pool. Card mint fees split 50/50 pool/treasury. Marketplace trades take a
   5 percent fee split 60 pool / 40 burn-share.

```mermaid
graph LR
  player[player action] --> engine[engine resolves outcome]
  engine --> outcome{has on-chain cost?}
  outcome -- no --> render[render / store result]
  outcome -- yes --> sdk[SDK builds instruction]
  sdk --> program[program charges + settles]
  program --> burn[70% burn]
  program --> pool[30% buyback pool]
  program --> events[emit event]
```

The card claim gate ties the two together. A monster only becomes mintable once
its `affection` reaches `AFFECTION_MAX` (100), checked by `canClaimCard` in
[affection.ts](../src/affection.ts). Affection is earned through wins in the
engine, so the right to mint a card is something the simulation grants, not
something the chain hands out for free.

## Determinism model

The live game used `Math.random`, which made battles impossible to replay or
test. The engine replaces that with [rng.ts](../src/rng.ts), a seedable
mulberry32 generator. Properties that matter:

- Same seed, same sequence. Two `Rng` instances built from the same seed produce
  identical draws, so two runs with the same inputs produce identical outcomes.
- Injectable. Every function that rolls dice (`calcDamage`, `attemptCatch`,
  `generateWildMonster`, `simulateBattle`, the `Engine`) takes an `Rng`. Nothing
  reads a global random source.
- Snapshot and restore. `rng.snapshot()` and `rng.restore()` capture the 32-bit
  state so a run can be saved mid-stream and resumed exactly.
- String seeds. `rngFromString` hashes an arbitrary string (for example a wallet
  address) into a seed, so a player's run can be deterministically tied to their
  identity.

Offline progression depends on this directly. `runOfflineCatchup` in
[offline.ts](../src/offline.ts) computes how many 15-second ticks elapsed during
an absence (capped at 24 hours) and replays exactly that many `engine.tick`
calls. Because the engine is deterministic, the catch-up is reproducible and
verifiable rather than a black-box reward.

## Package relationships

| package | language | role | depends on |
| --- | --- | --- | --- |
| engine (`src/`) | TypeScript | simulation, the original IP | nothing external at runtime |
| program (`programs/pokeage/`) | Rust / Anchor | $PAGE economy, marketplace | anchor-lang, anchor-spl |
| sdk (`sdk/`) | TypeScript | client-side PDAs, codec, token reads | @solana/web3.js |
| cli (`cli/`) | Rust | read-only operator views, projections | solana-client, solana-sdk, borsh |

The engine stands alone. It has no dependency on the program, the SDK, or
Solana. You can run the full simulation with no chain in the loop.

The SDK is the bridge from a host application to the program. It hardcodes the
PDA seeds, instruction and account discriminators, and a minimal borsh codec,
all matching the program. It deliberately does not hardcode the $PAGE mint, since
the token is not launched yet; the mint is passed in at call time.

The CLI is an operator tool that reads program state and runs economy
projections off-chain. It mirrors the program's economy constants in
[economy.rs](../cli/src/economy.rs) and the account layouts in
[state.rs](../cli/src/state.rs) so it can decode accounts without linking the
Anchor crate.

The shared seam across all four is the economy constants. They are duplicated
deliberately (TypeScript engine, Rust program, TypeScript SDK, Rust CLI) so each
package builds independently, and they are kept in sync by hand. Each copy
carries tests asserting the splits sum correctly and the mint-fee table is
monotonic, so drift is caught in CI rather than at runtime.

## Status

The engine is implemented and self-contained. The program is pre-deployment:
the program id is the Anchor placeholder, the $PAGE mint is not launched, and the
code has not had an external audit. See [security.md](./security.md) for the
honest limitations and [getting-started.md](./getting-started.md) to build and
run each package.
