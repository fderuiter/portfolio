# 0001. Pre-Build Database Migrations and Connection Pooling

## Context

On Vercel, the application deployment pipeline runs `scripts/build.js`. Static site generation (SSG) in Next.js App Router executes database queries during `next build` (e.g. `PortfolioHomePage`, `generateStaticParams`, and dynamic case study views). When migrations were executed post-build (Phase 3), static prerendering queried unmigrated database instances whenever new schema columns were introduced, resulting in build failures or degraded mock renders. In addition, parallel static page generation triggered WebSocket concurrency race conditions against singleton serverless database clients.

## Decision

We moved database migration deployment (`npm run check:migrations` and `npx prisma migrate deploy`) to Phase 1.5 (pre-build), executing strictly before `npx next build` during production deployments. To safeguard database stability with pre-build migrations, all migrations must follow non-destructive, backward-compatible expand-and-contract rules enforced by automated CI and build-time safety guards (`scripts/check-migrations.js`). Furthermore, we upgraded database connectivity in `lib/db.ts` from a single `Client` to a connection `Pool` (`@neondatabase/serverless`) to support concurrent WebSocket queries during Next.js prerendering.

## Consequences

- Prerendered static pages always access the upgraded database schema during production builds.
- Releases must strictly follow the expand-and-contract pattern (schema additions first, deletions in later releases).
- Concurrent static page generation executes without `WebSocket readyState 0 (CONNECTING)` connection collisions.
