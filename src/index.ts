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
