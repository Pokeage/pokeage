/* pokeAge engine: battle simulation.
   simulateBattle runs the full live model (moves, accuracy, STAB, crit, status,
   per-hit cap) and returns a turn-by-turn event log for replay. simulateAuto is
   the lightweight loop used by offline catch-up. simulateGym chains party vs a
   leader team. */

import {
  STAB,
  CRIT_CHANCE,
  CRIT_MULT,
  HIT_CAP_NORMAL,
  HIT_CAP_SUPER,
  BATTLE_TURN_CAP,
} from './constants';
import { calcDamage, calcDamageSimple } from './damage';
import { getTypeMultiplier } from './typechart';
import { pickMove } from './moves';
import { makeCombatant } from './stats';
import { defaultRng, Rng } from './rng';
import type {
  BattleEvent,
  BattleResult,
  GymEntry,
  MonsterInstance,
  MonsterTemplate,
} from './types';

type TemplateResolver = (id: number) => MonsterTemplate | undefined;

/** full 1v1 fight with the live damage model. Does not mutate inputs. */
export function simulateBattle(
  me: MonsterInstance,
  foe: MonsterInstance,
  rng: Rng = defaultRng,
): BattleResult {
  const events: BattleEvent[] = [];
  let myHP = me.currentHP;
  let foeHP = foe.currentHP;
  const myMax = me.stats.hp || me.currentHP || 1;
  const foeMax = foe.stats.hp || foe.currentHP || 1;
  let turns = 0;

  while (myHP > 0 && foeHP > 0 && turns < BATTLE_TURN_CAP) {
    turns++;
    const meFirst = me.stats.spd >= foe.stats.spd;
    const order: Array<['me' | 'foe', MonsterInstance, MonsterInstance]> =
      meFirst
        ? [
            ['me', me, foe],
            ['foe', foe, me],
          ]
        : [
            ['foe', foe, me],
            ['me', me, foe],
          ];

    for (const [who, atk, def] of order) {
      if (myHP <= 0 || foeHP <= 0) break;

      const typeMod0 = getTypeMultiplier(atk.type, def.type);
      const mv = pickMove(atk, typeMod0);

      // accuracy check
      if (rng.next() * 100 > (mv.acc || 100)) {
        events.push({
          who,
          atkName: atk.name,
          move: mv.name,
          dmg: 0,
          typeMod: typeMod0,
