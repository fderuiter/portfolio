# Release and Deployment Workflow

Last reconciled: 2026-09-24. Governed by
[ADR 0049](../../adr/0049-deploy-main-on-green-ci.md).

**In one line:** open a PR, let CI go green, squash-merge it. Vercel deploys
`main` itself.

## The Flow

1. Branch from `main` with an allowed prefix (`feat/`, `fix/`, `chore/`,
   `docs/`, `dx/`, `refactor/`, `perf/`, `test/`), commit with Conventional
   Commits, and open a pull request into `main`.
2. CI (`.github/workflows/ci.yml`) runs on the PR. Merge only when
   **Merge Gate (Required Checks Summary)** is green.
3. The merge pushes to `main`. Two things start at once:
   - CI runs on the `main` commit in GitHub;
   - Vercel builds the same commit with the production secrets it holds.
4. The Vercel build applies pending migrations through the unpooled Neon
   endpoint, then compiles the site. If either step fails, nothing goes live.
5. Vercel waits for **Merge Gate** on that commit (Deployment Checks), then
   points `deruiter.dev` at the new deployment.

Everything about production lives in Vercel. GitHub holds no deploy secrets.

## Buttons

| Situation | Do this |
| --- | --- |
| Production is broken after a deploy | Vercel dashboard, Deployments, **Instant Rollback** to the previous production deployment. Then open a `fix/` PR. |
| A build failed for a transient reason | Vercel dashboard, the failed `main` deployment, **Redeploy**. |
| A deployment is built but not live | Its Deployment Check is waiting on CI, or CI failed. Fix forward with a new PR. |

**Redeploy** rebuilds the commit it is pressed on. Pressing it on the live
deployment does not ship `main`.

## One-Time Setup

In the Vercel dashboard for the `portfolio` project:

1. **Settings, Git:** confirm the production branch is `main`.
   `vercel.json` already enables Git deployments for `main` only.
2. **Settings, Deployment Checks:** add the GitHub check
   **Merge Gate (Required Checks Summary)** so production waits for CI.
