# multi-stage build for the pokeage cli. the anchor program is built separately
# with the sbf toolchain, not here.
FROM rust:slim-bookworm AS builder
RUN apt-get update && apt-get install -y pkg-config libssl-dev build-essential \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# cache deps: copy manifests, build a stub, then copy real sources
COPY Cargo.toml Cargo.lock* rust-toolchain.toml ./
COPY cli/Cargo.toml cli/
COPY programs/pokeage/Cargo.toml programs/pokeage/
RUN mkdir -p cli/src programs/pokeage/src \
    && echo "fn main() {}" > cli/src/main.rs \
    && echo "" > programs/pokeage/src/lib.rs \
    && cargo build --release -p pokeage-cli || true
COPY cli cli
COPY programs programs
RUN cargo build --release -p pokeage-cli

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -r -u 1001 -m pokeage
COPY --from=builder /app/target/release/pokeage /usr/local/bin/pokeage
USER pokeage
ENTRYPOINT ["pokeage"]
CMD ["version"]
