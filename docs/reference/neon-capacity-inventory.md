# Neon Capacity & Branch Inventory

Last verified: 2026-09-10 (Issue #621 audit)

Scope: `fderuiter/portfolio`, Neon Free Tier, Vercel Resource `neon-gray-drum`

Sources: Vercel integration inspection (`neon-gray-drum` attached to `portfolio`), environment configuration names (`vercel env ls`), and repository source (`lib/db.ts`, `prisma/schema.prisma`, `lib/env.ts`)

This is the evidence-backed capacity, connection hygiene, and retention record for Neon Postgres under [ADR 0036](../../adr/0036-free-tier-offloading-and-provider-quota-governance.md).

> [!NOTE]
> **Provider-Side Inventory Gap (Issue #621)**: No Neon API credential (`NEON_API_KEY`) or authenticated Neon CLI profile is available in this local workspace. Provider-side storage measurements, branch lifecycles, and compute usage are explicitly recorded as unobserved locally rather than estimated or fabricated. No deletion candidates are approved without an authenticated provider snapshot.

## Capacity & Policy Baseline

| Meter | Observed Usage | Governed Limit | Policy Headroom | Status |
| --- | ---: | ---: | ---: | --- |
| Storage Capacity | *Unobserved locally* | 0.500 GiB (512 MiB) | 0.500 GiB (100%) | Governed Policy Limit |
| Compute Auto-Suspend | **5 minutes** (300s) | 5 minutes | 0s delay | Optimal |
| Compute Unit Limit | **0.25 CU** | 0.25 CU | 0 CU | Bounded |

Neon's free plan provides 0.5 GiB storage and auto-suspends compute after 5 minutes of inactivity. Direct un-cached public queries wake compute, adding 1–3s cold-start latency and consuming monthly compute hours.

## Project & Branch Inventory (Policy Baseline)

| Project / Resource | Target Name | Branch | Environment | Protection Status | Provider Storage | Role |
| --- | --- | --- | --- | --- | ---: | --- |
| `neon-gray-drum` | `portfolio` | `main` | Production | **Protected** | *Unobserved* | Canonical production database backing deruiter.dev |
| `neon-gray-drum` | `portfolio` | `dev` | Development | **Protected** | *Unobserved* | Long-lived integration branch database for schema rehearsal |

## Resource Classification & Retention Policy

### Protected Resources (Excluded from Cleanup)

1. **Production Branch (`main`)**: Canonical database powering live visitor endpoints. Retained permanently. Never deleted, reset, or expired.
2. **Integration Branch (`dev`)**: Long-lived staging database used for pre-release integration tests and migration rehearsals. Retained permanently.

### Ephemeral Resources (Subject to Retention & Expiry)

1. **PR Preview Branches (`preview/*`)**: Disposable per-PR databases. Expire automatically 7 days after creation or immediately upon PR merge/closure.
2. **Continuous Integration (`ci.yml`)**: Uses an ephemeral `postgres:16` service container on `localhost:5432` (`portfolio_ci`). CI execution consumes **0 bytes** of Neon free-tier storage and **0 seconds** of Neon compute.

## Connection URL Hygiene Architecture

Neon databases provide two distinct connection modes to isolate serverless application queries from database migration transactions:

```mermaid
flowchart TD
    App[Next.js Serverless Routes / App Runtime]
    PrismaCli[Prisma CLI / Release Gate / Migrations]
    PooledURL["DATABASE_URL (Pooled)"]
    DirectURL["DIRECT_URL (Unpooled)"]
    PgBouncer["Neon PgBouncer / WebSocket Adapter"]
    Compute["Neon Postgres Compute Engine"]

    App -->|Runtime Queries| PooledURL
    PooledURL --> PgBouncer
    PgBouncer --> Compute

    PrismaCli -->|DDL & Advisory Locks| DirectURL
    DirectURL --> Compute
```

### 1. Runtime Pooled Connection (`DATABASE_URL`)

- **Configuration**: Set in `DATABASE_URL` (and `POSTGRES_PRISMA_URL` / `POSTGRES_URL`).
- **Endpoint**: Transaction pooler endpoint (`ep-xxx-pooler.us-east-2.aws.neon.tech` or `@prisma/adapter-neon` over WebSockets via `ws`).
- **Usage**: Serverless API route handlers and server components (`lib/db.ts`).
- **Purpose**: Prevents connection exhaustion during traffic bursts by multiplexing client connections through PgBouncer.

### 2. Migration Direct Connection (`DIRECT_URL`)

- **Configuration**: Set in `DIRECT_URL` (and `DATABASE_URL_UNPOOLED` / `POSTGRES_URL_NON_POOLING`).
- **Endpoint**: Direct compute endpoint (`ep-xxx.us-east-2.aws.neon.tech`).
- **Usage**: Prisma CLI commands (`prisma migrate deploy`, `npx prisma migrate status`), release gate script (`scripts/release-gate.ts`), and schema drift checks (`npm run check:migrations:drift`).
- **Purpose**: Directly targets compute to execute PostgreSQL session-level advisory locks (`SELECT pg_advisory_lock(...)`) and schema DDL statements without PgBouncer session pooling timeouts (`P1002`).

## Cold-Start Protection & Upstash Read-Through Cache

To guarantee Neon compute remains suspended in zero-compute sleep states across public visitor traffic:

1. **Tier 1 (Static Edge Prerendering)**: Full-page editorial routes (case studies, dossier specs) use Next.js Incremental Static Regeneration (ISR) with `revalidate = 3600`. Static requests cost 0 database queries.
2. **Tier 2 (Upstash Redis Read-Through Cache)**: Dynamic data queries in `CaseStudyService` query Upstash Redis first with a 1-hour TTL. Only cache misses wake Neon Postgres.
3. **Write Buffering**: Visitor reactions and telemetry events are buffered in Upstash Redis (`HINCRBY`, `RPUSH`) rather than issuing immediate mutative SQL queries per request, and drained once daily by `/api/cron/maintenance`.

## Cleanup Governance & Candidate Status

No cloud mutations, drops, or deletions are executed by this inventory ticket. Zero deletion candidates are approved today:

- **Approved Candidates**: 0 targets.
- **Recoverable Capacity**: 0 MiB (unobserved locally without provider credentials).
- **Protected Targets**: `main` (production) and `dev` (integration) branches are strictly excluded from candidates.

### Operating Constraints & Approval Workflow

1. Obtain explicit operator sign-off with authenticated provider credentials before identifying any candidate target IDs in Neon Console or CLI.
2. Never delete `main` or `dev` branches under any circumstances.
3. Post-cleanup verification: Run `npm run check:migrations:drift` and verify HTTP 200 on `https://deruiter.dev/`.

## Verification Commands

```bash
# Run Neon capacity inventory verification
npx tsx scripts/neon-capacity-inventory.ts

# Export machine-readable JSON inventory
npx tsx scripts/neon-capacity-inventory.ts --json

# Display candidate list details
npx tsx scripts/neon-capacity-inventory.ts --candidates

# Run inventory via DX CLI
npm run dx inventory:neon
```
