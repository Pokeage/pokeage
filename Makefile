.PHONY: build test lint format clean program cli sdk engine examples

# build everything that builds on a host (engine, sdk, cli). the anchor program
# uses the sbf toolchain via `make program`.
build: engine sdk cli

engine:
	npm run build

sdk:
	npm run build:sdk

cli:
	cargo build --release -p pokeage-cli

program:
	anchor build

test:
	npm test
	cargo test -p pokeage-cli

lint:
	npm run lint
	cargo clippy -p pokeage-cli -- -W warnings

format:
	npm run format
	cargo fmt --all

format-check:
	npm run format:check
	cargo fmt --all --check

examples:
	npx ts-node examples/simulate-run.ts

clean:
	npm run clean
	cargo clean
