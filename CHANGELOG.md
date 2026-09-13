# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-09-13

First release cut under [ADR 0037](adr/0037-controlled-integration-and-release-deployments.md),
which makes `main` the sole long-lived integration and production branch. This
release reconciles 74 commits of `dev` work into `main`; the version jumps from
`0.1.0` because no `0.2.0` was ever tagged.

### Database

Two migrations ship with this release and were applied to production before the
deployment, in the expand order they were authored:

- `20261015000000_add_email_resilience` — adds `SuppressionList` and
  `OutboundEmailQueue`.
- `20261016000000_enforce_email_contracts` — adds the `SuppressionReason` and
  `OutboundEmailStatus` enums and constrains the columns above to them.
- `20261016000001_telemetry_daily_rollup` — adds the additive
  `TelemetryDailyRollup` aggregate table.

All three are additive and backward compatible with the previously deployed
application.

### Added

- Protected build-once production release and non-production rollback-drill
  workflows, with migration replay, staged synthetic probes, immutable
  promotion evidence, and post-promotion tagging.
- A single authenticated daily maintenance pipeline for the Vercel Hobby cron
  allowance, covering telemetry and reaction-buffer draining, leased outbound-
  email retries, and transactional 30-day telemetry rollups.
- Durable daily telemetry aggregates through the additive `TelemetryDailyRollup`
  migration.
- Shared public-route registration for page benchmarking and service-worker
  precaching.
- Redis read-through compute shield for case studies, with a buffered reaction
  write path that keeps visitor interactions off Neon's serverless compute.
- Explainable grouped AND/OR discrepancy checks in the CRF designer.
- Local draft recovery, restoring an in-progress study after a refresh.
- Doctor-native ADR invariant suite wired into CI verification.
- Agent runtime preflight check.
- Curated featured project previews and a reworked homepage editorial hierarchy.
- Standardized canvas arcade engine event bridge with modal pause handling.
- Fog-state prioritized gesture isolation in the Garmin simulator.
- Integration catalog with setup, verification and recovery guidance.

### Changed

- Reconciled the historical `dev` integration line into the `main` release
  line and adopted short-lived topic branches targeting `main`.
- Disabled automatic Vercel Git deployments so production changes only through
  the protected promotion workflow.
- Hardened outbound email recovery with optimistic row leases, a five-message
  daily maintenance batch, stable Resend idempotency keys, suppression
  rechecks, queue-health metrics, and jittered exponential backoff.
- Forced Preview and local development email delivery into a non-transmitting
  simulation mode.
- Expanded the offline shell to cover every registered public route while
  keeping online navigation on the network path.
- Documentation reorganized into a Diátaxis structure per ADR 0023.
- Arcade state transitions for `GarminWatchSimulator` and `WorkingWithDuck`
  routed through a single gateway each.
- README roadmap replaced with the current epic structure.
- Synthetic probes moved from a 30-minute cadence to daily.
- Documented Node.js support as a range rather than a pinned 22.x.
- CI runs on Node.js 24; Vercel deploys only `main`.

### Fixed

- Removed environment-dependent test paths that could connect unit suites to
  an ambient live database.
- Replaced direct cron-secret string comparison with a fixed-length
  timing-safe digest comparison.
- Corrected the offline page so its copy and navigation behavior reflect the
  browser's actual connection state.
- Preserved buffered telemetry and reaction writes across concurrent or
  partially failed maintenance executions.
- Reaction write-buffer durability: buffered reactions now drain to Postgres
  on the daily maintenance pass instead of accumulating in Redis unbounded.
- Reaction flush idempotency: a replayed batch can no longer double-insert
  rows or double-decrement the buffer.
- Offline safety: cache reads, writes and eviction consult Upstash
  configuration before issuing a request.
- Design manifest generation reproduces its committed output byte for byte,
  so builds no longer dirty the tree or fail the documentation drift gate.
- CI typechecks with the compiler pinned in `package-lock.json` rather than
  the runner image's global TypeScript.
- CI verifies architectural invariants after the build and benchmark phases
  that produce the evidence those invariants assert against.
- CI builds through `npm run build`, the entrypoint Vercel runs, which pins
  `next build --webpack`. `npx next build` defaults to Turbopack on Next 16
  and never completes for this application; it was cancelled at 41m47s.
- CI unit tests no longer receive the Postgres service container's DSN. Four
  suites skip their `@/lib/db` mock whenever `DATABASE_URL` names a non-dummy
  host, and the real client is `@neondatabase/serverless` over a WebSocket,
  which a stock Postgres server cannot answer. The container remains for the
  Prisma CLI steps, which use the native migration engine.
- `lib/security.ts` no longer treats `CI=true` as a build phase, which had
  disabled the fail-closed `CRON_SECRET` guard on every CI runner.
- Sentry honours the sampling and noise bounds ADR 0036 documents: traces are
  sampled at zero outside production and capped at 5% within it, and benign
  client noise is dropped before send.
- Outbound email preserves queued tags and no longer reports unpersisted
  retries.
- Upstash rate limiting isolated, with bounded behaviour during an outage.
- Two Playwright suites no longer point at a port nothing serves, and the CI
  worker count was raised so the suite can finish inside its job timeout.
- The telemetry synthetic probe asserts the status codes `POST
  /api/telemetry` actually returns (201/202), not a 200 it never sends.
- Eliminated `any` from production code paths.

### Removed

- The automated `dev` rebase workflow, superseded by ADR 0037.
- Orphaned `portfolio/` and `app/core/` directories.

### Security

- Removed all stale audit exceptions after confirming the current dependency
  graph has zero reported vulnerabilities.
- Added owner and follow-up requirements for any future time-bounded audit
  exception.

[0.3.0]: https://github.com/fderuiter/portfolio/compare/v0.1.0...v0.3.0
