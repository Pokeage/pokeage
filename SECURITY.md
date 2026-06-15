# Security Policy

## Supported versions

This project is pre-deployment and pre-1.0. Only the latest `0.4.x` line on the
default branch receives fixes.

| Version | Supported |
| --- | --- |
| 0.4.x | yes |
| < 0.4 | no |

## Reporting a vulnerability

Please do not open a public issue for security problems.

Use GitHub private vulnerability reporting on this repository
("Security" tab, then "Report a vulnerability"), or open a draft security
advisory. Include:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- the affected package (`engine`, `sdk`, `program`, or `cli`) and version.

You can expect an initial acknowledgement within a few days. Once a fix is
ready, we will coordinate a disclosure timeline with you.

## On-chain scope

The Anchor program in `programs/pokeage/` has not been deployed and has not been
audited. The program id in the manifest is a placeholder. Reports against the
program are welcome, but treat the on-chain code as experimental and unaudited.

Invariants the program is designed to preserve:

- token sinks split exactly 70 percent burn and 30 percent pool,
- the buyback pool balance never goes negative,
- instant sell is fail-closed: it reverts when the pool is empty or disabled,
- marketplace fees are bounded and use checked arithmetic.

If you find a way to break any of these, that is in scope.

## Out of scope

- The bundled sample roster and world data are illustrative, not production data.
- Off-chain RPC availability and third-party endpoints.
