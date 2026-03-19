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
