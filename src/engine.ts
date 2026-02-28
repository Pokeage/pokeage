/* pokeAge engine: the autonomous tick orchestrator.
   One tick decides between heal, gym, move, and hunt, mutates the trainer, and
   returns a structured result. This is the same decision tree the live game
   runs, made deterministic via an injected Rng and pure data inputs. */

import { ENCOUNTER_RATE_MULT, FLEE_LEVEL_GAP } from './constants';
import { generateWildMonster, EncounterBuffs } from './encounter';
import { simulateAuto, simulateGym } from './battle';
import { attemptCatch } from './catch';
import { grantXp, wildXpReward, gymXpReward } from './progression';
import { placeNewMonster, shouldCatch } from './team';
import { addAffection, affectionGainFor } from './affection';
import { defaultRng, Rng } from './rng';
import type {
  AgentState,
  EncounterResult,
  MonsterTemplate,
  Route,
  TickResult,
  Town,
  Trainer,
} from './types';

export interface World {
  towns: Town[];
  routes: Route[];
}

export interface EngineOptions {
  rng?: Rng;
  buffs?: EncounterBuffs;
  /** xp buff multiplier applied to all gains (shop item parity). */
  xpBuff?: number;
}

export class Engine {
  state: AgentState = 'idle';
  private gymCooldown = 0;

  constructor(
    public trainer: Trainer,
    private world: World,
    private getTemplate: (id: number) => MonsterTemplate | undefined,
    private opts: EngineOptions = {},
  ) {
    this.opts.rng = this.opts.rng || defaultRng;
  }

  private get rng(): Rng {
    return this.opts.rng as Rng;
  }

  townById(id: string): Town | undefined {
    return this.world.towns.find((t) => t.id === id);
  }

  routeById(id: string): Route | undefined {
    return this.world.routes.find((r) => r.id === id);
  }

  currentTown(): Town | undefined {
    return this.townById(this.trainer.location);
  }

  /** advance the run by one decision. */
  tick(): TickResult {
    const town = this.currentTown();
    if (!town) return { state: this.state, action: 'idle' };

    const strat = this.trainer.strategy || {};
    const lead = this.trainer.team[0];
    const leadAlive = !!(lead && lead.currentHP > 0 && lead.stats);
    const leadNeedsHeal =
      leadAlive && lead.currentHP < lead.stats.hp * 0.15;
    const allFainted = this.trainer.team.every((m) => m.currentHP <= 0);

    if (allFainted || (leadNeedsHeal && strat.autoHeal !== false)) {
      this.healTeam();
      return { state: this.state, action: 'heal' };
    }

    if (strat.autoGym !== false && this.shouldChallengeGym(town)) {
      const won = this.doGymChallenge(town);
      return {
        state: this.state,
        action: 'gym',
        detail: won ? 'won' : 'lost',
      };
    }

    if (
      strat.autoMove !== false &&
      town.gym &&
      this.trainer.badges.includes(town.gym.badge) &&
      town.nextTown
    ) {
      const next = this.townById(town.nextTown);
      if (next && (!next.requiredBadge || this.trainer.badges.includes(next.requiredBadge))) {
        this.moveToTown(next);
        return { state: this.state, action: 'move', detail: next.name };
      }
    }

    const enc = this.doWildEncounter(town);
    return {
      state: this.state,
      action: enc.caught ? 'caught' : 'hunt',
      encounter: enc,
    };
  }

  healTeam(): void {
    this.state = 'healing';
    this.trainer.team.forEach((m) => {
      m.currentHP = m.stats.hp;
    });
  }

  shouldChallengeGym(town: Town): boolean {
    if (!town.gym) return false;
    if (this.trainer.badges.includes(town.gym.badge)) return false;
    if (this.gymCooldown > 0) {
      this.gymCooldown--;
      return false;
    }

    const gymTowns = this.world.towns
      .filter((t) => t.gym)
      .sort((a, b) => (a.gym!.order - b.gym!.order));
    const idx = gymTowns.findIndex((t) => t.id === town.id);
    if (idx > 0) {
      const prev = gymTowns[idx - 1];
      if (!this.trainer.badges.includes(prev.gym!.badge)) return false;
    }

    const alive = this.trainer.team.filter((m) => m.currentHP > 0);
    if (alive.length < 1) return false;

    const leadLevel = this.trainer.team[0].level;
    const gymMaxLv = Math.max(...town.gym.team.map((t) => t.level));
    return leadLevel >= gymMaxLv;
  }

  doGymChallenge(town: Town): boolean {
    this.state = 'gym';
    const gym = town.gym!;
    const party = this.trainer.team.filter((m) => m.currentHP > 0).slice(0, 4);
    const result = simulateGym(party, gym.team, this.getTemplate, this.rng);

    if (result.won) {
      this.trainer.badges.push(gym.badge);
      this.trainer.items.ball = (this.trainer.items.ball || 0) + 3;
      const xpBuff = this.opts.xpBuff || 1;
      for (const m of party) {
        const tpl = this.getTemplate(m.templateId);
        if (tpl) grantXp(m, gymXpReward(m.level, gym.team.length, xpBuff), tpl);
      }
      return true;
    }
    this.gymCooldown = 5;
    return false;
  }
