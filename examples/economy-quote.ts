/* Print the card price model and on-chain economy quotes.
   Usage: npx ts-node examples/economy-quote.ts */

import {
  cardPriceSol,
  mintFeeLamports,
  instantSellQuote,
  TIER_ORDER,
} from '../src';

console.log('tier      mintFee(SOL)  base@Lv5/s0   max@Lv100/s2');
for (const tier of TIER_ORDER) {
  const mint = (mintFeeLamports(tier) / 1e9).toFixed(3);
  const low = cardPriceSol(tier, 5, 0).toFixed(4);
  const high = cardPriceSol(tier, 100, 2).toFixed(2);
  console.log(
    `${tier.padEnd(9)} ${mint.padStart(8)}      ${low.padStart(9)}     ${high.padStart(9)}`,
  );
}

const floorLamports = 0.3 * 1e9;
console.log(
  `\ninstant sell of a 0.3 SOL floor card: ${(instantSellQuote(floorLamports) / 1e9).toFixed(3)} SOL`,
);
// holo Lv100 stage2 lands around 12 SOL, instant sell pays floor * 0.5
