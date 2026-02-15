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
