# Database migrations

Production schema changes use checked-in Prisma migrations. Do not use
`prisma db push` against production or any long-lived shared environment: it
changes the schema without adding an entry to Prisma's migration history.

## Normal workflow

1. Change `prisma/schema.prisma` on a disposable development database.
2. Create and review a migration with `npx prisma migrate dev --name <name>`.
3. Run `npm run check:migrations` and the test suite.
4. Commit the schema, migration SQL, and `migration_lock.toml` together.
5. Apply committed migrations in production with `prisma migrate deploy`.

CI checks that the schema provider matches the migration lock, replays every
migration on clean PostgreSQL, and compares the replayed database with
`schema.prisma`. A schema edit without equivalent migration SQL fails that
comparison. The one-time ledger baseline stays manual because it requires a
verified database target and restorable Neon branch or snapshot.

## One-time production baseline for 2026-08-14

The live database already contains the objects represented by
`20260417215437_init` and `20260528000000_add_telemetry_event`, but it has no
Prisma ledger. The migration `20260814000000_add_simulated_telemetry` is not
represented and must execute rather than be marked as applied.

Rehearse these steps on a restorable Neon branch or snapshot first. Use a
direct, non-pooled connection when Neon provides one. Never run `migrate
reset`, drop the schema, or baseline the third migration.

### Protect and inspect

1. Create a restorable Neon branch or snapshot.
2. Confirm the database identity without printing the connection string:

   ```sql
   SELECT current_database(), current_schema(), current_user;
   ```

3. Confirm `CaseStudy` and `TelemetryEvent` match the first two migration SQL
   files, `_prisma_migrations` is absent, four case studies remain, and
   `CaseStudy.simulated_telemetry` is absent.
4. Record checksums before changing the ledger:

   ```bash
   shasum -a 256 prisma/migrations/*/migration.sql
   ```

### Baseline and deploy

With `DATABASE_URL` explicitly set to the rehearsed target, run:

```bash
npx prisma migrate resolve --applied 20260417215437_init
npx prisma migrate resolve --applied 20260528000000_add_telemetry_event
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
```

The status between `resolve` and `deploy` must show only
`20260814000000_add_simulated_telemetry` as pending. Stop if it does not.

### Verify

Verify all of the following before triggering the Vercel deployment:

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM "_prisma_migrations"
ORDER BY started_at;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'CaseStudy'
  AND column_name = 'simulated_telemetry';

SELECT count(*) AS case_studies,
       count(*) FILTER (WHERE simulated_telemetry = false) AS defaulted_false
FROM "CaseStudy";
```

Expected results are three finished and non-rolled-back migrations, a
non-nullable Boolean column defaulting to `false`, and all four existing rows
preserved with `false`. Run `npx prisma migrate deploy` once more and confirm it
is a no-op. Then smoke-test the home page, case studies, telemetry endpoints,
and transparency routes.

## Release ordering

The current Vercel command deliberately compiles first and runs `migrate
deploy` afterward. Therefore every release must follow expand-and-contract:

1. Expand with backward-compatible, additive migration SQL.
2. Deploy code that tolerates both the old and expanded schema during build
   prerendering and rollout.
3. Backfill separately when needed.
4. Remove old fields only in a later release after all readers have moved.

Prisma serializes concurrent migration attempts with its PostgreSQL advisory
lock. If deployments move to a dedicated release job, keep a single migration
runner and make application deployment depend on its success.

Never automate `migrate resolve`; it is a one-time recovery operation that
requires a verified schema comparison and a restorable snapshot.
