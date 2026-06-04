# Program reference

On-chain reference for the `pokeage` Anchor program in
[`programs/pokeage/`](../programs/pokeage). The program runs the $PAGE token sinks, the
SOL card mint fees, and a SOL card marketplace with a fail-closed instant-sell
floor backed by a buyback pool. It does not run combat or leveling; those are
computed off-chain by the [engine](./engine.md).

The $PAGE mint is an SPL Token-2022 mint with 6 decimals. All token movement uses
`anchor_spl::token_interface`, so the program is Token-2022 compatible. Card NFTs
are moved as amount-1, decimals-0 transfers held in a listing-owned escrow ATA
during a sale.

> Pre-deployment. The program id is the Anchor placeholder
> (`Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`), the $PAGE mint is not
> launched, and the code has not had an external audit. Do not use it against
> real funds until the id is replaced and a review is done. See
> [security.md](./security.md).

Source: [lib.rs](../programs/pokeage/src/lib.rs),
[constants.rs](../programs/pokeage/src/constants.rs),
[errors.rs](../programs/pokeage/src/errors.rs),
[events.rs](../programs/pokeage/src/events.rs), the
[instructions](../programs/pokeage/src/instructions) directory, and the
[state](../programs/pokeage/src/state) directory.

## Instructions

| name | args | accounts | effect |
| --- | --- | --- | --- |
| initialize | burn_bps, pool_bps, market_fee_bps, listing_fee | authority, config, buyback_pool, page_mint, treasury, buyback_vault, token_program, system_program | create Config and BuybackPool PDAs; validate burn+pool == 10000 and market fee <= 2000; pool starts disabled |
| deploy_agent | none | player, player_state, config, page_mint, player_token, pool_token, token_program, system_program | one-time deploy; mark agent deployed; burn 1000 PAGE split 70/30 |
| catch_attempt | rarity (u8) | player, player_state, config, page_mint, player_token, pool_token, token_program | require deployed; bump total_caught; burn 10/100/1000 PAGE by rarity split 70/30 |
| gym_challenge | badge_index (u8) | player, player_state, config, page_mint, player_token, pool_token, token_program | require deployed; set badge bit; bump gym_wins; burn 50 PAGE split 70/30 |
| force_evolve | none | player, player_state, config, page_mint, player_token, pool_token, token_program | require deployed; burn 75000 PAGE split 70/30 |
| mint_card | tier, stage, level (u8) | payer, config, buyback_pool, card_mint, card_meta, buyback_vault, treasury, system_program | write CardMeta; bump total_cards_minted; split SOL mint fee 50/50 pool/treasury |
| list_card | price, tier, level, stage | seller, config, buyback_pool, card_mint, listing, seller_card, escrow_card, buyback_vault, token_program, associated_token_program, system_program | require price > 0; open Listing; charge flat listing fee to pool; escrow the card |
| cancel_listing | none | seller, listing, card_mint, seller_card, escrow_card, token_program | return escrowed card to seller; close listing and escrow ATA |
| buy_card | none | buyer, config, buyback_pool, listing, seller, card_mint, buyer_card, escrow_card, buyback_vault, treasury, token_program, associated_token_program, system_program | pay price; fee 5 percent split 60 pool / 40 burn-share; move card to buyer; close listing |
| instant_sell | none | seller, config, buyback_pool, card_mint, seller_card, vault_card, buyback_vault, token_program, associated_token_program, system_program | fail-closed pool buy; pay floor * 50 percent; card moves to vault |
| update_floor | floor_price (u64) | authority, config, buyback_pool | set floor; auto-disable instant sell if pool cannot cover one payout |
| set_instant_sell | enabled (bool) | authority, config, buyback_pool | toggle instant sell; cannot enable without a floor |
| withdraw_treasury | amount (u64) | authority, config, treasury | move lamports from treasury to authority |
| set_pause | flags (u8) | authority, config | set the pause bitmask |

The four token sinks (deploy, catch, gym, force-evolve) share a single helper,
`apply_sink` in [shared.rs](../programs/pokeage/src/instructions/shared.rs), which
burns the burn part from the payer's token account and transfers the pool part to
the pool token account, then returns the realized split for bookkeeping.

