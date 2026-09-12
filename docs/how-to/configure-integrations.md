# How-To: Configure Clerk, Sentry, Upstash, Vercel Cron/Analytics, and GitHub Data Fetching

Goal: set up, verify, and recover each of this project's remaining external
integrations that aren't already covered by a dedicated guide. For Neon/
Prisma and the database itself, see
[tutorial: local development & onboarding](../tutorials/01-local-development-and-onboarding.md)
and [`DATABASE_MIGRATIONS.md`](../../DATABASE_MIGRATIONS.md). For Resend and
its deliverability webhook, see
[how-to: configure Resend and webhooks](configure-resend-and-webhooks.md).
See [reference: integration catalog](../reference/integrations-catalog.md)
for the per-environment fact table (credential scope, quotas, missing-service
behavior) this guide doesn't repeat.

Every environment variable named below is declared once in
[`lib/env.ts`](../../lib/env.ts) and mirrored in `.env.example`. After
changing any of them, run:

```bash
npm run env:check
```

This is a **secret-safe preflight**: it checks that every declared key in
`lib/env.ts` exists in `.env.example` and that your current environment
matches the schema's types — it never opens a network connection to any
provider, never mutates one, and never reports a simulated result as a live
success. It will not tell you whether a credential is *valid*, only whether
one is present and correctly shaped.

## Clerk (admin authentication)

### Setup

```bash
npm run setup:clerk
```

This runs `scripts/setup-clerk-wizard.sh`, an interactive helper that walks
through creating `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and
the `ADMIN_USER_IDS`/`ADMIN_EMAILS` allowlist in `.env.local`. See
[ADR 0014](../../adr/0014-clerk-auth-admin-portal.md) for why the admin
surface is gated this way, and
[`lib/auth/admin.ts`](../../lib/auth/admin.ts) for the authorization
contract itself: `ADMIN_USER_IDS` matches on exact Clerk user ID,
`ADMIN_EMAILS` matches only against an email address Clerk reports as
`verification.status === "verified"` — an unverified address on the account
never grants access, regardless of whether the string matches.

### Verification

- With no allowlist configured at all, `/admin` must show the access-denied
  view for any signed-in user — this is the default-closed behavior, not a
  bug.
- `__tests__/clerk-auth-middleware.test.ts` exercises the full authorization
  contract (verified/unverified/absent verification, denied identity,
  missing allowlist, mismatched identity, and a simulated Clerk provider
  failure) against synthetic Clerk objects — run it directly when changing
  anything in `lib/auth/admin.ts`:

  ```bash
  npx vitest run __tests__/clerk-auth-middleware.test.ts
  ```

- `proxy.ts` (Next.js 16's replacement for `middleware.ts` — see
  [ADR 0013](../../adr/0013-next16-proxy-migration-and-ssg-telemetry-resilience.md))
  protects `/admin(.*)` and `/api/admin(.*)` via `clerkMiddleware`/
  `createRouteMatcher`; confirm any new admin route falls under one of those
  matchers rather than relying on a page-level check alone.

### Troubleshooting & recovery

- **Every user sees "access denied" including the intended admin**: check
  that `ADMIN_USER_IDS`/`ADMIN_EMAILS` are set in the environment the app is
  actually running in (local `.env.local` vs. the deployed environment's
  variables are separate) and that the matching email is verified in Clerk's
  own dashboard for that user.
- **Locked out of the only configured admin identity**: `ADMIN_USER_IDS`/
  `ADMIN_EMAILS` are plain environment variables, not stored in Clerk —
  recovery is updating the deployment's environment variables directly
  (Vercel project settings), no Clerk-side action needed.
- **Clerk backend API unavailable**: `isCurrentUserAdmin()` catches any
  thrown error from `currentUser()`/`auth()` and returns `false` (fails
  closed) rather than throwing — a Clerk outage denies admin access rather
  than granting it or crashing the request.

## Sentry (error monitoring)

### Setup

Set `SENTRY_DSN` (or leave unset locally), plus `SENTRY_ORG`/`SENTRY_PROJECT`
if you use Sentry's build-time source-map upload. `NEXT_PUBLIC_SENTRY_DSN` is
the client-side counterpart read by
[`instrumentation-client.ts`](../../instrumentation-client.ts).

There are three separate Sentry init points, matching the three Next.js
runtimes:

- [`sentry.server.config.ts`](../../sentry.server.config.ts) — Node.js
  server runtime.
- [`sentry.edge.config.ts`](../../sentry.edge.config.ts) — Edge runtime
  (e.g. `proxy.ts`).
- [`instrumentation-client.ts`](../../instrumentation-client.ts) /
  `lib/client-sentry.ts` — browser runtime, initialized lazily on first
  navigation rather than eagerly at module load.

### Verification

- With `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` unset, both server configs fall
  back to a dummy DSN (`https://dummy@o0.ingest.sentry.io/0`) — Sentry's SDK
  accepts this and silently drops every event rather than throwing, so a
  missing DSN never breaks a request. This means "no errors show up in
  Sentry" is not by itself proof the app is healthy in an environment
  without a real DSN configured — check the deployment's own logs too.
- `sentry.server.config.ts`'s `beforeSend` deliberately discards simulated
  `GameEngineException` errors (from the arcade game engines) — an
  intentional filter, not a bug, if you're trying to confirm a *different*
  error type reaches Sentry.

### Troubleshooting & recovery

- **Real errors not appearing in the Sentry dashboard**: confirm
  `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` are set in the deployment's actual
  environment variables (not just locally), and that they aren't still
  pointing at the dummy fallback value.