3. **Settings, Environment Variables:** set what
   [Environment Variables](#environment-variables) marks Required for
   Production. The build itself needs only the two Neon URLs, to migrate and
   to prerender real content; the rest are read by the running site.

Recommended repository settings, available now that the repository is public:
a ruleset on `main` that requires pull requests and the **Merge Gate**
status check.

## Environment Variables

Every variable declared in `serverEnvSchema` or `clientEnvSchema` in
[`lib/env.ts`](../../lib/env.ts) is listed below, plus the few that only the
build or Vercel reads. `__tests__/deploy-env-matrix.test.ts` fails when this
table and the schema disagree, so add a row in the same PR that adds a
variable.

**What each class means:**

- **Required**: production misbehaves without it. The build fails, cron is
  rejected, or pages return errors.
- **Optional**: the feature it names degrades as described and the rest of the
  site keeps working.
- **Integration**: a Vercel marketplace integration provisions it. Leave it
  in place, but no code in this repository reads it.
- **Platform**: Next.js, Vercel, Node or the test runner sets it. Never set it
  by hand in Vercel.

**What the scope means:** the Vercel environments the variable should be set
in. Preview must never hold a production credential: set a separate,
non-production value there or leave it unset (see #1024). **None** means the
variable is not set in Vercel at all.

**Build versus runtime:** only `DATABASE_URL_UNPOOLED` is needed for the
production build to migrate, and `DATABASE_URL` for it to prerender real
content rather than fail. Everything else is read by the running site.

### Neon and Prisma

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Required | Production, Preview | Pooled endpoint for the running app and prerendering. Provisioned by the Neon integration. |
| `DATABASE_URL_UNPOOLED` | Required | Production, Preview | Direct endpoint. `scripts/build.js` migrates through it on production builds and stops the build if it is missing. |
| `DIRECT_URL` | Platform | None | `scripts/build.js` derives it from `DATABASE_URL_UNPOOLED`. Set it locally only. |
| `PGHOST` | Integration | Production, Preview | Neon alias; unused. |
| `PGHOST_UNPOOLED` | Integration | Production, Preview | Neon alias; unused. |
| `PGUSER` | Integration | Production, Preview | Neon alias; unused. |
| `PGDATABASE` | Integration | Production, Preview | Neon alias; unused. |
| `PGPASSWORD` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_URL` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_URL_NON_POOLING` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_USER` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_HOST` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_PASSWORD` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_DATABASE` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_URL_NO_SSL` | Integration | Production, Preview | Neon alias; unused. |
| `POSTGRES_PRISMA_URL` | Integration | Production, Preview | Neon alias; unused. |

### Upstash Redis

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | Required | Production, Preview | Without it rate limits are per-instance and in memory, and telemetry is not buffered. |
| `UPSTASH_REDIS_REST_TOKEN` | Required | Production, Preview | Pairs with the URL. |
| `UPSTASH_REDIS_KEY_PREFIX` | Optional | Production | Key namespace. Unset means unprefixed in Production and `preview:` in Preview. Changing it strands any undrained telemetry under the old prefix. |

The Upstash integration also provisions `KV_*` and `REDIS_URL`. No code reads
them.

### Clerk (admin area only)

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Optional | Production | Needed only for `/admin`. The rest of the site never loads Clerk. |
| `CLERK_SECRET_KEY` | Optional | Production | Needed only for `/admin`. Read by the Clerk SDK. |
| `ADMIN_USER_IDS` | Optional | Production | Admin allowlist. With this and `ADMIN_EMAILS` both empty, admin access is closed. |
| `ADMIN_EMAILS` | Optional | Production | Admin allowlist, by email. |

### Resend

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Optional | Production | Unset means email delivery is simulated and nothing is sent. |
| `RESEND_WEBHOOK_SECRET` | Optional | Production | Unset means every Resend webhook is rejected, so bounces are not recorded. |
| `RESEND_FROM_EMAIL` | Optional | Production | Defaults to `notifications@deruiter.dev`. |
| `CONTACT_NOTIFICATION_EMAIL` | Optional | Production | Recipient for contact-form notifications. Has a default. |

### Sentry

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Production | The only DSN. Server, edge and browser all read it. Unset means events are dropped. |
| `SENTRY_ORG` | Optional | Production | Source-map upload only. |
| `SENTRY_PROJECT` | Optional | Production | Source-map upload only. |
| `SENTRY_AUTH_TOKEN` | Optional | Production | Source-map upload only. Read by the Sentry build plugin, not by `lib/env.ts`. |

### Vercel Blob, cron and GitHub

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Optional | Production | Admin media uploads only. |
| `CRON_SECRET` | Required | Production | `/api/cron/maintenance` returns 401 without it, so the nightly job never runs. |
| `GITHUB_TOKEN` | Optional | None | Raises the GitHub API rate limit. Unset means simulated stats when rate-limited. |

### Canonical URL

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Optional | None | Leave unset in Production: it falls back to `https://deruiter.dev`. If set, it must be exactly that. |

### Build and runtime platform

| Variable | Class | Vercel scope | Notes |
| --- | --- | --- | --- |
| `NODE_OPTIONS` | Required | Production | Must contain `--experimental-require-module`, which lets the server load the ESM-only dependency under `isomorphic-dompurify`. Without it server-rendered routes return 500 (#995). |
| `NODE_ENV` | Platform | None | Set by Next.js. |
| `VERCEL` | Platform | None | Set by Vercel on its builds. |
| `VERCEL_ENV` | Platform | None | Set by Vercel. Gates migrations and production-only behaviour. |
| `NEXT_PHASE` | Platform | None | Set by Next.js while prerendering. |
| `NEXT_RUNTIME` | Platform | None | Set by Next.js. |
| `SKIP_DB_HEALTH_CHECK` | Platform | None | Set by `scripts/build.js`. |
| `WS_NO_BUFFER_UTIL` | Platform | None | Set by `lib/env.ts` and `scripts/build.js`. |
| `WS_NO_UTF_8_VALIDATE` | Platform | None | Set by `lib/env.ts` and `scripts/build.js`. |
| `CI` | Platform | None | Set by the CI runner. |
| `GITHUB_ACTIONS` | Platform | None | Set by GitHub Actions. |
| `VITEST` | Platform | None | Set by Vitest. |
| `PLAYWRIGHT_TEST` | Platform | None | Set by the end-to-end harness. |
| `ALLOW_FALLBACK_PRODUCTION_BUILD` | Optional | None | Emergency override that lets a build ship fallback content. Set it for one build only, then remove it. |
| `ALLOW_DESTRUCTIVE_MIGRATIONS` | Optional | None | Emergency override for the migration safety check. Set it for one build only, then remove it. |

The QStash integration provisions `QSTASH_*`. No code reads them yet.

### Keeping secrets in Vercel

- Anything prefixed `NEXT_PUBLIC_` is compiled into the JavaScript every visitor
  downloads. Only the Clerk publishable key, the Sentry DSN and the canonical
  URL may carry that prefix. Never give a secret a `NEXT_PUBLIC_` name.
- Mark every other value Sensitive in Vercel and keep it there. Do not copy
  Sensitive values into GitHub secrets, `.env.example`, issues or logs. GitHub
  holds no deploy secrets (ADR 0049).

## Rules That Keep This Safe

- **Migrations ship on merge, before CI on `main` finishes.** Every migration
  must be expand/contract: the live app and the new app must both work against
  the migrated schema. Never drop or rename a column in the same PR that stops
  using it.
- **Hold work back with a flag, not by leaving it unmerged for days.**
- **Database recovery is roll-forward.** Add a new migration through a normal
  PR. Restore from a Neon backup only for confirmed data loss.
- **Previews are off.** `vercel.json` disables Git deployments for every
  branch except `main` to protect build-hour and storage quota. Preview builds
  never migrate even if one is started by hand.

## Production Configuration Preflight

A Vercel production build checks its own configuration before it does
anything else. `scripts/build.js` runs
[`scripts/vercel-production-preflight.js`](../../scripts/vercel-production-preflight.js)
only when `VERCEL=1` and `VERCEL_ENV=production`. Local, CI and preview builds
skip it. It runs before the build substitutes offline dummy values and before
migrations, so a missing variable can't be masked by a fallback or leave a
half-migrated schema.

**Checks that fail the build:**

- **Always required:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `CRON_SECRET`,
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `NODE_OPTIONS`.
- **Required once a feature is configured:**
  - Setting `ADMIN_USER_IDS`, `ADMIN_EMAILS` or either Clerk key turns on the
    admin area, which then needs both Clerk keys.
  - Setting any of `SENTRY_ORG`, `SENTRY_PROJECT` or `SENTRY_AUTH_TOKEN` turns
    on source-map upload, which then needs all three.
- **Unsafe values:**
  - A database URL whose protocol isn't `postgres:` or `postgresql:`, or that
    points at localhost.
  - An Upstash URL that isn't `https://`.
  - `NODE_OPTIONS` without `--experimental-require-module`.
  - A Clerk `sk_test_` or `pk_test_` key.
  - A `NEXT_PUBLIC_APP_URL` other than `https://deruiter.dev`. Unset is fine.
  - A value containing a placeholder marker such as `dummy`, `example` or
    `placeholder`.

**Optional:** an unset `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`,
`NEXT_PUBLIC_SENTRY_DSN` or `BLOB_READ_WRITE_TOKEN` prints a note naming the
degraded feature. It doesn't fail the build.

The preflight prints variable names and reasons, never values.

**When it fails:** the build log lists every problem at once, as
`- NAME reason.` The live deployment keeps serving. To fix it:

1. In Vercel, open **Settings, Environment Variables** and correct each named
   variable for **Production**.
2. Open the newest failed `main` deployment and press **Redeploy**. It
   rebuilds that commit with the corrected variables. Use it only when that
   commit is still the tip of `main`; otherwise merge the next PR.
3. If the preflight itself is wrong, fix it with a `fix/` PR. It has no
   override variable.

## Capacity

Vercel Hobby limits build hours and Functions storage. The last readings
(2026-09-12) were 87/100 build hours and 9.68/10 GB Functions Storage. Each
merge to `main` costs one Vercel build. If a build fails with a quota error,
check Vercel Usage before retrying.
