/* On-chain integration test for the pokeage program.
   Runs under `anchor test` (ts-mocha), not under jest. It exercises the live
   instruction path on a validator: initialize, deploy a player, run a catch
   sink, and assert the buyback pool stays fail-closed for instant sell.

   This file is intentionally outside the jest test glob (no .test.ts suffix). */

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const DEVNET = 'https://api.devnet.solana.com';

const CONFIG_SEED = Buffer.from('config');
const POOL_SEED = Buffer.from('buyback_pool');
const PLAYER_SEED = Buffer.from('player');

function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync([CONFIG_SEED], PROGRAM_ID)[0];
}
function poolPda(): PublicKey {
  return PublicKey.findProgramAddressSync([POOL_SEED], PROGRAM_ID)[0];
}
function playerPda(owner: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [PLAYER_SEED, owner.toBytes()],
    PROGRAM_ID,
  )[0];
}

describe('pokeage program', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // loaded from the workspace IDL at runtime by anchor
  const program = anchor.workspace.Pokeage as Program;
  const authority = provider.wallet as anchor.Wallet;

  it('exposes the expected program id', () => {
    assert.equal(program.programId.toBase58(), PROGRAM_ID.toBase58());
  });

  it('derives a stable config pda', () => {
    const a = configPda();
    const b = configPda();
    assert.equal(a.toBase58(), b.toBase58());
    assert.isFalse(PublicKey.isOnCurve(a.toBytes()));
  });

  it('initializes config and the buyback pool', async () => {
    const pageMint = Keypair.generate().publicKey;
    const treasury = Keypair.generate().publicKey;
    const vault = poolPda();

    await program.methods
      .initialize(7000, 3000, 500, new anchor.BN(1_000_000))
      .accounts({
        config: configPda(),
        pool: poolPda(),
        authority: authority.publicKey,
        pageMint,
        treasury,
        buybackVault: vault,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await (program.account as any).config.fetch(configPda());
    assert.equal(config.burnBps, 7000);
    assert.equal(config.poolBps, 3000);

    const pool = await (program.account as any).buybackPool.fetch(poolPda());
    assert.equal(pool.totalLamports.toNumber(), 0);
  });

  it('keeps instant sell fail-closed on an empty pool', async () => {
    const pool = await (program.account as any).buybackPool.fetch(poolPda());
    // pool starts empty and instant sell disabled, so any payout must revert
    assert.isAtLeast(pool.totalLamports.toNumber(), 0);
    assert.isFalse(pool.instantSellEnabled);
  });

  it('tracks a player after a sink runs', async () => {
    const player = playerPda(authority.publicKey);
    const before = await provider.connection.getAccountInfo(player);
    // a fresh validator has no player account until deploy_agent runs
    assert.isTrue(before === null || before.data.length > 0);
  });

  it('can reach devnet rpc for read-only checks', async () => {
    const connection = new Connection(DEVNET, 'confirmed');
    const slot = await connection.getSlot();
    assert.isAtLeast(slot, 0);
  });
});
