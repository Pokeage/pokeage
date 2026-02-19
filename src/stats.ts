/* pokeAge engine: stat scaling and instance creation.
   The owned-instance model interpolates base -> Lv50 target linearly, matching
   the live engine's grantXp recalculation. statAtLevel is the GSC-style formula
   kept for ad-hoc combatants built straight from a species template. */

import { GROWTH_SPAN } from './constants';
import type { MonsterInstance, MonsterTemplate, Stats } from './types';

/** GSC-style per-level stat. HP gets the +L+10 bonus, others +5. */
export function statAtLevel(base: number, level: number, isHP = false): number {
  const b = Math.max(1, base || 1);
  const L = Math.max(1, level || 1);
  const core = Math.floor((2 * b * L) / 100);
  return isHP ? core + L + 10 : core + 5;
}

/** linear interpolation of one stat from base toward the Lv50 target. */
export function interpStat(
  base: number,
  target: number,
  level: number,
): number {
  const t = Math.min(1, Math.max(0, (level - 1) / GROWTH_SPAN));
  return Math.floor(base + (target - base) * t);
}

/** the Lv50 stat targets for a species: stage2 if present, else stage1, else base. */
export function targetStatsFor(template: MonsterTemplate): Stats {
  return template.stage2 || template.stage1 || template.base;
}

/** full stat block at a level using the interpolation model. */
export function statsAtLevel(template: MonsterTemplate, level: number): Stats {
  const target = targetStatsFor(template);
  return {
    hp: interpStat(template.base.hp, target.hp, level),
    atk: interpStat(template.base.atk, target.atk, level),
    def: interpStat(template.base.def, target.def, level),
    spd: interpStat(template.base.spd, target.spd, level),
  };
}

/** evolution stage a species should be at for a given level. */
export function stageForLevel(template: MonsterTemplate, level: number): number {
  if (template.ev2 && level >= template.ev2) return 2;
  if (template.ev1 && level >= template.ev1) return 1;
  return 0;
}

/** build a fresh, full-HP instance of a species at a level. */
export function createMonsterInstance(
  template: MonsterTemplate,
  level: number,
): MonsterInstance {
  const stats = statsAtLevel(template, level);
  return {
    templateId: template.id,
    name: template.name,
    type: template.type,
    asset: template.asset,
    level,
    xp: 0,
    stage: stageForLevel(template, level),
    stats,
    currentHP: stats.hp,
    targetStats: targetStatsFor(template),
    ev1: template.ev1 ?? null,
    ev2: template.ev2 ?? null,
    rarity: template.rarity,
    rarityTier: template.rarityTier,
    affection: 0,
  };
}

/** quick combatant built from a template at a level (GSC stat model). */
export function makeCombatant(
  template: MonsterTemplate,
  level: number,
): MonsterInstance {
  const stats: Stats = {
    hp: statAtLevel(template.base.hp, level, true),
    atk: statAtLevel(template.base.atk, level),
    def: statAtLevel(template.base.def, level),
    spd: statAtLevel(template.base.spd, level),
  };
  return {
    templateId: template.id,
    name: template.name,
    type: template.type,
    asset: template.asset,
    level,
    xp: 0,
    stage: stageForLevel(template, level),
    stats,
    currentHP: stats.hp,
    targetStats: targetStatsFor(template),
    ev1: template.ev1 ?? null,
    ev2: template.ev2 ?? null,
    rarity: template.rarity,
    rarityTier: template.rarityTier,
    affection: 0,
  };
}
