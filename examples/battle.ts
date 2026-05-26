/* Simulate a single 1v1 battle and print the turn log.
   Usage: npx ts-node examples/battle.ts [seed] */

import {
  simulateBattle,
  createMonsterInstance,
  sampleRegistry,
  effectivenessLabel,
  Rng,
} from '../src';

const seed = Number(process.argv[2] || 11);

const me = createMonsterInstance(sampleRegistry.getMonsterById(6)!, 30); // Pyrothane (fire)
const foe = createMonsterInstance(sampleRegistry.getMonsterById(3)!, 30); // Verdrake (grass)

console.log(`${me.name} Lv.${me.level} vs ${foe.name} Lv.${foe.level}`);

const result = simulateBattle(me, foe, new Rng(seed));

for (const e of result.events) {
  if (e.miss) {
    console.log(`${e.atkName} used ${e.move}, but it missed`);
    continue;
  }
  const eff = effectivenessLabel(e.typeMod);
  const tags = [e.crit ? 'crit' : '', eff || '', e.status ? `inflicted ${e.status}` : '']
    .filter(Boolean)
    .join(', ');
  console.log(
    `${e.atkName} used ${e.move} for ${e.dmg}${tags ? ' (' + tags + ')' : ''}`,
  );
}

console.log(result.won ? `${me.name} won` : `${me.name} lost`);
// { won: true } most seeds, fire is super effective vs grass
