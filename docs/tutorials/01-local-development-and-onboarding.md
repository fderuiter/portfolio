# Tutorial: Local Development & Onboarding

This is a learning-oriented walkthrough for getting a fresh clone of this
repository running locally, with a working database and a passing
verification gate. Follow it top to bottom the first time you set up the
project; once you're up and running, the [how-to guides](../how-to/) cover
specific recurring tasks instead.

## 1. Prerequisites

- **Node.js 22.x** (the sole supported runtime)
- **npm >= 10.0.0** (the sole supported package manager — bun, yarn, and
  pnpm are unsupported)
- A Postgres connection string (a free [Neon](https://neon.tech) serverless
  Postgres project works well for local development)

## 2. Install dependencies

```bash
npm install
```

`npm install` runs `npx prisma generate` automatically via a `postinstall`
hook, so the Prisma client is ready immediately — `npx tsc --noEmit` and
other type-checks work right after install with no extra step.

## 3. Configure your environment

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env.local
```

At minimum, set `DATABASE_URL` (your Neon/Postgres connection string).
`GITHUB_TOKEN` is optional but avoids GitHub API rate limits when the site
fetches live repository statistics.

Every environment variable this project reads is declared once in
[`lib/env.ts`](../../lib/env.ts) and mirrored in `.env.example`. Validate
your local file against that contract:

```bash
npm run env:check
```

If you need Clerk authentication configured for the admin surfaces, run the
interactive setup instead of hand-editing values:

```bash
npm run setup:clerk
```

## 4. Migrate the database with Prisma

Push the committed schema to your database:

```bash
npx prisma db push
```

Then seed it with the clinical-trial and schema-engine case study content:

```bash
npx prisma db seed
```

Schema changes in this repository always ship as a checked-in Prisma
migration — see
[how-to: add an API route and Zod contract](../how-to/add-api-route-and-zod-contract.md)
for the pattern most new routes follow, and `DATABASE_MIGRATIONS.md` at the
repository root for the full migration workflow, production rollout order,
and the one-time production baseline procedure.

## 5. Run the diagnostic doctor before writing code

Immediately after environment setup and database initialization, confirm
the workspace is healthy:

```bash
# Fast diagnostic pass over the architectural invariants
npm run doctor

# The full invariant verification suite (slower, more thorough)
npm run verify
```

`npm run doctor:fix` will auto-remediate the fixable subset (regenerating
`openapi.json` and TypeDoc markdown, for example) if this reports drift.

## 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Next.js 16 runs with
Turbopack and a concurrent TypeScript watcher, so type errors surface in
the terminal as you edit.

## 7. Run the full test suites

Before committing, run the checks a pre-commit hook and CI will also run:

```bash
npx tsc --noEmit          # type checking
npx eslint --no-warn-ignored .   # lint
npm run lint:boundaries   # deep-module / circular-dependency boundaries
npx vitest run            # unit, logic, and state-engine tests
```

Or run the composite pre-submission gate that CI mirrors exactly:

```bash
npm run quality
```

`npm run quality` runs `check` (typecheck + lint), `lint:docs`,
`check-docs-drift`, `bench:pages -- --assert`, and `verify` in sequence —
the same commands the `rigor-pipeline` GitHub Actions workflow runs against
every pull request.

## Next steps

- Adding a new HTTP endpoint? See
  [how-to: add an API route and Zod contract](../how-to/add-api-route-and-zod-contract.md).
- Wiring up transactional email or webhooks? See
  [how-to: configure Resend and webhooks](../how-to/configure-resend-and-webhooks.md).
- Setting up Clerk, Sentry, Upstash, Vercel Cron/Analytics, or GitHub data
  fetching? See
  [how-to: configure Clerk, Sentry, Upstash, Vercel Cron/Analytics, and GitHub data fetching](../how-to/configure-integrations.md),
  or the full per-environment fact table in the
  [integration catalog](../reference/integrations-catalog.md).
- Looking for the compiled `lib/`, `hooks/`, and `types/` API surface? See
  [reference/api](../reference/api/README.md).
- Curious about *why* the codebase is shaped the way it is? See
  [explanation](../explanation/README.md) and the Architecture Decision
  Records in `adr/` at the repository root.
