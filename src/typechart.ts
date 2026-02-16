/* pokeAge engine: type effectiveness.
   Ported verbatim from the live engine's TYPE_EFFECTIVENESS / TYPE_IMMUNE so
   matchups are identical. strong: x2, weak: x0.5, immune: x0, otherwise x1. */

import type { MonsterType } from './types';

interface TypeRow {
  strong: MonsterType[];
  weak: MonsterType[];
}

export const TYPE_EFFECTIVENESS: Record<MonsterType, TypeRow> = {
  fire: {
    strong: ['grass', 'bug', 'ice', 'steel'],
    weak: ['water', 'rock', 'ground', 'fire', 'dragon'],
  },
  water: {
    strong: ['fire', 'rock', 'ground'],
    weak: ['water', 'grass', 'electric', 'dragon'],
  },
  grass: {
    strong: ['water', 'rock', 'ground'],
    weak: ['fire', 'grass', 'flying', 'bug', 'poison', 'dragon', 'steel'],
  },
  electric: {
    strong: ['water', 'flying'],
    weak: ['electric', 'grass', 'ground', 'dragon'],
  },
  ice: {
    strong: ['grass', 'ground', 'flying', 'dragon'],
    weak: ['fire', 'water', 'ice', 'steel'],
  },
  dragon: { strong: ['dragon'], weak: ['steel'] },
  fighting: {
    strong: ['normal', 'rock', 'steel', 'ice', 'dark'],
    weak: ['flying', 'psychic', 'bug', 'ghost', 'poison'],
  },
  poison: {
    strong: ['grass'],
    weak: ['poison', 'ground', 'rock', 'ghost', 'steel'],
  },
  ground: {
    strong: ['fire', 'electric', 'poison', 'rock', 'steel'],
    weak: ['grass', 'flying', 'bug'],
  },
  flying: {
    strong: ['grass', 'fighting', 'bug'],
    weak: ['electric', 'rock', 'steel'],
  },
  psychic: { strong: ['fighting', 'poison'], weak: ['psychic', 'steel', 'dark'] },
  bug: {
    strong: ['grass', 'psychic', 'dark'],
    weak: ['fire', 'fighting', 'flying', 'ghost', 'poison', 'steel'],
  },
  rock: {
    strong: ['fire', 'ice', 'flying', 'bug'],
    weak: ['fighting', 'ground', 'steel', 'water', 'grass'],
  },
  ghost: { strong: ['psychic', 'ghost'], weak: ['dark', 'normal'] },
  dark: { strong: ['psychic', 'ghost'], weak: ['fighting', 'dark', 'bug'] },
  steel: {
    strong: ['ice', 'rock'],
    weak: ['fire', 'water', 'electric', 'steel'],
  },
  normal: { strong: [], weak: ['rock', 'steel', 'ghost'] },
};

/** attacker type -> defender types that take 0 damage. */
export const TYPE_IMMUNE: Partial<Record<MonsterType, MonsterType[]>> = {
  normal: ['ghost'],
  fighting: ['ghost'],
  poison: ['steel'],
  ground: ['flying'],
  electric: ['ground'],
  psychic: ['dark'],
  ghost: ['normal'],
};

/** effectiveness multiplier of atkType vs defType. */
export function getTypeMultiplier(
  atkType: MonsterType,
  defType: MonsterType,
): number {
  const imm = TYPE_IMMUNE[atkType];
  if (imm && imm.includes(defType)) return 0;
  const row = TYPE_EFFECTIVENESS[atkType];
  if (!row) return 1;
  if (row.strong.includes(defType)) return 2.0;
  if (row.weak.includes(defType)) return 0.5;
  return 1;
}

/** human label for an effectiveness multiplier, or null for neutral. */
export function effectivenessLabel(typeMod: number): string | null {
  if (typeMod === 0) return 'NO EFFECT';
  if (typeMod >= 2) return 'SUPER EFFECTIVE';
  if (typeMod <= 0.5) return 'not very effective';
  return null;
}
