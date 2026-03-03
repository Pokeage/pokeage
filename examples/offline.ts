/* Show offline progression catch-up for an absent player.
   Usage: npx ts-node examples/offline.ts [hours] */

import {
  Engine,
  newTrainer,
  sampleRegistry,
  WORLD,
  runOfflineCatchup,
  formatOfflineSummary,
  Rng,
} from '../src';

const hours = Number(process.argv[2] || 8);

const trainer = newTrainer('demo', 'MISTY', sampleRegistry, {
  starterId: 7,
  starterLevel: 8,
  balls: 30,
});
const engine = new Engine(
  trainer,
  WORLD,
  (id) => sampleRegistry.getMonsterById(id),
  { rng: new Rng(2025) },
);

const summary = runOfflineCatchup(engine, hours * 3600 * 1000);
console.log(formatOfflineSummary(summary));
console.log(`ticks replayed: ${summary.ticks}`);
console.log(`team levels gained: ${summary.levels}`);
// away 8h: 1900 battles, +6 caught, +120 levels, +4 badges (seed dependent)
