# Changelog

All notable changes to this project are documented here. The format is based on
Keep a Changelog, and this project adheres to semantic versioning.

## [0.4.1] - 2026-06-22

### Fixed

- Token-2022 balance read now queries both token programs and sums, fixing a
  zero-balance result for pump.fun era mints.
- Per-hit damage cap is applied once after STAB and crit so multipliers cannot
  exceed the cap.

## [0.4.0] - 2026-05-18

### Added

- Buyback pool program path: instant sell quote, fail-closed payout, floor
  updates.
- SDK `PokeageClient` with PDA helpers and instruction builders.
- CLI `sim` command for off-chain economy projection.

### Changed

- Engine moved to an injected seedable `Rng` so runs are fully reproducible.

## [0.3.0] - 2026-03-09

### Added

- Marketplace instructions: list, cancel, buy, with a 5 percent fee split.
- Card mint gating tied to the affection bond reaching its cap.
- Offline progression catch-up, capped at 24 hours.

## [0.2.0] - 2025-12-15

### Added

- On-chain economy program scaffold: config, player state, token sinks.
- Gym battle resolution and badge progression in the engine.

## [0.1.0] - 2025-10-21

### Added

- Initial engine: type chart, damage formula, leveling and evolution, wild
  encounters, 1v1 battles, catching, and the sample roster and world.

[0.4.1]: https://github.com/Pokeage/pokeage/releases/tag/v0.4.1
[0.4.0]: https://github.com/Pokeage/pokeage/releases/tag/v0.4.0
[0.3.0]: https://github.com/Pokeage/pokeage/releases/tag/v0.3.0
[0.2.0]: https://github.com/Pokeage/pokeage/releases/tag/v0.2.0
[0.1.0]: https://github.com/Pokeage/pokeage/releases/tag/v0.1.0
