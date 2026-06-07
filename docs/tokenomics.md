# Tokenomics

The $PAGE economy has two assets. $PAGE is the in-game token (SPL Token-2022,
6 decimals) charged for game actions and burned on a deflationary schedule. SOL
is the currency for card NFTs: mint fees and marketplace trades settle in SOL,
and a SOL buyback pool backs an optional instant-sell floor.

Every number here is defined in code and duplicated across packages: the program
in [constants.rs](../programs/pokeage/src/constants.rs), the engine in
[constants.ts](../src/constants.ts), the SDK in
[constants.ts](../sdk/src/constants.ts), and the CLI in
[economy.rs](../cli/src/economy.rs). Each copy has unit tests asserting the
splits sum correctly.

## Token sinks

$PAGE is charged for game actions. Each charge is split 70 percent burned,
30 percent to the buyback pool token account.

| action | cost ($PAGE) | rarity code | note |
| --- | --- | --- | --- |
| deploy_agent | 1000 | n/a | one-time per player |
| catch_attempt (common) | 10 | 0 | highest-volume sink |
| catch_attempt (rare) | 100 | 1 | |
| catch_attempt (legendary) | 1000 | 2 | |
| gym_challenge | 50 | n/a | per challenge |
| force_evolve | 75000 | n/a | intentionally steep, skips the level grind |

Catching is the dominant volume sink, force-evolve is the dominant value sink. A
single force-evolve burns more $PAGE than thousands of common catches, which is
deliberate: skipping the natural evolution grind should cost real supply.

## Fee splits

| flow | split | destination |
| --- | --- | --- |
| token sink | 70 / 30 | burn / buyback pool |
| card mint fee (SOL) | 50 / 50 | buyback pool / treasury |
| marketplace trade fee (5 percent of price) | 60 / 40 | buyback pool / burn-share |

The marketplace burn-share is parked in treasury for SOL trades, because SOL
cannot be burned directly; it funds a later token buy-and-burn. The pool share of
every flow accrues to the same buyback pool that backs instant sell.

In all sink and split math the larger part is computed with `bps_of` and the
remainder is assigned to the other part, so the two always sum back to the input
with no rounding loss. For a 7-unit sink the burn is `floor(7 * 7000 / 10000) =
4` and the pool gets the remaining 3.

## NFT mint fee per tier

Card mint fees are paid in SOL and scale by tier. The fee splits 50/50 between
the buyback pool and the treasury.

| tier | code | mint fee | in SOL |
| --- | --- | --- | --- |
| common | 0 | 1000000 lamports | 0.001 |
| uncommon | 1 | 3000000 | 0.003 |
| rare | 2 | 10000000 | 0.01 |
| holo | 3 | 50000000 | 0.05 |
| ultra | 4 | 200000000 | 0.2 |
| secret | 5 | 1000000000 | 1.0 |

The table is monotonic by design and asserted as such in the program, SDK, and
CLI tests, so a higher tier always costs more to mint.

## Price model

The off-chain display price (used by the UI and by `cardPriceSol` in
[pricing.ts](../src/pricing.ts)) is the product of three factors:

```
price = tier_base_price * level_band_multiplier * evolution_stage_multiplier
```

Tier base price (stage 0, lowest level band), in SOL:

| tier | base price (SOL) |
| --- | --- |
| common | 0.001 |
| uncommon | 0.005 |
| rare | 0.05 |
| holo | 0.3 |
| ultra | 3 |
| secret | 30 |

Level band multiplier:

| level range | multiplier |
| --- | --- |
| 1 to 20 | 1.0x |
| 21 to 40 | 1.5x |
| 41 to 60 | 2.5x |
| 61 to 80 | 4.0x |
| 81 to 99 | 6.0x |
| 100 | 10.0x |

Evolution stage multiplier: stage 0 is 1.0x, stage 1 is 2.0x, stage 2 is 4.0x.
The stage multiplier only applies to rare tier and below; ultra and secret are
scarcity-priced and ignore stage, so a fully evolved holo can be worth more than
a base-stage ultra only when the level and tier bases line up.

This price model is a display and quoting aid, not an on-chain oracle. The chain
charges fixed mint fees and a percentage trade fee; the market price between
players is whatever a listing's `price` field says. The model exists so a client
can suggest a sane ask.

## Buyback pool mechanics

The buyback pool is a single SOL account (`BuybackPool` state plus the
`buyback_vault` lamport home) that accrues value from the economy and optionally
buys cards back at a floor.

Accrual sources:

- 30 percent of every $PAGE token sink, routed as the pool's $PAGE token balance.
- 50 percent of every SOL card mint fee.
- 60 percent of every SOL marketplace trade fee.
- the flat SOL listing fee on every new listing.

