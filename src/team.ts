/* pokeAge engine: team and box placement.
   A caught monster fills the party first, then the box. When both are full it
   replaces the weakest member only if the newcomer is stronger. */

import { PARTY_SIZE, BOX_SIZE, SAME_TYPE_LIMIT } from './constants';
import { getMonsterPower } from './power';
import type { MonsterInstance, Trainer } from './types';

export interface PlacementResult {
  placed: boolean;
  where: 'party' | 'box' | 'none';
  released?: MonsterInstance;
}

/** place a newly caught monster, releasing the weakest if the roster is full. */
export function placeNewMonster(
  trainer: Trainer,
  newMon: MonsterInstance,
): PlacementResult {
  trainer.box = trainer.box || [];

  if (trainer.team.length < PARTY_SIZE) {
    trainer.team.push(newMon);
    return { placed: true, where: 'party' };
  }

  if (trainer.box.length < BOX_SIZE) {
    trainer.box.push(newMon);
    return { placed: true, where: 'box' };
  }

  const all = [...trainer.team, ...trainer.box];
  const newPower = getMonsterPower(newMon);
  let weakIdx = 0;
  let weakPower = getMonsterPower(all[0]);
  all.forEach((m, i) => {
    const p = getMonsterPower(m);
    if (p < weakPower) {
      weakPower = p;
      weakIdx = i;
    }
  });

  if (newPower <= weakPower) {
    return { placed: false, where: 'none' };
  }

  if (weakIdx < trainer.team.length) {
    const released = trainer.team.splice(weakIdx, 1)[0];
    trainer.team.push(newMon);
    return { placed: true, where: 'party', released };
  }
  const boxIdx = weakIdx - trainer.team.length;
  const released = trainer.box.splice(boxIdx, 1)[0];
  trainer.box.push(newMon);
  return { placed: true, where: 'box', released };
}

/** whether a wild should be caught given roster, duplicates, and type slots. */
export function shouldCatch(
  trainer: Trainer,
  wild: MonsterInstance,
): boolean {
  const strat = trainer.strategy || {};
  if (strat.catchEnabled === false) return false;
  if ((trainer.items.ball || 0) <= 0) return false;

  const isRareOrLegend =
    wild.rarity === 'rare' || wild.rarity === 'legendary';
  const rareOverride = isRareOrLegend && strat.prioritizeRare !== false;

  const typeAllowed =
    !strat.catchTypes || strat.catchTypes[wild.type] !== false;
  const sameTypeCount = trainer.team.filter((m) => m.type === wild.type).length;
  const typeSlotOpen = sameTypeCount < SAME_TYPE_LIMIT;

  const hasDup =
    trainer.team.some((m) => m.templateId === wild.templateId) ||
    (trainer.box || []).some((m) => m.templateId === wild.templateId);
  if (hasDup) return false;

  const all = [...trainer.team, ...(trainer.box || [])];
  const newPower = getMonsterPower(wild);
  const weakest = all.length
    ? all.reduce((w, m) => (getMonsterPower(m) < getMonsterPower(w) ? m : w))
    : null;
  const isUpgrade = !weakest || newPower > getMonsterPower(weakest);
  const rosterHasRoom = all.length < PARTY_SIZE + BOX_SIZE;

  if (!(rareOverride || (typeAllowed && typeSlotOpen))) return false;
  return rosterHasRoom || isUpgrade;
}
