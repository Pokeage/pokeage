/* pokeAge sample roster.
   These are original demo species (no trademarked names) used so the engine runs
   out of the box and the tests are reproducible. The engine is data-driven:
   ship your own roster by passing a different registry to createRegistry. Stats
   follow base -> stage1 -> stage2 growth; ev1/ev2 are the evolution levels.
   Legendaries leave ev1/ev2 null and never evolve. */

import type { MonsterTemplate } from '../types';

export const SAMPLE_MONSTERS: MonsterTemplate[] = [
  // ── grass starter line ──
  { id: 1, name: 'Sprigthorn', type: 'grass', asset: 'sprigthorn',
    base: { hp: 45, atk: 49, def: 49, spd: 45 }, stage1: { hp: 60, atk: 62, def: 63, spd: 60 }, stage2: { hp: 80, atk: 82, def: 83, spd: 80 },
    ev1: 16, ev2: 32, evoStageAssets: ['sprigthorn', 'thornmaw', 'verdrake'], fullLine: [1, 2, 3], rarity: 'common', rarityTier: 'uncommon' },
  { id: 2, name: 'Thornmaw', type: 'grass', asset: 'thornmaw',
    base: { hp: 60, atk: 62, def: 63, spd: 60 }, stage2: { hp: 80, atk: 82, def: 83, spd: 80 },
    ev2: 32, evoStageAssets: ['thornmaw', 'verdrake'], fullLine: [1, 2, 3], rarity: 'common', rarityTier: 'rare' },
  { id: 3, name: 'Verdrake', type: 'grass', asset: 'verdrake',
    base: { hp: 80, atk: 82, def: 83, spd: 80 }, fullLine: [1, 2, 3], rarity: 'rare', rarityTier: 'holo' },
  // ── fire starter line ──
  { id: 4, name: 'Cindercub', type: 'fire', asset: 'cindercub',
    base: { hp: 39, atk: 52, def: 43, spd: 65 }, stage1: { hp: 58, atk: 64, def: 58, spd: 80 }, stage2: { hp: 78, atk: 84, def: 78, spd: 100 },
    ev1: 16, ev2: 32, evoStageAssets: ['cindercub', 'blazepaw', 'pyrothane'], fullLine: [4, 5, 6], rarity: 'common', rarityTier: 'uncommon' },
  { id: 5, name: 'Blazepaw', type: 'fire', asset: 'blazepaw',
    base: { hp: 58, atk: 64, def: 58, spd: 80 }, stage2: { hp: 78, atk: 84, def: 78, spd: 100 },
    ev2: 32, evoStageAssets: ['blazepaw', 'pyrothane'], fullLine: [4, 5, 6], rarity: 'common', rarityTier: 'rare' },
  { id: 6, name: 'Pyrothane', type: 'fire', asset: 'pyrothane',
    base: { hp: 78, atk: 84, def: 78, spd: 100 }, fullLine: [4, 5, 6], rarity: 'rare', rarityTier: 'holo' },
  // ── water starter line ──
  { id: 7, name: 'Drizzlefin', type: 'water', asset: 'drizzlefin',
    base: { hp: 44, atk: 48, def: 65, spd: 43 }, stage1: { hp: 59, atk: 63, def: 80, spd: 58 }, stage2: { hp: 79, atk: 83, def: 100, spd: 78 },
    ev1: 16, ev2: 32, evoStageAssets: ['drizzlefin', 'tidewhisk', 'maeltide'], fullLine: [7, 8, 9], rarity: 'common', rarityTier: 'uncommon' },
  { id: 8, name: 'Tidewhisk', type: 'water', asset: 'tidewhisk',
    base: { hp: 59, atk: 63, def: 80, spd: 58 }, stage2: { hp: 79, atk: 83, def: 100, spd: 78 },
    ev2: 32, evoStageAssets: ['tidewhisk', 'maeltide'], fullLine: [7, 8, 9], rarity: 'common', rarityTier: 'rare' },
  { id: 9, name: 'Maeltide', type: 'water', asset: 'maeltide',
    base: { hp: 79, atk: 83, def: 100, spd: 78 }, fullLine: [7, 8, 9], rarity: 'rare', rarityTier: 'holo' },
  // ── electric two-stage ──
  { id: 10, name: 'Sparkit', type: 'electric', asset: 'sparkit',
    base: { hp: 35, atk: 45, def: 40, spd: 70 }, stage1: { hp: 55, atk: 70, def: 55, spd: 100 },
    ev1: 22, evoStageAssets: ['sparkit', 'voltyx'], fullLine: [10, 11], rarity: 'common', rarityTier: 'common' },
  { id: 11, name: 'Voltyx', type: 'electric', asset: 'voltyx',
    base: { hp: 55, atk: 70, def: 55, spd: 100 }, fullLine: [10, 11], rarity: 'common', rarityTier: 'uncommon' },
  // ── rock two-stage ──
  { id: 12, name: 'Pebblet', type: 'rock', asset: 'pebblet',
    base: { hp: 50, atk: 55, def: 80, spd: 25 }, stage1: { hp: 70, atk: 75, def: 110, spd: 40 },
    ev1: 24, evoStageAssets: ['pebblet', 'boulderon'], fullLine: [12, 13], rarity: 'common', rarityTier: 'common' },
  { id: 13, name: 'Boulderon', type: 'rock', asset: 'boulderon',
    base: { hp: 70, atk: 75, def: 110, spd: 40 }, fullLine: [12, 13], rarity: 'common', rarityTier: 'uncommon' },
  // ── ice two-stage ──
  { id: 14, name: 'Frostnip', type: 'ice', asset: 'frostnip',
    base: { hp: 50, atk: 50, def: 50, spd: 50 }, stage1: { hp: 75, atk: 70, def: 70, spd: 70 },
    ev1: 28, evoStageAssets: ['frostnip', 'glacialox'], fullLine: [14, 15], rarity: 'common', rarityTier: 'common' },
  { id: 15, name: 'Glacialox', type: 'ice', asset: 'glacialox',
    base: { hp: 75, atk: 70, def: 70, spd: 70 }, fullLine: [14, 15], rarity: 'common', rarityTier: 'uncommon' },
  // ── bug two-stage ──
  { id: 16, name: 'Mothlet', type: 'bug', asset: 'mothlet',
    base: { hp: 40, atk: 35, def: 30, spd: 50 }, stage1: { hp: 60, atk: 55, def: 50, spd: 75 },
    ev1: 12, evoStageAssets: ['mothlet', 'dustwing'], fullLine: [16, 17], rarity: 'common', rarityTier: 'common' },
  { id: 17, name: 'Dustwing', type: 'bug', asset: 'dustwing',
    base: { hp: 60, atk: 55, def: 50, spd: 75 }, fullLine: [16, 17], rarity: 'common', rarityTier: 'common' },
  // ── poison two-stage ──
  { id: 18, name: 'Sludgeling', type: 'poison', asset: 'sludgeling',
    base: { hp: 55, atk: 50, def: 48, spd: 42 }, stage1: { hp: 80, atk: 72, def: 68, spd: 58 },
    ev1: 24, evoStageAssets: ['sludgeling', 'toxiboar'], fullLine: [18, 19], rarity: 'common', rarityTier: 'common' },
  { id: 19, name: 'Toxiboar', type: 'poison', asset: 'toxiboar',
    base: { hp: 80, atk: 72, def: 68, spd: 58 }, fullLine: [18, 19], rarity: 'common', rarityTier: 'uncommon' },
  // ── ghost two-stage ──
  { id: 20, name: 'Wispurr', type: 'ghost', asset: 'wispurr',
    base: { hp: 45, atk: 50, def: 45, spd: 65 }, stage1: { hp: 65, atk: 75, def: 65, spd: 95 },
    ev1: 26, evoStageAssets: ['wispurr', 'phantomane'], fullLine: [20, 21], rarity: 'common', rarityTier: 'uncommon' },
  { id: 21, name: 'Phantomane', type: 'ghost', asset: 'phantomane',
    base: { hp: 65, atk: 75, def: 65, spd: 95 }, fullLine: [20, 21], rarity: 'rare', rarityTier: 'rare' },
  // ── flying two-stage ──
  { id: 22, name: 'Hatchick', type: 'flying', asset: 'hatchick',
    base: { hp: 40, atk: 45, def: 40, spd: 56 }, stage1: { hp: 65, atk: 70, def: 60, spd: 90 },
    ev1: 18, evoStageAssets: ['hatchick', 'skyroost'], fullLine: [22, 23], rarity: 'common', rarityTier: 'common' },
  { id: 23, name: 'Skyroost', type: 'flying', asset: 'skyroost',
    base: { hp: 65, atk: 70, def: 60, spd: 90 }, fullLine: [22, 23], rarity: 'common', rarityTier: 'uncommon' },
  // ── single-stage species ──
  { id: 24, name: 'Gritmole', type: 'ground', asset: 'gritmole',
    base: { hp: 60, atk: 80, def: 60, spd: 55 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 25, name: 'Mindkit', type: 'psychic', asset: 'mindkit',
    base: { hp: 55, atk: 70, def: 55, spd: 80 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 26, name: 'Jabette', type: 'fighting', asset: 'jabette',
    base: { hp: 65, atk: 85, def: 60, spd: 60 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 27, name: 'Ironhide', type: 'steel', asset: 'ironhide',
    base: { hp: 70, atk: 70, def: 95, spd: 40 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 28, name: 'Dapplefawn', type: 'normal', asset: 'dapplefawn',
    base: { hp: 55, atk: 55, def: 50, spd: 60 }, rarity: 'common', rarityTier: 'common' },
  { id: 29, name: 'Bramblepup', type: 'grass', asset: 'bramblepup',
    base: { hp: 50, atk: 60, def: 48, spd: 58 }, rarity: 'common', rarityTier: 'common' },
  { id: 30, name: 'Tideling', type: 'water', asset: 'tideling',
    base: { hp: 50, atk: 50, def: 55, spd: 55 }, rarity: 'common', rarityTier: 'common' },
  // ── extra two-stage lines ──
  { id: 31, name: 'Cobblepup', type: 'ground', asset: 'cobblepup',
    base: { hp: 55, atk: 65, def: 55, spd: 50 }, stage1: { hp: 80, atk: 95, def: 80, spd: 65 },
    ev1: 25, evoStageAssets: ['cobblepup', 'terradon'], fullLine: [31, 32], rarity: 'common', rarityTier: 'common' },
  { id: 32, name: 'Terradon', type: 'ground', asset: 'terradon',
    base: { hp: 80, atk: 95, def: 80, spd: 65 }, fullLine: [31, 32], rarity: 'common', rarityTier: 'uncommon' },
  { id: 33, name: 'Sparrowkit', type: 'flying', asset: 'sparrowkit',
    base: { hp: 42, atk: 50, def: 42, spd: 70 }, stage1: { hp: 62, atk: 75, def: 60, spd: 100 },
    ev1: 20, evoStageAssets: ['sparrowkit', 'galehawk'], fullLine: [33, 34], rarity: 'common', rarityTier: 'common' },
  { id: 34, name: 'Galehawk', type: 'flying', asset: 'galehawk',
    base: { hp: 62, atk: 75, def: 60, spd: 100 }, fullLine: [33, 34], rarity: 'common', rarityTier: 'uncommon' },
  { id: 35, name: 'Emberling', type: 'fire', asset: 'emberling',
    base: { hp: 48, atk: 58, def: 44, spd: 62 }, stage1: { hp: 72, atk: 86, def: 64, spd: 88 },
    ev1: 26, evoStageAssets: ['emberling', 'magnaroar'], fullLine: [35, 36], rarity: 'common', rarityTier: 'uncommon' },
  { id: 36, name: 'Magnaroar', type: 'fire', asset: 'magnaroar',
    base: { hp: 72, atk: 86, def: 64, spd: 88 }, fullLine: [35, 36], rarity: 'rare', rarityTier: 'rare' },
  { id: 37, name: 'Ripplet', type: 'water', asset: 'ripplet',
    base: { hp: 52, atk: 48, def: 58, spd: 50 }, stage1: { hp: 78, atk: 70, def: 84, spd: 66 },
    ev1: 24, evoStageAssets: ['ripplet', 'aquadon'], fullLine: [37, 38], rarity: 'common', rarityTier: 'common' },
  { id: 38, name: 'Aquadon', type: 'water', asset: 'aquadon',
    base: { hp: 78, atk: 70, def: 84, spd: 66 }, fullLine: [37, 38], rarity: 'common', rarityTier: 'uncommon' },
  { id: 39, name: 'Cinderfox', type: 'fire', asset: 'cinderfox',
    base: { hp: 46, atk: 60, def: 44, spd: 72 }, rarity: 'common', rarityTier: 'uncommon' },
  // ── extra single-stage species ──
  { id: 43, name: 'Boltpup', type: 'electric', asset: 'boltpup',
    base: { hp: 48, atk: 58, def: 46, spd: 78 }, rarity: 'common', rarityTier: 'common' },
  { id: 44, name: 'Spinekoi', type: 'water', asset: 'spinekoi',
    base: { hp: 54, atk: 52, def: 60, spd: 48 }, rarity: 'common', rarityTier: 'common' },
  { id: 45, name: 'Glimmernewt', type: 'psychic', asset: 'glimmernewt',
    base: { hp: 50, atk: 72, def: 50, spd: 76 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 46, name: 'Thornhog', type: 'grass', asset: 'thornhog',
    base: { hp: 62, atk: 64, def: 66, spd: 44 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 47, name: 'Cragmaw', type: 'rock', asset: 'cragmaw',
    base: { hp: 64, atk: 78, def: 88, spd: 36 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 48, name: 'Frostkit', type: 'ice', asset: 'frostkit',
    base: { hp: 50, atk: 54, def: 52, spd: 58 }, rarity: 'common', rarityTier: 'common' },
  { id: 49, name: 'Shadeling', type: 'dark', asset: 'shadeling',
    base: { hp: 52, atk: 70, def: 50, spd: 72 }, rarity: 'common', rarityTier: 'uncommon' },
  { id: 50, name: 'Mossback', type: 'bug', asset: 'mossback',
    base: { hp: 58, atk: 56, def: 62, spd: 46 }, rarity: 'common', rarityTier: 'common' },
  // ── legendaries (no evolution) ──
  { id: 40, name: 'Voltaire', type: 'electric', asset: 'voltaire',
    base: { hp: 90, atk: 110, def: 85, spd: 130 }, rarity: 'legendary', rarityTier: 'secret' },
  { id: 41, name: 'Terravorg', type: 'dragon', asset: 'terravorg',
    base: { hp: 100, atk: 130, def: 110, spd: 90 }, rarity: 'legendary', rarityTier: 'secret' },
  { id: 42, name: 'Umbroth', type: 'dark', asset: 'umbroth',
    base: { hp: 95, atk: 115, def: 95, spd: 105 }, rarity: 'legendary', rarityTier: 'secret' },
];

export interface Registry {
  getMonsterById: (id: number) => MonsterTemplate | undefined;
  all: () => MonsterTemplate[];
}

/** build an id-indexed registry from a roster (defaults to the sample set). */
export function createRegistry(
  roster: MonsterTemplate[] = SAMPLE_MONSTERS,
): Registry {
  const index = new Map<number, MonsterTemplate>();
  for (const m of roster) index.set(m.id, m);
  return {
    getMonsterById: (id) => index.get(id),
    all: () => roster,
  };
}

/** default registry over the sample roster. */
export const sampleRegistry = createRegistry();

/** the three starter base species. */
export const STARTER_IDS = [1, 4, 7];
