/* pokeAge engine: wild encounter generation.
   Rolls the rare pool first (lower odds in legendary zones), then falls back to
   the common pool. Rares and legendaries spawn a few levels above the route
   band. Optional shop buffs widen the rare/legend odds. */

import {
  RARE_ZONE_CHANCE,
  LEGEND_ZONE_CHANCE,
} from './constants';
import { createMonsterInstance } from './stats';
import { defaultRng, Rng } from './rng';
import type { MonsterInstance, MonsterTemplate, Route } from './types';

type TemplateResolver = (id: number) => MonsterTemplate | undefined;

export interface EncounterBuffs {
  /** multiplier on the rare-pool roll. */
  rare?: number;
  /** multiplier on the legendary-pool roll. */
  legend?: number;
}

/** generate a wild monster for a route, or null if the pool is empty. */
export function generateWildMonster(
  route: Route,
  getTemplate: TemplateResolver,
  rng: Rng = defaultRng,
  buffs: EncounterBuffs = {},
): MonsterInstance | null {
  let monId: number | undefined;
  let isRare = false;

  if (route.rarePool && route.rarePool.length > 0) {
    const sampleTpl = getTemplate(route.rarePool[0]);
    const hasLegendary = !!(sampleTpl && sampleTpl.rarity === 'legendary');
    let poolChance = hasLegendary ? LEGEND_ZONE_CHANCE : RARE_ZONE_CHANCE;
    poolChance *= hasLegendary ? buffs.legend ?? 1 : buffs.rare ?? 1;

    if (rng.chance(poolChance)) {
      monId = rng.pick(route.rarePool);
      isRare = true;
    } else {
      monId = rng.pick(route.wildPool);
    }
  } else {
    monId = rng.pick(route.wildPool);
  }

  if (monId == null) return null;
  const template = getTemplate(monId);
  if (!template) return null;

  let level: number;
  if (isRare) {
    level = route.levelRange[1] + rng.int(0, 4) + 3;
  } else {
    level = rng.int(route.levelRange[0], route.levelRange[1]);
  }

  const mon = createMonsterInstance(template, level);
  mon.rarity = template.rarity || 'common';
  return mon;
}
