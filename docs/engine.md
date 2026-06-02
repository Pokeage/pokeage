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

| export | signature | description |
| --- | --- | --- |
| `statAtLevel` | `(base, level, isHP?): number` | GSC-style per-level stat |
| `interpStat` | `(base, target, level): number` | linear base-to-target interpolation |
| `targetStatsFor` | `(template): Stats` | Lv50 targets: stage2, else stage1, else base |
| `statsAtLevel` | `(template, level): Stats` | full interpolated stat block |
| `stageForLevel` | `(template, level): number` | evolution stage for a level (0, 1, 2) |
| `createMonsterInstance` | `(template, level): MonsterInstance` | fresh, full-HP instance (interpolation model) |
| `makeCombatant` | `(template, level): MonsterInstance` | quick combatant (GSC stat model) |

Stat interpolation over the growth span (49 levels, base at level 1 to target at
level 50):

```
t    = clamp((level - 1) / 49, 0, 1)
stat = floor(base + (target - base) * t)
```

GSC-style per-level stat:

```
core = floor((2 * base * level) / 100)
stat = isHP ? core + level + 10 : core + 5
```

## progression.ts

XP, leveling, and evolution. The XP curve splits at level 10 into a steeper
segment. Each level recomputes stats, heals the gained HP delta, and fires
evolution at ev1/ev2. Legendaries (ev1/ev2 null) never evolve. The hard cap is
`MAX_LEVEL` (55).

| export | signature | description |
| --- | --- | --- |
| `getXpForLevel` | `(level): number` | XP to advance from level to level+1 |
| `cumulativeXp` | `(level): number` | total XP to reach a level from 1 |
| `grantXp` | `(mon, amount, template): ProgressEvent[]` | grant XP, level and evolve, mutates mon |
| `rookieMultiplier` | `(level): number` | catch-up XP multiplier by lead level |
| `wildXpReward` | `(leadLevel, wildLevel, buffMult?): number` | XP for a wild win |
| `gymXpReward` | `(memberLevel, teamSize, buffMult?): number` | XP for a gym clear |
| `ProgressEvent` | `{type:'levelup',level} \| {type:'evolve',stage}` | event union |

XP curve:

```
level <= 10 : floor(50 * level ^ 1.5)
level >  10 : floor(80 * level ^ 1.7)
```

Rookie multiplier: 4 under level 30, 2.5 under 45, 1.8 otherwise. Wild reward:

```
levelDiff = max(0.4, 1 - (leadLevel - wildLevel) * 0.02)
reward    = max(12, floor((5 + wildLevel * 2.5) * levelDiff * rookie * buffMult))
```

Gym reward: `floor((15 + teamSize * 8) * rookie * buffMult)`.

### Worked example: level-up

A level 9 monster has 1300 XP banked and gains 200 more. `getXpForLevel(9) =
floor(50 * 9^1.5) = floor(50 * 27) = 1350`. After the grant it holds 1500 XP,
which clears the level 9 threshold (1350), so it advances to level 10, keeping
150 XP. Stats are recomputed via `statsAtLevel` for level 10 and the HP gain is
healed. If its `ev1` is 10 and it was at stage 0, a second event
`{type: 'evolve', stage: 1}` fires in the same `grantXp` call.

## power.ts

Combat power (CP) scoring, used to compare teams and decide catch upgrades.

| export | signature | description |
| --- | --- | --- |
| `getMonsterPower` | `(mon): number` | stat sum + level*3 + rarity bonus |
| `getTrainerPower` | `(trainer): number` | sum of party CP |
| `weakestOf` | `(mons): MonsterInstance \| null` | weakest by CP, or null when empty |

Rarity bonus: common 0, rare 100, legendary 200. Level weight is 3 per level.

## catch.ts

Catch rate model. Base rate by rarity, reduced by level, clamped, scaled by a
ball multiplier; at or above 999 the catch is guaranteed (master ball).

| export | signature | description |
| --- | --- | --- |
| `catchRate` | `(wild, ballMult = 1): number` | effective catch probability |
| `attemptCatch` | `(wild, ballMult?, rng?): CatchResult` | one throw, returns `{caught, ballsUsed, rate}` |

```
base    = CATCH_RATE[rarity]      // common 0.4, rare 0.08, legendary 0.015
penalty = max(0, level * 0.005)
rate    = clamp(base - penalty, 0.005, 0.9)
ballMult >= 999 : rate = 1.0
ballMult >  1   : rate = min(1.0, rate * ballMult)
```

## affection.ts

Bond that gates the on-chain card claim. A monster gains affection on each win,
scaled by foe toughness so farming weak mobs does not fast-track the bond. At
`AFFECTION_MAX` (100) the card claim unlocks.

| export | signature | description |
| --- | --- | --- |
| `affectionGainFor` | `(mon, foeLevel): number` | gain for beating a foe, clamped [0.1, 2.0] |
| `addAffection` | `(mon, gain): boolean` | apply gain, returns true if it just hit max |
| `canClaimCard` | `(mon): boolean` | true when affection >= 100 |

```
gain = clamp(0.5 * (foeLevel / myLevel), 0.1, 2.0)
```

## encounter.ts
