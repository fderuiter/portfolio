# Changelog

All notable changes to this project are documented in this file.

## [0.3.0] - 2026-09-13

### Added

- Protected build-once production release and non-production rollback-drill workflows, with migration replay, staged synthetic probes, immutable promotion evidence, and post-promotion tagging.
- A single authenticated daily maintenance pipeline for the Vercel Hobby cron allowance, covering telemetry and reaction-buffer draining, leased outbound-email retries, and transactional 30-day telemetry rollups.
- Durable daily telemetry aggregates through the additive `TelemetryDailyRollup` migration.
- Shared public-route registration for page benchmarking and service-worker precaching.

### Changed

- Reconciled the historical `dev` integration line into the `main` release line and adopted short-lived topic branches targeting `main`.
- Disabled automatic Vercel Git deployments so production changes only through the protected promotion workflow.
- Hardened outbound email recovery with optimistic row leases, a five-message daily maintenance batch, stable Resend idempotency keys, suppression rechecks, queue-health metrics, and jittered exponential backoff.
- Forced Preview and local development email delivery into a non-transmitting simulation mode.
- Expanded the offline shell to cover every registered public route while keeping online navigation on the network path.

### Fixed

- Removed environment-dependent test paths that could connect unit suites to an ambient live database.
- Replaced direct cron-secret string comparison with a fixed-length timing-safe digest comparison.
- Corrected the offline page so its copy and navigation behavior reflect the browser's actual connection state.
- Preserved buffered telemetry and reaction writes across concurrent or partially failed maintenance executions.

### Security

- Removed all stale audit exceptions after confirming the current dependency graph has zero reported vulnerabilities.
- Added owner and follow-up requirements for any future time-bounded audit exception.
