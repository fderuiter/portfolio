# Portfolio Database & Migration Management

The schema migration, database baseline, and runtime connection topology for the serverless portfolio application.

## Language

**Migration Ledger**:
The `_prisma_migrations` table in PostgreSQL recording applied migration metadata, checksums, and completion timestamps.
_Avoid_: Migration history, migration log, schema state

**Baseline**:
The registration of pre-existing database objects into the Migration Ledger via `prisma migrate resolve --applied` without re-executing their DDL.
_Avoid_: Db push, manual sync, seed override

**Expand-and-Contract**:
A phased release methodology where backward-compatible schema additions deploy prior to dependent application readers, and destructive removals occur in subsequent releases.
_Avoid_: Monolithic migration, breaking deployment

**Pre-Build Migration Runner**:
The deployment pipeline phase (Phase 1.5) executing migrations prior to Next.js static site generation to guarantee schema availability during build-time page prerendering.
_Avoid_: Post-build migration, runtime migration

**Destructive Migration Guard**:
An automated static analyzer (`scripts/check-migrations.js`) that blocks migration files containing `DROP TABLE` or `DROP COLUMN` unless overridden by an explicit environment flag.
_Avoid_: DDL lint, schema scanner

## Example Dialogue

> **Dev**: "Can we run `prisma db push` to push the new `simulated_telemetry` column to production?"
>
> **Tech Lead**: "No. All production schema modifications must be recorded in the **Migration Ledger** via checked-in migrations. For the existing tables, we perform a one-time **Baseline** using `prisma migrate resolve --applied` on Neon, and let the **Pre-Build Migration Runner** apply the new column before Next.js prerenders static pages. Every release follows **Expand-and-Contract**, backed by the **Destructive Migration Guard**."
