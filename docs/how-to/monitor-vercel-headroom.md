# How-to: Monitor Vercel Storage and Build Headroom

Last verified: 2026-09-12 against `dev` under the Vercel Hobby plan.
Governing policy: [ADR 0036](../../adr/0036-free-tier-offloading-and-provider-quota-governance.md), [Issue #691](https://github.com/fderuiter/portfolio/issues/691), and [Issue #698](https://github.com/fderuiter/portfolio/issues/698).

This guide documents how operators monitor Vercel Hobby storage and build hour meters, evaluate warning and critical headroom thresholds, respond to capacity alerts, and review the multi-provider free-tier budget ledger without paid add-ons (Log Drains, Spend Management, or Pro subscriptions).

---

## 1. Quick Inspection CLI

To evaluate current headroom status, active alerts, and multi-provider budgets from the terminal:

```bash
# Standard status check and active threshold alerts
npm run headroom:vercel

# Machine-readable JSON output for CI and agent automation
npm run headroom:vercel -- --json

# Complete extensible multi-provider free-tier budget ledger
npm run headroom:vercel -- --ledger

# Strict gate (fails with exit code 1 on active critical alerts)
npm run headroom:vercel -- --strict
```

Or invoke directly via DX suite:

```bash
npx tsx scripts/dx.ts headroom:vercel [--json] [--ledger] [--strict]
```

---

## 2. Operating Bounds & Threshold Definitions

Under the Vercel Hobby plan, resources are shared across all projects within the team account. We enforce three standard operating zones:

| Metric | Free Tier Allowance | Warning Threshold (80%) | Critical Threshold (95%) | Observed Baseline (2026-09-12) |
| --- | --- | --- | --- | --- |
| **Functions Storage** | 10.0 GB | 8.0 GB (2.0 GB headroom) | 9.5 GB (0.5 GB headroom) | **9.60 GB (96.0%, 0.40 GB / 4.0% headroom)** — **CRITICAL** |
| **Deployment Storage** | 10.0 GB | 8.0 GB (2.0 GB headroom) | 9.5 GB (0.5 GB headroom) | **5.85 GB (58.5%, 4.15 GB / 41.5% headroom)** — **HEALTHY** |
| **Build Time** | 100.0 hours | 80.0 hours (20.0 hrs headroom) | 95.0 hours (5.0 hrs headroom) | **86.0 hours (86.0%, 14.0 hrs / 14.0% headroom)** — **WARNING** |
| **Deployment Rate** | 100 deploys/day | 80 deploys/day | 95 deploys/day | **Unknown** (public API limitation) |

### Headroom Severities
- **Healthy**: Resource usage is below 80% with ample operating runway.
- **Warning**: Resource usage has reached or exceeded 80%. Headroom is approaching operational boundaries. Non-blocking warning logged.
- **Critical**: Resource usage has reached or exceeded 95% (< 5% headroom remaining). Immediate operator intervention is required to avoid deployment rejections or failed builds.
- **Stale**: The latest recorded measurement is older than the configured threshold (default 30 days). Evaluator flags measurement staleness rather than reporting zero or healthy.
- **Unreadable**: The provider meter could not be read or returned null/malformed data. Defensively reported as unreadable/unknown, **never** assumed to be zero.

---

## 3. Incident Runbooks by Alert Type

### Runbook A: Critical Functions Storage Alert (< 5% Headroom)

When Functions Storage enters `[CRITICAL]` status (as observed on 2026-09-12 at 9.6/10 GB):

1. **Verify Candidate Inventory**:
   Run the retention inventory inspection command:
   ```bash
   npm run inventory:vercel -- --candidates
   ```
   Reference the complete audited deployment candidate list in [Reference: Vercel retention inventory](../reference/vercel-retention-inventory.md).
2. **Confirm Protected Targets**:
   Verify that active production (`dpl_3VVso5GPXhpejKjb5wGRFszJABfa`), dev (`dpl_UjoKTURkgG7fooX9DVM84qkUBERZ`), PR #687 review (`dpl_5jnmgXBHz9xmdeKvrJq2rKvwhZ4c`), and wedding production (`dpl_7aFUEAbwXRfddKE9EUvbyNLZTYxA`) remain excluded from candidate pools.
3. **Execute Operator-Gated Cleanup**:
   Present candidate list for human operator authorization under [Issue #692](https://github.com/fderuiter/portfolio/issues/692).
   Execute preview candidate purges first (19 portfolio + 2 wedding candidates) to recover headroom without touching production history.
4. **Reconcile Storage Meter**:
   Allow 24 hours for Vercel's asynchronous billing meter to process deleted Lambda bundle artifacts. Re-run `npm run headroom:vercel` to confirm recovery.

### Runbook B: Warning Build Time Alert (< 20% Headroom)

When Build Time enters `[WARNING]` status (as observed on 2026-09-12 at 86/100 hours):

1. **Audit Branch Build Triggers**:
   Ensure documentation-only PRs and scratch work do not trigger unnecessary Vercel preview builds. Use git commit prefixes or Vercel Ignored Build Step script:
   ```bash
   # In Vercel Project Settings > Git > Ignored Build Step
   # Skip build if only markdown, tests, or docs changed
   npx tsx scripts/validate-commit.ts --filter
   ```
2. **Preserve Next.js Build Cache**:
   Ensure `.next/cache` is properly restored across CI and Vercel builds so incremental compilation avoids redundant bundling.
3. **Pace Release Deployments**:
   Batch minor non-critical feature merges into consolidated releases on `dev` rather than triggering individual builds for single-line changes.

### Runbook C: Stale or Unreadable Meter Alert

When meter status is flagged as `[STALE]` or `[UNREADABLE]`:

1. **Never Assume Zero**: The system purposefully refuses to treat missing or stale measurements as 0 GB.
2. **Perform Manual Dashboard Verification**:
   Navigate to Vercel Team Dashboard:
   - URL: `https://vercel.com/dashboard/usage`
   - Scope: Select **All Projects** and set timeframe to **Last 30 Days**.
   - Note the exact meter values for **Functions Storage (GB)**, **Deployment Storage (GB)**, and **Build Time (hours)**.
3. **Refresh Audited Sample Data**:
   Update `scripts/vercel-retention-inventory.ts` with the refreshed authoritative timestamp and readings, and verify with `npm test -- __tests__/vercel-headroom.test.ts`.

---

## 4. Multi-Provider Free-Tier Budget Ledger

To protect all supporting integrations against unexpected quota exhaustion or surprise billing, the platform tracks an extensible free-tier ledger. In conformance with [ADR 0036](../../adr/0036-free-tier-offloading-and-provider-quota-governance.md), any meter not exposed via free-tier APIs is explicitly recorded as **Unknown**, never guessed:

| Provider | Managed Resource | Free Tier Cap | Reset Window | Protection / Fallback Mechanism |
| --- | --- | --- | --- | --- |
| **Vercel** | Functions Storage | 10.0 GB | 30-day rolling | Audited retention inventory & candidate cleanup ([#691](https://github.com/fderuiter/portfolio/issues/691), [#692](https://github.com/fderuiter/portfolio/issues/692)) |
| **Vercel** | Deployment Storage | 10.0 GB | 30-day rolling | Conservative preservation with 20-deployment recency buffer |
| **Vercel** | Build Hours | 100.0 hrs/mo | 30-day rolling | Ignored build step filters and local pre-commit gates |
| **Vercel** | Deployment Rate | 100 deploys/day | 24-hour rolling | Batch PR merges into `dev` branch |
| **Upstash** | Redis Commands | 10,000 cmd/day | Daily (00:00 UTC) | In-memory generational cache shield & 1500ms request deadline |
| **Upstash** | Redis Storage | 256 MB | Continuous | 48-hour TTL on telemetry queue; 60-second TTL on rate limits |
| **Neon** | Postgres Storage | 0.5 GiB | Continuous | Minimal relational schema footprint; raw logs kept in Redis |
| **Neon** | Compute Hours | 190.8 hrs/mo | Monthly | Auto-suspends after 5 min; protected by Next.js ISR edge caching |
| **Resend** | Outbound Emails | 100 emails/day | Daily | Honeypots, 2000ms duration gate, toxic rant filter, simulated dev mode |
| **Clerk** | Admin Users | 10,000 MAU | Monthly | Single-operator `/admin` console allowlist |
| **Sentry** | Error Events | 5,000 events/mo | Monthly | `beforeSend` drops `AbortError` & third-party extension noise |
| **Sentry** | Performance Spans | 10,000 spans/mo | Monthly | 0% sampling in dev/preview; bounded to 5% in production |

---

## 5. Notification Architecture & Deduplication

Alert dispatch is managed by `HeadroomAlertManager`:

- **Deterministic Fingerprinting**: Each alert generates an ID derived from `${resource}:${severity}`.
- **Cooldown Window**: Identical alerts are suppressed within a configurable cooldown period (default: 1 hour / 3,600,000 ms) to prevent alert storms during high-frequency checks.
- **Stateful Recovery**: When a resource drops from `critical` or `warning` back into `healthy`, an explicit `[RECOVERY]` notification is emitted.
- **Approved Sinks**: Pluggable `HeadroomNotificationSink` supports standard logger sinks, in-memory sinks for automated tests, and webhook forwarders without requiring paid Vercel Log Drains.

---

## 6. Operational Governance

- **Schedule**: Headroom evaluation runs prior to release gates and during scheduled weekly operational audits.
- **Owner**: Release Engineer / Repository Maintainer.
- **Cost**: $0.00 (operates strictly within Vercel Hobby and provider free tiers).
- **Disabled-State Behavior**: If external telemetry fails or headroom checks are bypassed with non-strict flags, the platform continues normal runtime execution without throwing unhandled exceptions.
