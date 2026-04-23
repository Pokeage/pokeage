# Security

This document covers the security posture of the on-chain program, how to report
a vulnerability, the invariants the program preserves, and the known limitations.
The program is pre-deployment and unaudited; read the limitations before drawing
any conclusion about safety.

## Posture

The program is small and defensive by construction. It runs only the $PAGE token
sinks, the SOL card mint fees, and a SOL card marketplace with a fail-closed
instant-sell floor. It does not run combat or leveling, so the on-chain attack
surface is just value movement and access control.

The defensive choices, described in full in [program.md](./program.md):

- Checked arithmetic on every value that touches funds or counters, mapping
  overflow to a custom error rather than wrapping. Basis-point math runs in
  `u128` and narrows back to `u64`.
- Checks-effects-interactions ordering in every handler: state is mutated before
  any token or lamport transfer, so a failed transfer cannot leave half-updated
  state.
- `has_one = authority` on the Config PDA for all admin instructions, and a
  player-owner constraint on player instructions.
- Fixed `PokeageError` reason codes for every failure path, so clients branch on
  stable codes instead of string matching.
- Independent pause switches (catch, mint, market, instant-sell) in a single
  bitmask, so one transaction can halt a class of actions during an incident.

## Reporting a vulnerability

Do not open a public issue for a security report. Follow the disclosure process
in the repository root `SECURITY.md`. If that file is not present yet, contact
the maintainer privately and wait for an acknowledgement before any public
disclosure. Include the affected instruction or account, the conditions to
trigger the issue, and the impact (loss of funds, state corruption, denial of
service).

## On-chain invariants

These are the properties the program is built to preserve. Each maps to specific
code in [programs/pokeage/src](../programs/pokeage/src).

- The buyback pool never goes negative. `instant_sell` requires
  `total_lamports >= payout` before debiting, and the debit uses `checked_sub`.
  The pool's lamport home is moved with a checked balance adjustment that
  requires the source balance to cover the amount. See
  [instant_sell.rs](../programs/pokeage/src/instructions/instant_sell.rs) and
  `move_lamports_pda` in
  [shared.rs](../programs/pokeage/src/instructions/shared.rs).

- Instant sell is fail-closed. The payout path requires three gates:
  `instant_sell_enabled` is true, `floor_price > 0`, and the pool can cover one
  payout. The pool ships disabled, `update_floor` auto-disables when the pool
  cannot cover a payout at the new floor, and `set_instant_sell` refuses to
  enable without a floor. See
  [admin.rs](../programs/pokeage/src/instructions/admin.rs).

- Token sinks split exactly 70/30 with no loss. `compute_split` burns the
  basis-point share and assigns the exact remainder to the pool, so burn plus
  pool equals the input for any amount, including odd remainders. Asserted by the
  program and CLI tests.

- Marketplace fees are bounded and accounted. The trade fee is capped at
  20 percent at initialize and is a fraction of the price, so it can never exceed
  the price; the seller net is `price - fee` with checked subtraction. The fee
  splits 60 pool / 40 burn-share with the remainder assigned to the burn-share,
  so the full fee is accounted. See
  [buy_card.rs](../programs/pokeage/src/instructions/buy_card.rs) and the fee-config
  check in [initialize.rs](../programs/pokeage/src/instructions/initialize.rs).

- Escrowed cards are program-controlled. A listed card moves into an ATA owned by
  the Listing PDA, and the transfer back out (on cancel or buy) is signed by the
  Listing PDA, not by a user. Only `cancel_listing` (by the seller) or `buy_card`
  can release it.

- Counters are monotonic and overflow-safe. `total_burned`,
  `total_cards_minted`, `total_caught`, and `gym_wins` only increase, each with
  `checked_add`.

## Known limitations

This is the honest list. Treat the program as experimental.

- Single author. The codebase has one author and no second reviewer.
- No external audit. The economy and marketplace code has not had a third-party
  security review.
- Early stage. The program is pre-deployment and has not run against real funds
  or sustained adversarial load.
- Placeholder program id. `declare_id!` is the Anchor default
  (`Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`) and must be replaced before a
  real deploy, with a matching IDL regeneration.
- Token not launched. The $PAGE mint does not exist yet; the mint is supplied at
  call time, so any integration must validate the mint it is handed.
- Operator-set floor. The instant-sell floor is set by the authority, not an
  oracle. The fail-closed gates bound how much the pool can pay, but a
  too-generous floor can still drain the pool quickly at a healthy balance.
- Single authority key. One key controls pauses, the floor, the instant-sell
  toggle, and treasury withdrawals. It is a single point of failure; a multisig
  is recommended before mainnet.
- Build verification pending. As a pre-deployment codebase, confirm the program
  compiles cleanly with `anchor build` and that the lib dispatch names match the
  handler names before relying on any of the above.

## Off-chain engine

The [engine](./engine.md) holds no funds and signs nothing, so it is outside the
on-chain threat model. Its security-relevant property is determinism: a run is
reproducible from its seed, which makes outcomes auditable rather than a trusted
black box. The engine does not validate that an on-chain charge actually
occurred; that binding is the host application's responsibility.
