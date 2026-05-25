# Getting started

This guide builds and runs each of the four packages: the TypeScript engine, the
Anchor program, the TypeScript SDK, and the Rust CLI. The engine runs with no
chain in the loop, so start there.

## Prerequisites

| package | needs |
| --- | --- |
| engine, SDK | Node 18+ and a TypeScript toolchain (tsc or tsx) |
| program | Rust (rustup), Solana CLI, Anchor (via AVM) |
| CLI | Rust (rustup), a Solana RPC endpoint |

On Windows the Solana and Anchor toolchains build natively with Visual Studio
Build Tools (Desktop development with C++), LLVM, and the Anza Solana installer.
If `anchor build` fails with linker errors, the C++ workload is the usual cause.

## Clone

The program depends on the Anchor toolchain and the CLI is a separate Cargo
crate. If you split these into submodules, clone with submodules:

```bash
git clone --recurse-submodules <repo-url> pokeage
cd pokeage
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

The packages described below live under `product/`:

```
product/src/            engine
product/programs/pokeage/  program
product/sdk/            SDK
product/cli/            CLI
```

## Build the engine

The engine is plain TypeScript with no runtime dependencies. Compile it with
`tsc` or run it directly with `tsx`. From `product/`:

```bash
# typecheck / compile
npx tsc --strict --module nodenext --target es2022 --outDir dist src/index.ts

# or run a script straight from source, no build step
npx tsx run-sim.ts
```

The public API is exported from [src/index.ts](../src/index.ts). Import what you
need from there.

## Run a deterministic simulation

The engine is deterministic: seed an `Rng`, build a trainer over the sample
registry and world, and run N ticks. The same seed produces the same run every
time. Save this as `run-sim.ts` under `product/` and run it with
`npx tsx run-sim.ts`:

```ts
import {
  Rng,
  Engine,
  WORLD,
  sampleRegistry,
  newTrainer,
} from './src/index';

// 1. seed the rng. swap in any number, or rngFromString('<wallet>')
const rng = new Rng(12345);

// 2. build a trainer with a starter over the sample roster
const trainer = newTrainer('p1', 'Ash', sampleRegistry, {
  starterId: 4,   // Cindercub (fire)
  starterLevel: 5,
  balls: 20,
});

// 3. wire up the engine: trainer, world, template resolver, injected rng
const engine = new Engine(
  trainer,
  WORLD,
  (id) => sampleRegistry.getMonsterById(id),
  { rng },
);

// 4. run N ticks and print what each one did
for (let i = 0; i < 200; i++) {
  const t = engine.tick();
  const log = t.encounter?.log?.join('; ') ?? t.detail ?? '';
  if (t.action !== 'hunt' || log) {
    console.log(`#${i} ${t.action} ${log}`);
  }
}

const lead = trainer.team[0];
console.log(
  `lead: ${lead.name} Lv.${lead.level} stage ${lead.stage} ` +
  `affection ${lead.affection.toFixed(1)}`,
);
console.log(`badges: ${trainer.badges.join(', ') || 'none'}`);
console.log(`caught: ${trainer.totalCaught}, battles: ${trainer.totalBattles}`);
```

Run it twice with the same seed: the output is identical. Change the seed and the
run diverges. To simulate time away instead of a fixed tick count, use the
offline helper:

```ts
import { runOfflineCatchup, formatOfflineSummary } from './src/index';

const summary = runOfflineCatchup(engine, 6 * 3600 * 1000); // 6 hours
console.log(formatOfflineSummary(summary));
```

## Build the program

The program is an Anchor program. From `product/` (or wherever your `Anchor.toml`
lives):

```bash
anchor build
```

This compiles the BPF binary and regenerates the IDL at
[programs/pokeage/idl/pokeage.json](../programs/pokeage/idl/pokeage.json). The declared
program id is the Anchor placeholder; replace it before any real deploy and
re-run `anchor build` so the IDL and `declare_id!` agree.

Run the program's unit tests (constants, splits, account decode):

```bash
cargo test -p pokeage
```

To deploy to a local validator for integration testing:

```bash
solana-test-validator        # in one terminal
anchor deploy                # in another
```

## Build the CLI

The CLI is a standalone Rust crate that reads program state and runs economy
projections off-chain. From `product/cli/`:

```bash
cargo build --release
cargo test            # economy math, account decode, config resolution
```

The binary resolves an RPC URL and an operator keypair path, and parses the
program id once at startup. The keypair is only read by commands that need a
signer, so pure-read views work without one. The default RPC in the SDK is
devnet; point the CLI at whatever endpoint you run against.

## Use the SDK

The SDK builds instructions and decodes accounts on the client side. It exports
PDA derivation, a borsh codec, and a Token-2022 aware balance reader. The $PAGE
mint is passed in at call time, since the token is not launched yet.

```ts
import { configPda, playerPda, poolPda } from './sdk/src/pda';
import { getTokenBalance } from './sdk/src/token';
import { PublicKey, Connection } from '@solana/web3.js';

const [config] = configPda();
const [pool] = poolPda();
const [player] = playerPda(new PublicKey('<wallet>'));

// read a Token-2022 balance correctly (sums both token programs)
const conn = new Connection('https://api.devnet.solana.com');
const bal = await getTokenBalance(conn, new PublicKey('<wallet>'), new PublicKey('<pokeage-mint>'));
console.log(`balance: ${bal.uiAmount} PAGE`);
```

Reading a Token-2022 balance with a single `getTokenAccountsByOwner` filtered by
mint returns empty for a Token-2022 holder; `getTokenBalance` queries both the
legacy and Token-2022 programs and sums, which is the correct path for a pump.fun
era mint.

## Next steps

- [ARCHITECTURE.md](./ARCHITECTURE.md) for the system overview and data flow.
- [engine.md](./engine.md) for the module-by-module engine reference.
- [program.md](./program.md) for the on-chain instruction and account reference.
- [tokenomics.md](./tokenomics.md) for the sink, fee, and price model.
- [security.md](./security.md) for the security posture and limitations.