## Accounts

### Config (singleton)

Global program config plus the pause bitflags.

| field | type | meaning |
| --- | --- | --- |
| authority | Pubkey | admin signer for gated instructions |
| page_mint | Pubkey | the $PAGE Token-2022 mint |
| treasury | Pubkey | SOL fee sink and burn-share parking |
| buyback_vault | Pubkey | SOL home of the buyback pool, also holds bought-back card ATAs |
| burn_bps | u16 | sink burn share, 7000 |
| pool_bps | u16 | sink pool share, 3000 |
| market_fee_bps | u16 | trade fee, 500 |
| instant_sell_bps | u16 | instant-sell payout share, 5000 |
| listing_fee | u64 | flat listing fee in lamports |
| total_burned | u64 | lifetime $PAGE burned counter |
| total_cards_minted | u64 | lifetime card count |
| paused | u8 | pause bitmask |
| bump | u8 | PDA bump |

Pause bitmask: catch = 1, mint = 2, market = 4, instant_sell = 8. `is_paused`
checks a single bit; `set_pause` overwrites the whole byte.

### PlayerState (per player)

Per-player progress. Badges are packed into a 12-bit mask.

| field | type | meaning |
| --- | --- | --- |
| owner | Pubkey | the player wallet that owns this state |
| agent_deployed | bool | gate for catch / gym / force-evolve |
| total_caught | u64 | lifetime catch attempts charged |
| gym_wins | u32 | lifetime gym clears charged |
| badges | u16 | 12-bit badge mask |
| last_action | i64 | unix timestamp of the last action |
| bump | u8 | PDA bump |

### Listing (per card)

Secondary-market listing for a single card NFT held in escrow.

| field | type | meaning |
| --- | --- | --- |
| seller | Pubkey | listing owner, receives net proceeds |
| card_mint | Pubkey | the card NFT mint |
| price | u64 | ask price in lamports |
| tier | u8 | card tier code (0..5) |
| level | u8 | card level, for indexing |
| stage | u8 | evolution stage, for indexing |
| created_at | i64 | unix timestamp |
| active | bool | flipped false on cancel or buy |
| bump | u8 | PDA bump |

### BuybackPool (singleton)

Funds instant-sell payouts and accumulates market fees.

| field | type | meaning |
| --- | --- | --- |
| total_lamports | u64 | spendable balance backing payouts |
| lifetime_in | u64 | lifetime inflow counter |
| lifetime_out | u64 | lifetime payout counter |
| floor_price | u64 | reference floor for instant sell |
| instant_sell_enabled | bool | fail-closed gate, starts false |
| bump | u8 | PDA bump |

### CardMeta (per card)

On-chain record for a minted card, mirroring tier/stage/level for indexing.

| field | type | meaning |
| --- | --- | --- |
| mint | Pubkey | the card NFT mint |
| owner | Pubkey | minter |
| tier | u8 | tier code (0..5) |
| stage | u8 | evolution stage |
| level | u8 | card level |
| minted_at | i64 | unix timestamp |
| bump | u8 | PDA bump |

## PDA seeds

| account | seeds |
| --- | --- |
| Config | `"config"` |
| BuybackPool | `"buyback_pool"` |
| PlayerState | `"player"`, player pubkey |
| Listing | `"listing"`, card mint pubkey |
| CardMeta | `"card"`, card mint pubkey |
| escrow ATA | associated token of the card mint under the Listing PDA |

The SDK helpers in [pda.ts](../sdk/src/pda.ts) derive each of these and return
`[address, bump]`.

## Economy constants

| name | value | note |
| --- | --- | --- |
| DECIMALS | 6 | $PAGE base units, pokeage(1) == 1000000 |
| DEPLOY_COST | 1000 PAGE | one-time deploy sink |
| CATCH_COMMON / RARE / LEGENDARY | 10 / 100 / 1000 PAGE | catch sinks by rarity code 0/1/2 |
| GYM_COST | 50 PAGE | gym challenge sink |
| FORCE_EVOLVE_COST | 75000 PAGE | steep force-evolve sink |
| BURN_BPS / POOL_BPS | 7000 / 3000 | sink split, must sum to 10000 |
| MARKET_FEE_BPS | 500 | 5 percent trade fee |
| POOL_SHARE_BPS / BURN_SHARE_BPS | 6000 / 4000 | of the trade fee |
| INSTANT_SELL_BPS | 5000 | floor * 50 percent payout |
| LISTING_FEE_LAMPORTS | 1000000 | 0.001 SOL flat |
| BPS_DENOM | 10000 | basis-point denominator |

