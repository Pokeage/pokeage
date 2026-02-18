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
