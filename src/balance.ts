/* pokeAge engine: batch simulation harness.
   Runs many seeded playthroughs and aggregates the outcomes, which is how the
   game balance was tuned. Deterministic: the same seed list yields the same
   report. Callers supply a factory that builds a fresh engine per seed. */

import type { Engine } from './engine';

export interface BatchReport {
  runs: number;
  ticks: number;
  avgBadges: number;
  avgCaught: number;
  avgBattles: number;
  avgTeamLevel: number;
  /** fraction of runs that earned all 12 badges. */
  fullClearRate: number;
}

/** run each seed for `ticks` ticks and aggregate. */
export function runBatch(
  makeEngine: (seed: number) => Engine,
  seeds: number[],
  ticks: number,
): BatchReport {
  let badges = 0;
  let caught = 0;
  let battles = 0;
  let teamLevel = 0;
  let fullClears = 0;

  for (const seed of seeds) {
    const engine = makeEngine(seed);
    for (let i = 0; i < ticks; i++) engine.tick();
    const t = engine.trainer;
    badges += t.badges.length;
    caught += t.totalCaught;
    battles += t.totalBattles;
    teamLevel += t.team.reduce((s, m) => s + m.level, 0);
    if (t.badges.length >= 12) fullClears++;
  }

  const n = Math.max(1, seeds.length);
  return {
    runs: seeds.length,
    ticks,
    avgBadges: round2(badges / n),
    avgCaught: round2(caught / n),
    avgBattles: round2(battles / n),
    avgTeamLevel: round2(teamLevel / n),
    fullClearRate: round2(fullClears / n),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
