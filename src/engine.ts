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

