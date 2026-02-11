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
  stats: Stats;
  currentHP: number;
  /** stat targets at Lv50 used by the linear growth model. */
  targetStats: Stats;
  ev1?: number | null;
  ev2?: number | null;
  rarity?: Rarity;
  rarityTier?: RarityTier;
  /** bond/affection counter, 0..AFFECTION_MAX. */
  affection: number;
  /** cached move list for battle (filled lazily). */
  moves?: Move[];
}

/** An attacking move. power 0 means a status move (skipped by the AI picker). */
export interface Move {
  id: number;
  name: string;
  type: MonsterType;
  power: number;
  acc: number;
  pp: number;
  status: string | null;
  effChance: number;
  crit: boolean;
  multi: boolean;
}

/** One resolved action inside a battle, enough to drive a UI replay. */
export interface BattleEvent {
  who: 'me' | 'foe';
  atkName: string;
  move: string;
  moveType?: MonsterType;
  dmg: number;
  typeMod: number;
  crit?: boolean;
  miss?: boolean;
  status?: string | null;
  myHP: number;
  foeHP: number;
}

/** Outcome of a single 1v1 fight. */
export interface BattleResult {
  won: boolean;
  myHP: number;
  foeHP: number;
  turnsUsed: number;
  events: BattleEvent[];
}

/** A gym leader and the badge it grants. */
export interface Gym {
  leader: string;
  type: MonsterType;
  badge: string;
  team: GymEntry[];
  /** gym ordering, used to gate progression. */
  order: number;
}

export interface GymEntry {
  monsterId: number;
  level: number;
}

/** A town node: optional gym, the routes it exposes, and the next node. */
export interface Town {
  id: string;
  name: string;
  desc?: string;
  gym?: Gym;
  routes: string[];
  nextTown: string | null;
  /** badge required to enter (null for the starting town). */
  requiredBadge: string | null;
  /** whether a heal center is available here. */
  center?: boolean;
}

/** A wild route: encounter pool, rare pool, level band, and encounter rate. */
export interface Route {
  id: string;
  name: string;
  levelRange: [number, number];
  wildPool: number[];
  rarePool: number[];
  encounterRate: number;
}

/** A trainer: the player or an AI opponent. */
export interface Trainer {
  id: string;
  name: string;
  team: MonsterInstance[];
  box: MonsterInstance[];
  badges: string[];
  location: string;
  items: TrainerItems;
  totalBattles: number;
  totalCaught: number;
  strategy?: Strategy;
}

/** Consumable counts. ball is the basic catch item. */
export interface TrainerItems {
  ball: number;
  [key: string]: number;
}

/** Autonomous-loop tuning flags. All optional, all default to "on". */
export interface Strategy {
  autoHeal?: boolean;
  autoGym?: boolean;
  autoMove?: boolean;
  catchEnabled?: boolean;
  prioritizeRare?: boolean;
  catchTypes?: Partial<Record<MonsterType, boolean>>;
}

/** Result of a wild-encounter step (used by the engine tick). */
export interface EncounterResult {
  encountered: boolean;
  wild?: MonsterInstance;
  won?: boolean;
  caught?: boolean;
  xpGained?: number;
  events: BattleEvent[];
  log: string[];
}

/** Result of one catch throw. */
export interface CatchResult {
  caught: boolean;
  ballsUsed: number;
  rate: number;
}

/** What a single engine tick produced, for telemetry and replay. */
export interface TickResult {
  state: AgentState;
  action:
    | 'hunt'
    | 'gym'
    | 'move'
    | 'heal'
    | 'idle'
    | 'caught'
    | 'evolve'
    | 'levelup';
  detail?: string;
  encounter?: EncounterResult;
}

export type AgentState =
  | 'idle'
  | 'hunting'
  | 'battling'
  | 'gym'
  | 'moving'
  | 'healing';
