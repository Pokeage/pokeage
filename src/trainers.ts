/* pokeAge engine: opponent generation.
   Builds deterministic AI trainers with level-scaled teams drawn from a roster.
   Mirrors how the live game seeds a field of rival trainers. Same seed and
   inputs always produce the same roster. */

import { createMonsterInstance } from './stats';
import { getTrainerPower } from './power';
import { defaultRng, Rng } from './rng';
import type { Registry } from './data/monsters';
import type { MonsterInstance, Trainer } from './types';

export interface OpponentOptions {
  /** team size, default 3. */
  teamSize?: number;
  /** level spread around the target level, default 2. */
  levelSpread?: number;
  /** exclude legendaries from the pool, default true. */
  excludeLegendary?: boolean;
}

const NAME_PREFIX = [
  'RIVAL',
  'ACE',
  'ROOKIE',
  'VETERAN',
  'RANGER',
  'NOMAD',
  'WARDEN',
  'SCOUT',
];

/** pick a level-scaled team from the roster. */
function buildTeam(
  registry: Registry,
  level: number,
  opts: OpponentOptions,
  rng: Rng,
): MonsterInstance[] {
  const size = opts.teamSize ?? 3;
  const spread = opts.levelSpread ?? 2;
  const exclude = opts.excludeLegendary ?? true;
  const pool = registry
    .all()
    .filter((m) => (exclude ? m.rarity !== 'legendary' : true));
  if (!pool.length) return [];

  const team: MonsterInstance[] = [];
  const used = new Set<number>();
  let guard = 0;
  while (team.length < size && guard++ < size * 8) {
    const tpl = rng.pick(pool);
    if (used.has(tpl.id)) continue;
    used.add(tpl.id);
    const lv = Math.max(2, level + rng.int(-spread, spread));
    team.push(createMonsterInstance(tpl, lv));
  }
  return team;
}

/** generate one AI trainer scaled to a target level. */
export function generateOpponent(
  index: number,
  level: number,
  registry: Registry,
  rng: Rng = defaultRng,
  opts: OpponentOptions = {},
): Trainer {
  const prefix = NAME_PREFIX[index % NAME_PREFIX.length];
  const team = buildTeam(registry, level, opts, rng);
  return {
    id: `ai-${index}`,
    name: `${prefix} ${index + 1}`,
    team,
    box: [],
    badges: [],
    location: 'seedling',
    items: { ball: 0 },
    totalBattles: 0,
    totalCaught: 0,
    strategy: {},
  };
}

/** generate a field of opponents, sorted by combat power descending. */
export function generateOpponents(
  count: number,
  level: number,
  registry: Registry,
  rng: Rng = defaultRng,
  opts: OpponentOptions = {},
): Trainer[] {
  const out: Trainer[] = [];
  for (let i = 0; i < count; i++) {
    out.push(generateOpponent(i, level, registry, rng, opts));
  }
  return out.sort((a, b) => getTrainerPower(b) - getTrainerPower(a));
}
