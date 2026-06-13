# Contributing to pokeAge

Thanks for taking the time to look at the code. This is an early-stage, single
maintainer project, so the process is light.

## Repository layout

| Path | What it is |
| --- | --- |
| `src/` | the deterministic engine (TypeScript, zero runtime deps) |
| `sdk/` | the client SDK for the on-chain economy (TypeScript) |
| `programs/pokeage/` | the `$PAGE` economy program (Rust, Anchor) |
| `cli/` | the `pokeage` operator CLI (Rust) |
| `tests/`, `sdk/tests/` | engine and SDK unit tests |
| `examples/` | runnable scripts |
| `docs/` | architecture and reference docs |

## Local setup

```bash
git clone --recurse-submodules https://github.com/Pokeage/pokeage.git
cd pokeage
npm install
npm test
cargo build -p pokeage-cli
```

The engine has no runtime dependencies, so engine changes only need Node.

## Before you open a PR

- Run `npm run format` and `cargo fmt --all`.
- Run `npm test` and `cargo test -p pokeage-cli`.
- Keep the engine deterministic: take an `Rng`, never call `Math.random` or read
  the wall clock inside engine code.
- Match the existing comment style: short and domain-specific, not narration.
- One logical change per PR, with a clear title in conventional-commit style
  (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).

## Reporting bugs and ideas

Open an issue using the bug report or feature request template. For anything
security related, follow [SECURITY.md](SECURITY.md) instead of filing a public
issue.

## License

By contributing you agree your work is licensed under the project
[MIT License](LICENSE).
