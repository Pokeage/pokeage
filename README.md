<p align="center">
  <img src="assets/banner.png" alt="pokeAge" width="100%" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5b6c8f?style=for-the-badge" alt="license" /></a>
  <a href="https://github.com/Pokeage/pokeage/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Pokeage/pokeage/ci.yml?branch=main&style=for-the-badge&label=CI" alt="ci" /></a>
  <img src="https://img.shields.io/badge/version-0.4.1-5b6c8f?style=for-the-badge" alt="version" />
  <img src="https://img.shields.io/badge/engine-zero%20deps-5b6c8f?style=for-the-badge" alt="zero deps" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
  <img src="https://img.shields.io/badge/Rust-b7410e?style=for-the-badge&logo=rust&logoColor=white" alt="rust" />
  <img src="https://img.shields.io/badge/Solana-Anchor-5b6c8f?style=for-the-badge" alt="solana anchor" />
  <a href="https://github.com/Pokeage/pokeage/stargazers"><img src="https://img.shields.io/github/stars/Pokeage/pokeage?style=for-the-badge&color=5b6c8f" alt="stars" /></a>
  <a href="https://github.com/Pokeage/pokeage/commits/main"><img src="https://img.shields.io/github/last-commit/Pokeage/pokeage?style=for-the-badge&color=5b6c8f" alt="last commit" /></a>
  <a href="https://github.com/Pokeage/pokeage/issues"><img src="https://img.shields.io/github/issues/Pokeage/pokeage?style=for-the-badge&color=5b6c8f" alt="issues" /></a>
</p>

# pokeAge

A deterministic, dependency-free monster-RPG simulation engine in TypeScript,
paired with a planned `$PAGE` on-chain economy on Solana (Anchor, Token-2022).
The engine resolves battles, leveling, evolution, catching, and offline
progression; the on-chain program settles the value side: token sinks, NFT mint
gating, a marketplace, and a fail-closed buyback pool.

The original work lives in `src/` (engine) and `sdk/`. `lib/` style third-party
code is not vendored: the on-chain crate pulls dependencies through Cargo and
Anchor, not by copying sources.

## Features

| Area | What | Status |
| --- | --- | --- |
| Type chart | 17 types, super-effective, resist, immunity | stable |
| Damage | standard formula with STAB, crit, per-hit cap | stable |
| Progression | xp curve, stat growth, evolution gating | stable |
| Encounters | rare and legendary spawn odds, shop buffs | stable |
| Battle | 1v1 with event log, gym chains, auto sim | stable |
| Catching | rarity rates, level penalty, ball multipliers | stable |
| Offline | deterministic catch-up, capped at 24h | stable |
| Pricing | tier base, level band, evolution stage | stable |
| `$PAGE` program | sinks, mint gating, market, buyback pool | beta |
| SDK | PDAs, account decode, Token-2022 balances | beta |
| CLI | config, stats, pool, player, listing, sim | beta |

## Architecture

The off-chain engine decides outcomes. The on-chain program settles value. They
share one price model so estimates match charges.

```mermaid
flowchart LR
  subgraph offchain [off-chain engine]
    E[engine src/] --> P[pricing]
    E --> B[battle]
    E --> G[progression]
  end
  subgraph onchain [on-chain program]
    PR[pokeage program] --> SK[token sinks 70/30]
    PR --> MK[marketplace 5%]
    PR --> BP[buyback pool]
