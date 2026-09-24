# 0001. Pipeline Release Gate and Offline Application Compilation

## Status

**Superseded for production builds by
[ADR 0049](0049-deploy-main-on-green-ci.md) on 2026-09-24:** Vercel's
production build of `main` now applies migrations before compiling. CI,
local and preview builds still compile offline without migrating.

## Context

Running live database migrations during static application builds caused deployment deadlocks, database lock contention, and exposed sensitive database write credentials to frontend compilation steps. Additionally, migration integrity and safety checks were fragmented across separate scripts.

## Decision

This decision originally offloaded live database migration execution from application compilation to a dedicated pipeline stage. ADR 0049 removed that stage and placed production migration execution behind the Vercel-only guard in `scripts/build.js`. Local, CI, and preview builds remain offline, while migration integrity, provider parity, and destructive statement checks remain consolidated in `npm run check:migrations`.

## Consequences

- Live database migrations execute strictly in secured pipeline release stages isolated from static builds.
- Direct database write credentials are absent from frontend build compilation steps.
- Deployment deadlocks from parallel build lock contention are eliminated.
- Single diagnostic command (`npm run check:migrations` / `npm run dx doctor`) validates schema parity, file integrity, and destructive statement rules offline.