- **No recovery action needed for a Sentry outage**: every call site uses
  `Sentry.captureException` as a side effect alongside its own
  `console.error`/structured response — a Sentry-side outage does not by
  itself block any request path in this codebase.

## Upstash Redis

### Setup

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from an Upstash
Redis database's REST API credentials (Upstash's free tier is REST-only,
which is why this project uses `@upstash/redis` rather than a raw TCP Redis
client — see [`lib/redis.ts`](../../lib/redis.ts)).

### Verification

Upstash's dashboard exposes a request/latency graph per database; after
triggering telemetry ingestion locally, confirm requests appear there. There
is no bundled CLI ping script in this repository today — the fastest local
check is exercising `/api/telemetry` directly:

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"eventType": "page_view", "path": "/"}'
```

then confirm the Upstash dashboard shows the write.

### Troubleshooting & recovery

- **Redis unreachable / unconfigured**: `lib/redis.ts` falls back to
  `http://localhost:8079` with a placeholder token when the env vars are
  unset — this is not a running service in most environments, so any code
  path depending on it must handle the resulting connection failure rather
  than assume Redis is always present.
- **Buffered telemetry events never reach Postgres**: check the Vercel Cron
  job (`/api/telemetry/sync`, see below) is actually firing — buffered
  events sit in Redis until that route drains them, they are not written to
  Postgres directly on ingestion.

## Vercel Hosting, Cron, and Analytics

### Setup

- **Hosting**: connect the repository to a Vercel project; `vercel.json` at
  the repository root declares `buildCommand`/`installCommand` and the cron
  schedule below. There is no dedicated setup script for this — it's a
  one-time dashboard action per Vercel's own
  [Git integration docs](https://vercel.com/docs/git).
- **Cron**: `vercel.json` schedules `GET /api/telemetry/sync` daily
  (`0 0 * * *`). Vercel signs every cron invocation with an
  `Authorization: Bearer <CRON_SECRET>` header matching the `CRON_SECRET`
  environment variable configured on the project (see
  [Vercel Cron Jobs docs](https://vercel.com/docs/cron-jobs)) — set
  `CRON_SECRET` in the Vercel project's environment variables to any strong
  random value.
- **Analytics**: `@vercel/analytics/next`'s `<Analytics />` component is
  already mounted in [`app/layout.tsx`](../../app/layout.tsx); Vercel
  Analytics requires no additional environment variable, only that
  Analytics is enabled for the project in the Vercel dashboard.

### Verification

- **Cron**: `lib/security.ts`'s `validateSyncRequest` fails closed (401) in
  any non-development environment when `CRON_SECRET` is unset, and rejects
  any request whose `Authorization` header doesn't match — the fastest local
  verification is calling the route with and without the header:

  ```bash
  # Unauthenticated (expected to fail once CRON_SECRET is set and NODE_ENV isn't development)
  curl -i http://localhost:3000/api/telemetry/sync

  # Authenticated
  curl -i http://localhost:3000/api/telemetry/sync \
    -H "Authorization: Bearer $CRON_SECRET"
  ```

- **Analytics**: confirm data appears in the Vercel dashboard's Analytics
  tab after visiting pages on a real (non-local) deployment — Vercel
  Analytics does not report from `next dev`.

### Troubleshooting & recovery

- **Cron job stops running**: check the Vercel dashboard's Cron Jobs tab for
  the job's execution history and last status; Vercel disables a project's
  cron jobs entirely if the project moves off a plan that supports the
  configured schedule frequency — confirm the current Hobby-plan cron limits
  at [vercel.com/docs/cron-jobs/usage-and-pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)
  before assuming a code regression.
  A missed sync is recoverable without code changes: the buffered events
  remain in Upstash until the next successful sync drains them (bounded by
  Upstash's own retention for the plan in use).
- **`CRON_SECRET` rotated**: update it in the Vercel project's environment
  variables — there is no overlap window, so the change takes effect on the
  next deployment/cron invocation with no code change required.

## GitHub data fetching

### Setup

`GITHUB_TOKEN` is optional. Without it, [`lib/github.ts`](../../lib/github.ts)
calls GitHub's REST API unauthenticated, which GitHub rate-limits to 60
requests/hour per source IP (see
[GitHub's REST API rate-limit docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)).
Setting `GITHUB_TOKEN` to a fine-grained personal access token with public
read-only scope raises this to 5,000 requests/hour — no elevated
permissions are required, since every call this codebase makes is a
read-only public-repository fetch.

### Verification

`lib/github.ts` uses Next.js's `unstable_cache`/`fetch` revalidation
(`next: { revalidate: 3600 }`), so a live check means either waiting out the
hour-long cache window or restarting the dev server, then confirming a case
study page's commit-activity graph reflects real GitHub data rather than the
simulated sine-wave fallback (`generateMockCommitActivity`).

### Troubleshooting & recovery

- **Stats look like a smooth sine wave instead of real activity**: this is
  the intentional fallback for a 403 (unauthenticated rate limit) or 404
  (private/unreleased repository) response — not a bug. Set `GITHUB_TOKEN`
  or wait for the rate-limit window to reset.
- **Build fails because of a GitHub API error**: it shouldn't —
  `lib/github.ts` treats 403/404 as expected offline/build conditions and
  falls back to simulated data specifically so a rate limit never fails a
  static build. If a build does fail here, that's a regression in the
  fallback path itself, not an infrastructure problem to work around.
