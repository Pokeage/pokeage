/* pokeAge engine: team analysis.
   Derives offensive type coverage, shared weaknesses, average level, and total
   CP for a team. Useful for the UI team builder and for opponent balancing. */

import { getTypeMultiplier } from './typechart';
import { getMonsterPower } from './power';
import type { MonsterInstance, MonsterType, Trainer } from './types';

const ALL_TYPES: MonsterType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel',
];

export interface TeamReport {
  size: number;
  averageLevel: number;
  totalPower: number;
  /** defender types the team can hit for super-effective damage. */
  offensiveCoverage: MonsterType[];
  /** attacker types every team member is weak to (shared blind spots). */
  sharedWeaknesses: MonsterType[];
}

/** defender types this team hits super-effectively with at least one member. */
export function offensiveCoverage(team: MonsterInstance[]): MonsterType[] {
  const covered = new Set<MonsterType>();
  for (const def of ALL_TYPES) {
    if (team.some((m) => getTypeMultiplier(m.type, def) >= 2)) covered.add(def);
  }
  return [...covered];
}

/** attacker types that are super-effective against every team member. */
export function sharedWeaknesses(team: MonsterInstance[]): MonsterType[] {
  if (!team.length) return [];
  return ALL_TYPES.filter((atk) =>
    team.every((m) => getTypeMultiplier(atk, m.type) >= 2),
  );
}

/** full team report. */
export function analyzeTeam(team: MonsterInstance[]): TeamReport {
  const size = team.length;
  const averageLevel = size
    ? Math.round(team.reduce((s, m) => s + m.level, 0) / size)
    : 0;
  const totalPower = team.reduce((s, m) => s + getMonsterPower(m), 0);
  return {
    size,
    averageLevel,
    totalPower,
    offensiveCoverage: offensiveCoverage(team),
    sharedWeaknesses: sharedWeaknesses(team),
  };
}

/** convenience over a trainer's active party. */
export function analyzeTrainer(trainer: Trainer): TeamReport {
  return analyzeTeam(trainer.team);
}
