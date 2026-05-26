/* Run a full deterministic pokeAge playthrough and print the result.
   Usage: npx ts-node examples/simulate-run.ts [seed] [ticks] */

import {
  Engine,
  newTrainer,
  sampleRegistry,
  WORLD,
  Rng,
} from '../src';

const seed = Number(process.argv[2] || 2024);
const ticks = Number(process.argv[3] || 2000);

const trainer = newTrainer('demo', 'ASH', sampleRegistry, {
  starterId: 4,
  starterLevel: 6,
  balls: 30,
});

const engine = new Engine(
  trainer,
  WORLD,
  (id) => sampleRegistry.getMonsterById(id),
  { rng: new Rng(seed) },
);

let caught = 0;
for (let i = 0; i < ticks; i++) {
  const t = engine.tick();
  if (t.action === 'caught') caught++;
}

console.log(`seed ${seed}, ${ticks} ticks`);
console.log(`location: ${trainer.location}`);
console.log(`battles: ${trainer.totalBattles}`);
console.log(`caught: ${trainer.totalCaught}`);
console.log(`badges (${trainer.badges.length}): ${trainer.badges.join(', ')}`);
console.log('party:');
for (const m of trainer.team) {
  console.log(`  ${m.name} Lv.${m.level} stage ${m.stage} HP ${m.currentHP}/${m.stats.hp}`);
}
// { battles: 1200+, caught: 6-9, badges: up to 12 } depending on the seed
