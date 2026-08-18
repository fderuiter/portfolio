# 0001. Pipeline Release Gate and Offline Application Compilation

## Context

Running live database migrations during static application builds caused deployment deadlocks, database lock contention, and exposed sensitive database write credentials to frontend compilation steps. Additionally, migration integrity and safety checks were fragmented across separate scripts.

## Decision

We offloaded live database migration execution (`npx prisma migrate deploy`) from application compilation (`scripts/build.js`) to a dedicated Pipeline Release Gate stage (`npm run release:gate` / `scripts/release-gate.ts`). Static application compilation executes strictly offline using fallback credentials (`DATABASE_URL`, `DIRECT_URL`, `CRON_SECRET`), without requiring live remote database connectivity or write credentials. Migration integrity, provider parity, and destructive statement checks are consolidated into a unified validator (`npm run check:migrations`).

## Consequences

- Live database migrations execute strictly in secured pipeline release stages isolated from static builds.
- Direct database write credentials are absent from frontend build compilation steps.
- Deployment deadlocks from parallel build lock contention are eliminated.
- Single diagnostic command (`npm run check:migrations` / `npm run dx doctor`) validates schema parity, file integrity, and destructive statement rules offline.
