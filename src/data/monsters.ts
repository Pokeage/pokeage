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
