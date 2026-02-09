/* pokeAge engine: shared types.
   Ported from the live game engine (agent-engine.js + the battle core in game.js)
   into a typed, deterministic, framework-free form. */

/** The 17 elemental types used by the type chart and STAB. */
export type MonsterType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel';

/** Coarse spawn/catch rarity used by encounter rolls and catch rates. */
export type Rarity = 'common' | 'rare' | 'legendary';

/** Market/card tier (6 bands). Drives NFT mint cost and price multipliers. */
export type RarityTier =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'holo'
  | 'ultra'
  | 'secret';

/** Core stat block. spd doubles as the speed stat that decides turn order. */
export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

/** A species definition. Stages 1/2 are the evolved stat targets; ev1/ev2 are
 *  the levels at which the species evolves. Legendaries leave ev1/ev2 null. */
export interface MonsterTemplate {
  id: number;
  name: string;
  /** original-language label, kept for parity with the game data. */
  korean?: string;
  type: MonsterType;
  /** asset folder key (sprite/card lookup). */
  asset: string;
  base: Stats;
  stage1?: Stats;
  stage2?: Stats;
  /** level the base form evolves to stage 1 (null/undefined: never). */
  ev1?: number | null;
  /** level stage 1 evolves to stage 2. */
  ev2?: number | null;
  /** per-stage asset folders so an evolved instance resolves the right sprite. */
  evoStageAssets?: string[];
  /** species ids making up the full evolution line, base first. */
  fullLine?: number[];
  rarity?: Rarity;
  rarityTier?: RarityTier;
  heightM?: number;
}

/** A concrete owned/encountered monster instance with live HP and progress. */
export interface MonsterInstance {
  templateId: number;
  name: string;
  type: MonsterType;
  asset: string;
  level: number;
  xp: number;
  /** evolution stage relative to the base species (0..2). */
  stage: number;
