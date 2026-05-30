# Engine reference

Module-by-module reference for the deterministic simulation engine in
[`src/`](../src). Every roll comes from an injected `Rng`, so the same seed and
inputs always produce the same outcome. The public surface is re-exported from
[index.ts](../src/index.ts).

All formulas below are taken verbatim from the source. Where a formula is shown
in a code fence, plain hyphens are arithmetic operators.

## rng.ts

Seedable mulberry32 generator. Not cryptographic, good enough for game rolls.

| export | signature | description |
| --- | --- | --- |
| `Rng` | `new Rng(seed = 0x2545f491)` | seedable generator instance |
| `Rng.next` | `(): number` | next float in [0, 1) |
| `Rng.int` | `(min, max): number` | integer in [min, max] inclusive |
| `Rng.float` | `(min, max): number` | float in [min, max) |
| `Rng.chance` | `(p): boolean` | true with probability p, clamped to [0, 1] |
| `Rng.pick` | `<T>(arr): T` | uniform pick from a non-empty array |
| `Rng.variance` | `(hi = 1.0, lo = 0.85): number` | damage variance roll |
| `Rng.snapshot` | `(): number` | capture internal state |
| `Rng.restore` | `(state): void` | restore a captured state |
| `defaultRng` | `Rng` | shared default instance |
| `rngFromString` | `(seed: string): Rng` | FNV-hash a string into a seeded Rng |

## typechart.ts

The 17-type effectiveness chart, ported verbatim from the live engine. Strong
matchups are x2, weak are x0.5, immune are x0, otherwise x1.

| export | signature | description |
| --- | --- | --- |
| `TYPE_EFFECTIVENESS` | `Record<MonsterType, {strong, weak}>` | per-type strong/weak lists |
| `TYPE_IMMUNE` | `Partial<Record<MonsterType, MonsterType[]>>` | attacker to defender no-effect pairs |
| `getTypeMultiplier` | `(atkType, defType): number` | 0, 0.5, 1, or 2 |
| `effectivenessLabel` | `(typeMod): string \| null` | UI label, null when neutral |

Immunities: normal and fighting do nothing to ghost, poison does nothing to
steel, ground does nothing to flying, electric does nothing to ground, psychic
does nothing to dark, ghost does nothing to normal.

## moves.ts

Move data and AI selection. Move names are original, mechanic-flavored labels.
`power 0` would be a status move and is excluded from the attack index.

| export | signature | description |
| --- | --- | --- |
| `MOVES` | `Move[]` | full move pool across all 17 types |
| `MOVES_BY_TYPE` | `Record<string, Move[]>` | attack moves grouped by type, ascending power |
| `getMonMoves` | `(mon: {type, level}): Move[]` | build a 4-move set: 3 same-type plus 1 normal |
| `pickMove` | `(attacker, typeMod): Move` | AI pick: strongest when super-effective, else a mid option |

Move learning is level-gated by a power cap inside `getMonMoves`: under level 16
caps power at 55, under 28 at 75, under 40 at 95, and 40 or higher removes the
cap. `pickMove` selects index 0 (strongest) when `typeMod >= 2`, otherwise the
second-strongest.

## damage.ts

Two formulas ship here. The standard formula drives the live battle loop; the
lightweight formula drives the offline and gym auto-sim.

| export | signature | description |
| --- | --- | --- |
| `calcDamage` | `(attacker, defender, movePower?, rng?): DamageRoll` | standard formula, returns `{dmg, typeMod}` |
| `calcDamageSimple` | `(attacker, defender, rng?): number` | lightweight formula |
| `DamageRoll` | `interface {dmg, typeMod}` | result shape |

Standard formula (raw damage, before STAB and crit, which the battle loop applies
and caps):

```
raw = ((2 * level) / 5 + 2) * power * (atk / def) / 50 + 2
dmg = floor(raw * typeMod * variance)   // variance in [0.85, 1.0), min 1
```

If `typeMod` is 0 (immune), the function returns `dmg: 0` and skips the roll.
`movePower` defaults to `DEFAULT_MOVE_POWER` (50). STAB, crit, and the per-hit
cap are deliberately applied by the battle loop, not here, so multipliers cannot
stack past the cap.

Lightweight formula:

```
baseDmg  = max(1, atk - floor(def * 0.5))
levelMod = 1 + (level - 1) * 0.02
dmg      = max(1, floor(baseDmg * typeMod * variance * levelMod))   // variance in [0.85, 1.15)
```

### Worked example: damage

A level 25 attacker with atk 80 hits a defender with def 60 using a power-65
move, type-neutral, variance landing at 0.92.

```
raw = ((2 * 25) / 5 + 2) * 65 * (80 / 60) / 50 + 2
    = (10 + 2) * 65 * 1.3333 / 50 + 2
    = 12 * 65 * 1.3333 / 50 + 2
    = 1040 / 50 + 2 = 20.8 + 2 = 22.8
dmg = floor(22.8 * 1.0 * 0.92) = floor(20.97) = 20
```

If the move were same-type (STAB 1.5) and not a crit, the battle loop would scale
to `floor(20 * 1.5) = 30`, then clamp to the per-hit cap (30 percent of the
defender's max HP for a neutral hit, 40 percent for super-effective).

## stats.ts

Stat scaling and instance creation. Owned instances interpolate base toward the
Lv50 target linearly; `statAtLevel` is a GSC-style formula kept for ad-hoc
combatants.