Mint fee per tier, lamports: common 1000000 (0.001 SOL), uncommon 3000000, rare
10000000, holo 50000000, ultra 200000000, secret 1000000000 (1.0 SOL). All of
this is duplicated in the SDK and CLI and asserted by unit tests in each package.
See [tokenomics.md](./tokenomics.md) for the rationale.

## Events

Handlers emit events for indexers: `AgentDeployed`, `CatchAttempted`,
`GymChallenged`, `Evolved`, `CardMinted`, `CardListed`, `ListingCancelled`,
`CardSold`, `InstantSold`. Sink events carry both the burned and pool amounts so
an indexer can reconstruct the split without re-deriving it. Source:
[events.rs](../programs/pokeage/src/events.rs).

## Security model

### Checked math

Every add, sub, mul, and div on a value that touches funds or counters uses
`checked_*` and maps failure to `PokeageError::MathOverflow`. The shared `bps_of`
helper computes `amount * bps / 10000` in `u128` space, then narrows back to
`u64`, so a large amount times a basis-point factor cannot overflow before the
division. The program aborts instead of wrapping.

### CEI ordering

Every handler mutates state before it moves tokens or lamports (checks, effects,
interactions). `deploy_agent` sets `agent_deployed` before the burn;
`catch_attempt` bumps `total_caught` before the sink; `buy_card` credits the pool
and flips the listing inactive before any transfer; `instant_sell` debits the
pool before paying out. A failed transfer cannot leave the program in a
half-updated state.

### Custom errors

All failures use the `PokeageError` enum with fixed reason codes
([errors.rs](../programs/pokeage/src/errors.rs)), never inline string requires, so
client tooling can branch on stable codes. The set: AgentAlreadyDeployed,
AgentNotDeployed, FeaturePaused, InvalidRarity, InvalidTier, InvalidBadgeIndex,
ListingInactive, NotListingOwner, PoolInsufficient, InstantSellDisabled,
FloorNotSet, MathOverflow, InvalidFeeConfig, Unauthorized, InsufficientFunds,
InvalidPrice. Anchor codes start at 6000 in the IDL.

### Access control

Admin instructions (update_floor, set_instant_sell, withdraw_treasury, set_pause)
use `has_one = authority` against the Config PDA, so only the configured
authority can call them. Player instructions constrain the `player_state` PDA
owner to the signer. Sink token accounts are constrained to the $PAGE mint and
the player authority. Marketplace transfers out of escrow are signed by the
Listing PDA, not the seller, so the program controls the escrowed card.

### Fail-closed instant sell

The pool buy path requires three gates, any unset gate blocks the payout:
`instant_sell_enabled` is true, `floor_price > 0`, and `total_lamports >=
payout`. The pool starts disabled at initialize. `update_floor` auto-disables
instant sell when the pool cannot cover one payout at the new floor, and
`set_instant_sell` refuses to enable without a floor. This means the pool can
never promise a buyback it cannot fund and never bootstraps a payout from empty.

### Bounded fees

`initialize` requires `burn_bps + pool_bps == 10000` and caps `market_fee_bps`
at 2000 (20 percent) to protect traders. The instant-sell share is fixed at
50 percent. A trade fee that exceeds the price cannot occur because the fee is a
fraction of the price and the seller net is `price - fee`.

## Implementation note

The instruction wiring in [lib.rs](../programs/pokeage/src/lib.rs) dispatches to
each handler module. The handler functions in the instruction files are named
with a `_handler` suffix (for example `catch_attempt_handler`), and the admin
entry points are free functions in
[admin.rs](../programs/pokeage/src/instructions/admin.rs). Confirm the dispatch
names match the handler names before the first build; this is a pre-deployment
codebase and the names are the kind of thing to verify with `anchor build`.
