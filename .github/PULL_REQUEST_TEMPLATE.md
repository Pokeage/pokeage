## What this changes

A short description of the change and why.

## Affected package

- [ ] engine (`src/`)
- [ ] sdk (`sdk/`)
- [ ] program (`programs/pokeage/`)
- [ ] cli (`cli/`)
- [ ] docs / meta

## Checklist

- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `cargo fmt --all --check` and `cargo test -p pokeage-cli` pass (if Rust changed)
- [ ] engine changes stay deterministic (no `Math.random`, no wall-clock reads)
- [ ] commit messages follow conventional commits

## Notes for reviewers

Anything specific you want a second look at.
