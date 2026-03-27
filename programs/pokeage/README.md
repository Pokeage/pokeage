# pokeage program

On-chain economy for pokeAge. The $PAGE token is an SPL Token-2022 mint with 6
decimals that launches on pump.fun. This Anchor program runs the token sinks,
the card mint fees, and a SOL card marketplace with a fail-closed instant-sell
floor backed by a buyback pool.

Token sinks (deploy, catch, gym, force-evolve) burn 70 percent of every charge
and route 30 percent to the buyback pool token account. Card mint fees are paid
in SOL and split 50/50 between the pool and the treasury. Marketplace trades
charge a 5 percent fee, of which 60 percent feeds the pool and 40 percent is the
burn share that parks in treasury for a later token buy-and-burn.

All token movement uses `anchor_spl::token_interface`, so the program is
compatible with Token-2022 mints. Card NFTs are treated as amount-1, decimals-0
transfers held in a listing-owned escrow ATA during a sale.

## Program id

```
Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

This is the Anchor placeholder id. Replace it before any real deploy.

## Instructions

| name | accounts | effect |
| --- | --- | --- |
| initialize | authority, config, buyback_pool, page_mint, treasury, buyback_vault | create config and pool PDAs, validate fee config |
| deploy_agent | player, player_state, config, page_mint, player_token, pool_token | one-time deploy, burn 1000 PAGE (70/30) |
| catch_attempt | player, player_state, config, page_mint, player_token, pool_token | burn rarity cost (70/30), bump caught count |
| gym_challenge | player, player_state, config, page_mint, player_token, pool_token | burn 50 PAGE (70/30), award badge |
| force_evolve | player, player_state, config, page_mint, player_token, pool_token | burn 75000 PAGE (70/30) |
| mint_card | payer, config, buyback_pool, card_mint, card_meta, buyback_vault, treasury | record card, split SOL mint fee 50/50 |
| list_card | seller, config, buyback_pool, card_mint, listing, seller_card, escrow_card, buyback_vault | escrow card, open listing, charge listing fee |
| cancel_listing | seller, listing, card_mint, seller_card, escrow_card | return card, close listing and escrow |
| buy_card | buyer, config, buyback_pool, listing, seller, card_mint, buyer_card, escrow_card, buyback_vault, treasury | pay price minus 5 percent fee, move card to buyer |
| instant_sell | seller, config, buyback_pool, card_mint, seller_card, vault_card, buyback_vault | pool buys card at floor times 50 percent |
| update_floor | authority, config, buyback_pool | set floor price, auto-toggle instant sell |
| set_instant_sell | authority, config, buyback_pool | enable or disable instant sell |
| withdraw_treasury | authority, config, treasury | move lamports from treasury to authority |
| set_pause | authority, config | set the pause bitmask |

## Accounts

| account | fields |
| --- | --- |
| Config | authority, page_mint, treasury, buyback_vault, burn_bps, pool_bps, market_fee_bps, instant_sell_bps, listing_fee, total_burned, total_cards_minted, paused, bump |
| PlayerState | owner, agent_deployed, total_caught, gym_wins, badges, last_action, bump |
| Listing | seller, card_mint, price, tier, level, stage, created_at, active, bump |
| BuybackPool | total_lamports, lifetime_in, lifetime_out, floor_price, instant_sell_enabled, bump |
| CardMeta | mint, owner, tier, stage, level, minted_at, bump |

The `paused` byte on Config is a bitmask: catch = 1, mint = 2, market = 4,
instant_sell = 8. The `badges` field on PlayerState is a 12-bit mask, one bit per
gym badge.

## PDA seeds

| pda | seeds |
