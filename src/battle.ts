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
          miss: true,
          myHP,
          foeHP,
        });
        continue;
      }

      const roll = calcDamage(atk, def, mv.power, rng);
      const stab = mv.type === atk.type ? STAB : 1;
      const crit = rng.chance(CRIT_CHANCE);
      let dmg = Math.floor(roll.dmg * stab * (crit ? CRIT_MULT : 1));

      // single per-hit cap applied after every multiplier
      const maxHpDef = who === 'me' ? foeMax : myMax;
      const capPct = roll.typeMod >= 2 ? HIT_CAP_SUPER : HIT_CAP_NORMAL;
      dmg = Math.max(1, Math.min(dmg, Math.ceil(maxHpDef * capPct)));

      let status: string | null = null;
      if (mv.status && mv.effChance > 0 && rng.next() * 100 < mv.effChance) {
        status = mv.status;
      }

      if (who === 'me') foeHP = Math.max(0, foeHP - dmg);
      else myHP = Math.max(0, myHP - dmg);

      events.push({
        who,
        atkName: atk.name,
        move: mv.name,
        moveType: mv.type,
        dmg,
        typeMod: roll.typeMod,
        crit,
        status,
        myHP,
        foeHP,
      });
    }
  }

  let won: boolean;
  if (foeHP <= 0) won = true;
  else if (myHP <= 0) won = false;
  else won = myHP / myMax >= foeHP / foeMax;

  return { won, myHP, foeHP, turnsUsed: turns, events };
}

/** lightweight fight for offline catch-up. Returns survivor HP, no event log. */
export function simulateAuto(
  party: MonsterInstance,
  wild: MonsterInstance,
  rng: Rng = defaultRng,
): { won: boolean; hpRemaining: number; turnsUsed: number } {
  let partyHP = party.currentHP;
  let wildHP = wild.currentHP;
  let turns = 0;

  while (partyHP > 0 && wildHP > 0 && turns < 20) {
    turns++;
    if (party.stats.spd >= wild.stats.spd) {
      wildHP -= calcDamageSimple(party, wild, rng);
      if (wildHP <= 0) break;
      partyHP -= calcDamageSimple(wild, party, rng);
    } else {
      partyHP -= calcDamageSimple(wild, party, rng);
      if (partyHP <= 0) break;
      wildHP -= calcDamageSimple(party, wild, rng);
    }
  }
