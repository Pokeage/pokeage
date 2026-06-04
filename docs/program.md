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

