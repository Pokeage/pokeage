import { PublicKey } from '@solana/web3.js';
import {
  configPda,
  poolPda,
  playerPda,
  listingPda,
  cardPda,
} from '../src/pda';
import { PROGRAM_ID } from '../src/constants';

const owner = new PublicKey('11111111111111111111111111111112');

describe('pda derivation', () => {
  it('derives singletons deterministically', () => {
    expect(configPda()[0].toBase58()).toBe(configPda()[0].toBase58());
    expect(poolPda()[0].toBase58()).toBe(poolPda()[0].toBase58());
    expect(configPda()[0].equals(poolPda()[0])).toBe(false);
  });

  it('derives per-owner and per-card addresses', () => {
    const [player, bump] = playerPda(owner);
    expect(player).toBeInstanceOf(PublicKey);
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThanOrEqual(255);

    const card = PublicKey.unique();
    expect(listingPda(card)[0].equals(cardPda(card)[0])).toBe(false);
  });

  it('addresses are off-curve PDAs of the program', () => {
    const [config] = configPda();
    expect(PublicKey.isOnCurve(config.toBytes())).toBe(false);
    expect(config.equals(PROGRAM_ID)).toBe(false);
  });
});
