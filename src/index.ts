/* pokeAge engine: public entry point.
   A deterministic, framework-free monster-RPG simulation engine: type chart,
   damage, leveling, evolution, wild encounters, battles, catching, and offline
   progression. Bring your own roster, or use the bundled sample data. */

export * from './types';
export * from './constants';
export { Rng, defaultRng, rngFromString } from './rng';
export {
  TYPE_EFFECTIVENESS,
  TYPE_IMMUNE,
  getTypeMultiplier,
  effectivenessLabel,
} from './typechart';
export { MOVES, MOVES_BY_TYPE, getMonMoves, pickMove } from './moves';
export { calcDamage, calcDamageSimple, DamageRoll } from './damage';
export {
  statAtLevel,
  interpStat,
  targetStatsFor,
  statsAtLevel,
  stageForLevel,
  createMonsterInstance,
  makeCombatant,
} from './stats';
export {
  getXpForLevel,
  cumulativeXp,
  grantXp,
  rookieMultiplier,
  wildXpReward,
  gymXpReward,
  ProgressEvent,
} from './progression';
export { getMonsterPower, getTrainerPower, weakestOf } from './power';
export { catchRate, attemptCatch } from './catch';
export {
  affectionGainFor,
  addAffection,
  canClaimCard,
} from './affection';
export { generateWildMonster, EncounterBuffs } from './encounter';
export {
  simulateBattle,
  simulateAuto,
  simulateGym,
  GymResult,
} from './battle';
export { placeNewMonster, shouldCatch, PlacementResult } from './team';
export { Engine, World, EngineOptions } from './engine';
export {
  runOfflineCatchup,
  formatOfflineSummary,
  OfflineSummary,
} from './offline';
export {
  levelMultiplier,
  stageMultiplier,
  cardPriceSol,
  mintFeeLamports,
  instantSellQuote,
  tierFromCode,
  tierToCode,
} from './pricing';
export { newTrainer, giveMonster, NewTrainerOptions } from './factory';
export {
  saveTrainer,
  loadTrainer,
  serializeTrainer,
  deserializeTrainer,
  SAVE_VERSION,
  SavedGame,
} from './save';
export {
  generateOpponent,
  generateOpponents,
  OpponentOptions,
} from './trainers';
export {
  analyzeTeam,
  analyzeTrainer,
  offensiveCoverage,
  sharedWeaknesses,
  TeamReport,
} from './analytics';
export {
  applyStatusTick,
  isDamaging,
  isDisabling,
  STATUS_DOT,
  STATUS_SKIP_CHANCE,
  STATUS_CLEAR_CHANCE,
  StatusKind,
  StatusTick,
} from './status';
export { runBatch, BatchReport } from './balance';

// bundled sample data
export {
  SAMPLE_MONSTERS,
  createRegistry,
  sampleRegistry,
  STARTER_IDS,
  Registry,
} from './data/monsters';
export { TOWNS, ROUTES, WORLD } from './data/world';
