/* pokeAge engine: offline progression.
   Replays engine ticks for the time a player was away, capped at MAX_OFFLINE_HOURS.
   Returns a diff summary so the UI can show "while you were away". Deterministic:
   the same engine state and elapsed time always produce the same catch-up. */

import { MAX_OFFLINE_HOURS, TICK_MS } from './constants';
import type { Engine } from './engine';

export interface OfflineSummary {
  ticks: number;
  durationMs: number;
  capped: boolean;
  battles: number;
  caught: number;
  levels: number;
  badges: number;
}

function snapshot(engine: Engine) {
  const t = engine.trainer;
  return {
    battles: t.totalBattles || 0,
    caught: t.totalCaught || 0,
    badges: (t.badges || []).length,
    teamLv: (t.team || []).reduce((s, m) => s + (m.level || 0), 0),
  };
}

/** run catch-up for `elapsedMs` of absence. Mutates the engine's trainer. */
export function runOfflineCatchup(
  engine: Engine,
  elapsedMs: number,
): OfflineSummary {
  const maxMs = MAX_OFFLINE_HOURS * 3600 * 1000;
  const capped = elapsedMs > maxMs;
  const cappedMs = Math.min(Math.max(0, elapsedMs), maxMs);
  const ticks = Math.floor(cappedMs / TICK_MS);

  const before = snapshot(engine);
  for (let i = 0; i < ticks; i++) engine.tick();
  const after = snapshot(engine);

  return {
    ticks,
    durationMs: cappedMs,
    capped,
    battles: after.battles - before.battles,
    caught: after.caught - before.caught,
    levels: after.teamLv - before.teamLv,
    badges: after.badges - before.badges,
  };
}

/** format a summary as a compact one-line report. */
export function formatOfflineSummary(s: OfflineSummary): string {
  const mins = Math.floor(s.durationMs / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const dur = h > 0 ? `${h}h ${m}m` : `${m}m`;
  const parts: string[] = [];
  if (s.battles > 0) parts.push(`${s.battles} battles`);
  if (s.caught > 0) parts.push(`+${s.caught} caught`);
  if (s.levels > 0) parts.push(`+${s.levels} levels`);
  if (s.badges > 0) parts.push(`+${s.badges} badges`);
  const body = parts.length ? parts.join(', ') : 'no progress';
  return `away ${dur}${s.capped ? ' (capped)' : ''}: ${body}`;
}
