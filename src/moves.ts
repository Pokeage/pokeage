/* pokeAge engine: move data and selection.
   Move names are original, mechanic-flavored labels (no trademarked names).
   The live game streams these from assets/moves.json; here they ship with the
   engine so it runs with no external fetch. power 0 would be a status move and
   is excluded from the attack index. */

import type { Move, MonsterInstance, MonsterType } from './types';

export const MOVES: Move[] = [
  // normal
  { id: 1, name: 'Strike Hit', type: 'normal', power: 40, acc: 100, pp: 35, status: null, effChance: 0, crit: false, multi: false },
  { id: 2, name: 'Body Ram', type: 'normal', power: 60, acc: 100, pp: 20, status: null, effChance: 0, crit: false, multi: false },
  { id: 3, name: 'Power Smash', type: 'normal', power: 85, acc: 95, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 4, name: 'Final Charge', type: 'normal', power: 110, acc: 85, pp: 5, status: null, effChance: 0, crit: false, multi: false },
  { id: 5, name: 'Rapid Jab', type: 'normal', power: 18, acc: 85, pp: 30, status: null, effChance: 0, crit: false, multi: true },
  // fire
  { id: 10, name: 'Ember Lash', type: 'fire', power: 40, acc: 100, pp: 25, status: 'burn', effChance: 10, crit: false, multi: false },
  { id: 11, name: 'Flame Burst', type: 'fire', power: 65, acc: 100, pp: 15, status: 'burn', effChance: 10, crit: false, multi: false },
  { id: 12, name: 'Inferno Wave', type: 'fire', power: 90, acc: 95, pp: 10, status: 'burn', effChance: 20, crit: false, multi: false },
  { id: 13, name: 'Solar Pyre', type: 'fire', power: 115, acc: 85, pp: 5, status: 'burn', effChance: 30, crit: false, multi: false },
  // water
  { id: 20, name: 'Splash Jet', type: 'water', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 21, name: 'Tide Pulse', type: 'water', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 22, name: 'Torrent Crash', type: 'water', power: 90, acc: 95, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  { id: 23, name: 'Abyssal Surge', type: 'water', power: 115, acc: 85, pp: 5, status: null, effChance: 0, crit: false, multi: false },
  // grass
  { id: 30, name: 'Vine Snap', type: 'grass', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 31, name: 'Leaf Storm', type: 'grass', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 32, name: 'Bloom Beam', type: 'grass', power: 90, acc: 95, pp: 10, status: 'poison', effChance: 15, crit: false, multi: false },
  { id: 33, name: 'Verdant Wrath', type: 'grass', power: 115, acc: 85, pp: 5, status: null, effChance: 0, crit: false, multi: false },
  // electric
  { id: 40, name: 'Spark Nip', type: 'electric', power: 40, acc: 100, pp: 25, status: 'paralyze', effChance: 10, crit: false, multi: false },
  { id: 41, name: 'Volt Arc', type: 'electric', power: 65, acc: 100, pp: 15, status: 'paralyze', effChance: 15, crit: false, multi: false },
  { id: 42, name: 'Thunder Lance', type: 'electric', power: 90, acc: 90, pp: 10, status: 'paralyze', effChance: 25, crit: false, multi: false },
  { id: 43, name: 'Storm Break', type: 'electric', power: 115, acc: 80, pp: 5, status: 'paralyze', effChance: 30, crit: false, multi: false },
  // ice
  { id: 50, name: 'Frost Bite', type: 'ice', power: 40, acc: 100, pp: 25, status: 'freeze', effChance: 5, crit: false, multi: false },
  { id: 51, name: 'Glacier Edge', type: 'ice', power: 65, acc: 100, pp: 15, status: 'freeze', effChance: 10, crit: false, multi: false },
  { id: 52, name: 'Blizzard Veil', type: 'ice', power: 90, acc: 90, pp: 10, status: 'freeze', effChance: 15, crit: false, multi: false },
  { id: 53, name: 'Permafrost', type: 'ice', power: 115, acc: 80, pp: 5, status: 'freeze', effChance: 20, crit: false, multi: false },
  // fighting
  { id: 60, name: 'Quick Kick', type: 'fighting', power: 45, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 61, name: 'Iron Fist', type: 'fighting', power: 70, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 62, name: 'Crushing Blow', type: 'fighting', power: 95, acc: 90, pp: 10, status: null, effChance: 0, crit: true, multi: false },
  { id: 63, name: 'Titan Strike', type: 'fighting', power: 120, acc: 80, pp: 5, status: null, effChance: 0, crit: false, multi: false },
  // poison
  { id: 70, name: 'Venom Sting', type: 'poison', power: 40, acc: 100, pp: 25, status: 'poison', effChance: 20, crit: false, multi: false },
  { id: 71, name: 'Toxic Spray', type: 'poison', power: 65, acc: 100, pp: 15, status: 'poison', effChance: 30, crit: false, multi: false },
  { id: 72, name: 'Sludge Wave', type: 'poison', power: 90, acc: 95, pp: 10, status: 'poison', effChance: 40, crit: false, multi: false },
  // ground
  { id: 80, name: 'Mud Slap', type: 'ground', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 81, name: 'Rock Drill', type: 'ground', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 82, name: 'Quake Stomp', type: 'ground', power: 95, acc: 95, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  { id: 83, name: 'Fault Rupture', type: 'ground', power: 120, acc: 80, pp: 5, status: null, effChance: 0, crit: false, multi: false },
  // flying
  { id: 90, name: 'Wing Cut', type: 'flying', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 91, name: 'Gale Dive', type: 'flying', power: 70, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 92, name: 'Cyclone Rush', type: 'flying', power: 95, acc: 90, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  // psychic
  { id: 100, name: 'Mind Jab', type: 'psychic', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 101, name: 'Psy Pulse', type: 'psychic', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 102, name: 'Astral Beam', type: 'psychic', power: 90, acc: 95, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  { id: 103, name: 'Void Collapse', type: 'psychic', power: 115, acc: 85, pp: 5, status: null, effChance: 0, crit: false, multi: false },
  // bug
  { id: 110, name: 'Pin Nip', type: 'bug', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 111, name: 'Swarm Bite', type: 'bug', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: true },
  { id: 112, name: 'Hive Frenzy', type: 'bug', power: 90, acc: 90, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  // rock
  { id: 120, name: 'Pebble Toss', type: 'rock', power: 40, acc: 95, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 121, name: 'Boulder Hurl', type: 'rock', power: 70, acc: 90, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 122, name: 'Stone Avalanche', type: 'rock', power: 95, acc: 85, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  // ghost
  { id: 130, name: 'Shade Touch', type: 'ghost', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 131, name: 'Phantom Hex', type: 'ghost', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 132, name: 'Wraith Lance', type: 'ghost', power: 90, acc: 95, pp: 10, status: null, effChance: 0, crit: true, multi: false },
  // dragon
  { id: 140, name: 'Scale Rake', type: 'dragon', power: 50, acc: 100, pp: 20, status: null, effChance: 0, crit: false, multi: false },
  { id: 141, name: 'Dragon Pulse', type: 'dragon', power: 80, acc: 100, pp: 12, status: null, effChance: 0, crit: false, multi: false },
  { id: 142, name: 'Tempest Roar', type: 'dragon', power: 110, acc: 90, pp: 6, status: null, effChance: 0, crit: false, multi: false },
  // dark
  { id: 150, name: 'Sneak Bite', type: 'dark', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: true, multi: false },
  { id: 151, name: 'Night Slash', type: 'dark', power: 70, acc: 100, pp: 15, status: null, effChance: 0, crit: true, multi: false },
  { id: 152, name: 'Abyss Maul', type: 'dark', power: 95, acc: 90, pp: 10, status: null, effChance: 0, crit: false, multi: false },
  // steel
  { id: 160, name: 'Metal Tap', type: 'steel', power: 40, acc: 100, pp: 25, status: null, effChance: 0, crit: false, multi: false },
  { id: 161, name: 'Gear Grind', type: 'steel', power: 65, acc: 100, pp: 15, status: null, effChance: 0, crit: false, multi: false },
  { id: 162, name: 'Anvil Drop', type: 'steel', power: 95, acc: 90, pp: 10, status: null, effChance: 0, crit: false, multi: false },
];

/** attack moves grouped by type, sorted by ascending power. */
export const MOVES_BY_TYPE: Record<string, Move[]> = (() => {
  const out: Record<string, Move[]> = {};
  for (const mv of MOVES) {
    if (mv.power <= 0) continue;
    (out[mv.type] = out[mv.type] || []).push(mv);
  }
  for (const arr of Object.values(out)) arr.sort((a, b) => a.power - b.power);
  return out;
})();

const FALLBACK_MOVE: Move = {
  id: 0,
  name: 'Strike Hit',
  type: 'normal',
  power: 40,
  acc: 100,
  pp: 35,
  status: null,
  effChance: 0,
  crit: false,
  multi: false,
};

/** pick up to n moves from a pool under a level-derived power cap. */
function pickTier(arr: Move[] | undefined, n: number, level: number): Move[] {
  if (!arr || !arr.length) return [];
  const cap = level >= 40 ? 999 : level >= 28 ? 95 : level >= 16 ? 75 : 55;
  const ok = arr.filter((m) => m.power <= cap);
  const src = ok.length ? ok : arr.slice(0, 2);
  const out: Move[] = [];
  const step = Math.max(1, Math.floor(src.length / n));
  for (let i = src.length - 1, c = 0; i >= 0 && c < n; i -= step, c++) {
    out.push(src[i]);
  }
  return out;
}

/** build a 4-move set for a monster: 3 same-type plus 1 normal, level-scaled. */
export function getMonMoves(mon: {
  type: MonsterType;
  level: number;
}): Move[] {
  const type = (mon.type || 'normal') as MonsterType;
  const lv = mon.level || 5;
  const same = pickTier(MOVES_BY_TYPE[type], 3, lv);
  const norm = pickTier(MOVES_BY_TYPE['normal'], 1, lv);
  const seen = new Set<string>();
  const moves = [...same, ...norm].filter((mv) => {
    if (seen.has(mv.name)) return false;
    seen.add(mv.name);
    return true;
  });
  return moves.length ? moves.slice(0, 4) : [FALLBACK_MOVE];
}

/** AI move choice: strongest when super-effective, otherwise a mid option. */
export function pickMove(
  attacker: MonsterInstance,
  typeMod: number,
): Move {
  if (!attacker.moves) attacker.moves = getMonMoves(attacker);
  const pool = attacker.moves.slice().sort((a, b) => b.power - a.power);
  const idx = typeMod >= 2 ? 0 : Math.min(1, pool.length - 1);
  return pool[idx] || pool[0] || FALLBACK_MOVE;
}
