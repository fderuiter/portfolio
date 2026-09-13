# Standalone Deployment Operations & Synthetic Monitoring Guide

This guide provides operational workflows, automated canary evaluation procedures, service-level agreement (SLA) gating criteria, automated rollback webhook dispatch specifications, and step-by-step triage runbooks for synthetic user journey probes.

---

## 1. Automated Canary Analysis (ACA) & Release Gates

To evaluate production rollout health before promoting full user traffic, the deployment pipeline executes Automated Canary Analysis (ACA).

### Canary Analysis Commands & Entry Points

- **CLI Evaluation Command**:
  ```bash
  npm run canary:eval
  ```
  Or directly via `tsx`:
  ```bash
  npx tsx scripts/canary-analyzer.ts
  ```
- **Engine Entry Point**: `evaluateCanaryRollout(canary, baseline, customThresholds)` in `scripts/canary-analyzer.ts`.

### Evaluation Window Parameters

- **Canary Window**: Default 15 minutes (`DEFAULT_CANARY_WINDOW_MINUTES = 15`).
- **Baseline Window**: Default 60 minutes (`DEFAULT_BASELINE_WINDOW_MINUTES = 60`).

### Canary Decision States

1. **`HEALTHY`**: All canary telemetry signals (error rate, p95 latency, Sentry exception rate) reside within normal error budgets and SLA limits. Safe for full traffic promotion.
2. **`DEGRADED`**: Non-critical performance regression detected (e.g., p95 latency increased by > 25% vs baseline, but remains below the 800ms hard ceiling). Warnings are logged; manual engineer review is recommended before full traffic cutover.
3. **`ROLLBACK_REQUIRED`**: Critical SLA breach or exception anomaly detected. Triggers automated rollback dispatch.

---

## 2. Canary Service-Level Agreement (SLA) Thresholds

Production canary evaluations enforce four default service-level agreement (SLA) thresholds defined in `DEFAULT_THRESHOLDS` (`scripts/canary-analyzer.ts`):

| SLA Metric                      | Threshold Parameter       | Default Limit      | Evaluation Condition                                | Result State        |
| ------------------------------- | ------------------------- | ------------------ | --------------------------------------------------- | ------------------- |
| **5xx Error Rate**              | `maxErrorRate`            | **0.5%** (`0.005`) | `canaryErrorRate > 0.005`                           | `ROLLBACK_REQUIRED` |
| **p95 Latency Ceiling**         | `maxLatencyP95Ms`         | **800ms**          | `canary.p95LatencyMs > 800`                         | `ROLLBACK_REQUIRED` |
| **Relative Latency Regression** | `maxLatencyRegressionPct` | **25%**            | `latencyDeltaPct > 25%` (when p95 <= 800ms)         | `DEGRADED`          |
| **Exception Spike Ratio**       | `maxExceptionSpikeRatio`  | **2.0x**           | `canaryExceptionRate / baselineExceptionRate > 2.0` | `ROLLBACK_REQUIRED` |

### SLA Threshold Details

- **Max 0.5% 5xx Error Rate**: Evaluates `serverErrors5xx / totalRequests`. Exceeding 0.5% (0.005) immediately triggers `ROLLBACK_REQUIRED`.
- **800ms p95 Latency Ceiling**: Hard upper bound for 95th percentile response latency. Any p95 response time above 800ms triggers `ROLLBACK_REQUIRED`.
- **25% Relative Latency Regression Limit**: Measures percentage increase in p95 latency vs baseline (`((canary.p95LatencyMs - baseline.p95LatencyMs) / baseline.p95LatencyMs) * 100`). An increase greater than 25% marks the rollout as `DEGRADED`.
- **2.0x Exception Spike Ratio**: Normalizes Sentry exceptions over window duration (`canaryExceptionRate = sentryExceptionCount / windowDurationMinutes`). If the canary exception rate per minute is more than 2.0x the baseline rate, or if new exceptions occur when baseline is zero, `ROLLBACK_REQUIRED` is dispatched.

---

## 3. Automated Rollback Webhooks & Failure Triggers

When `evaluateCanaryRollout` yields a `decision` of `ROLLBACK_REQUIRED`, the deployment pipeline automatically invokes `executeAutomatedRollback(result, options)`.

### Webhook Dispatch Behavior

- **Function**: `executeAutomatedRollback(result, { dryRun, webhookUrl })`
- **Dry-Run Mode**: If `options.dryRun` is set to `true` or `webhookUrl` is omitted, the engine outputs the prepared payload to logs without dispatching an HTTP POST:
  `[DRY RUN] Automated rollback payload prepared: ...`
- **Live Webhook Mode**: If `webhookUrl` is provided, the function sends an HTTP `POST` request with `Content-Type: application/json`.

### Automated Rollback Payload Structure

```json
{
  "event": "AUTOMATED_CANARY_ROLLBACK",
  "timestamp": "2026-08-21T08:30:00.000Z",
  "reasons": [
    "CRITICAL: Canary 5xx error rate (0.85%) exceeds safety budget threshold (0.50%).",
    "CRITICAL: p95 latency (920ms) breached hard latency SLA (800ms)."
  ],
  "metrics": {
    "errorRate": 0.0085,
    "errorRatePct": "0.85%",
    "p95LatencyMs": 920,
    "sentryExceptionCount": 12,
    "exceptionRatePerMinute": 0.8
  }
}
```

### Webhook Response & Error Handling

- **Success (HTTP 200–299)**: Logs `Rollback webhook dispatched successfully.` and returns `{ success: true }`.
- **Failure (HTTP 4xx/5xx or Network Failure)**: Returns `{ success: false, message: "Failed to trigger rollback webhook: ..." }` and logs critical alert for on-call notification.

---

## 4. Scheduled Synthetic Probe Monitoring

To catch silent production regressions, the repository runs automated, continuous end-to-end Playwright synthetic probes.

### Daily Cron Schedule

- **Workflow File**: `.github/workflows/synthetic-probes.yml`
- **Cron Schedule**: `17 7 * * *` (runs daily at 07:17 UTC)
- **Runtime Environment**: Headless Chromium on `ubuntu-latest`, Node.js 24.x,
  using cached Playwright binaries.

### Manual Probe Execution & Custom Target URLs

Engineers can manually trigger synthetic probes locally or against preview/staging deployments using target URL overrides.

- **Local / Default Production Execution**:

  ```bash
  npm run probe:synthetic
  ```

  Or directly via Playwright:

  ```bash
  npx playwright test __tests__/e2e/synthetic-probes.spec.ts --project=chromium
  ```

- **Execution Against Custom Target URL (Preview / Staging)**:
  Set `PLAYWRIGHT_TEST_BASE_URL` environment variable before running the test:

  ```bash
  PLAYWRIGHT_TEST_BASE_URL="https://portfolio-preview-git-feature.vercel.app" npm run probe:synthetic
  ```

- **Manual GitHub Actions Dispatch**:
  Trigger via GitHub CLI with optional `target_url` parameter:
  ```bash
  gh workflow run synthetic-probes.yml -f target_url="https://portfolio-preview-git-feature.vercel.app"
  ```

---

## 5. Synthetic Probe Failure Triage Runbooks

When a synthetic probe alert triggers, on-call engineers should follow the dedicated triage runbook for the failing journey. Triage should be completed within 10 minutes.

### Runbook 1: Landing Page & Pretext Layout Journey

- **Probe ID**: Probe 1 (`__tests__/e2e/synthetic-probes.spec.ts`)
- **Covered Capabilities**: Main container (`#main-content`), bento grid card rendering, Pretext DOM-free text layout engine, dynamic card height calculations (`box.height > 50`, `box.width > 100`).
- **Failure Symptoms**: `Probe 1` fails due to missing `#main-content`, zero-height bento cards, or DOM reflow crashes.
- **Triage Steps**:
  1. **Run Isolated Probe**:
     ```bash
     PLAYWRIGHT_TEST_BASE_URL="<TARGET_URL>" npx playwright test __tests__/e2e/synthetic-probes.spec.ts -g "Probe 1"
     ```
  2. **Inspect Pretext Canvas Measurement Context**: Verify that `@chenglou/pretext` initialized cleanly without SSR Canvas `measureText` exceptions.
  3. **Check Container Bounds**: Verify that root container `app/layout.tsx` and `app/page.tsx` maintain `#main-content` landmark and flex/grid layout constraints (`min-w-0`).
  4. **Verify CSS & Font Loading**: Confirm Tailwind CSS v4 `@import "tailwindcss";` and Inter font variable `--font-inter` loaded without network stalls.

### Runbook 2: Command Palette Discovery & Navigation Journey

- **Probe ID**: Probe 2 (`__tests__/e2e/synthetic-probes.spec.ts`)
- **Covered Capabilities**: Command Palette trigger buttons (Desktop `Search portfolio and commands (Press Command+K)` / Mobile `Open Command Search`), dialog modal (`getByRole("dialog", { name: /Command Palette/i })`), fuzzy keyword filtering, and instant navigation to `/proof`.
- **Failure Symptoms**: Command Palette dialog fails to open within hydration retry timeout (15s), query input fails to capture text, or `/proof` route transition fails.
- **Triage Steps**:
  1. **Run Isolated Probe**:
     ```bash
     PLAYWRIGHT_TEST_BASE_URL="<TARGET_URL>" npx playwright test __tests__/e2e/synthetic-probes.spec.ts -g "Probe 2"
     ```
  2. **Verify React 19 Hydration**: Confirm that interactive search buttons are wrapped in hydration polling blocks (`expect(...).toPass({ timeout: 15000 })`) and event listeners have attached.
  3. **Inspect Case Studies API Endpoint**: Verify that `GET /api/case-studies` responds with `200 OK` and valid JSON array:
     ```bash
     curl -i <TARGET_URL>/api/case-studies
     ```
  4. **Check Focus Trap & Portal**: Verify `components/CommandPalette.tsx` body scroll lock (`overflow = hidden`) and React Portal mounting.

### Runbook 3: Proof Assistant DAG Engine & Export Journey

- **Probe ID**: Probe 3 (`__tests__/e2e/synthetic-probes.spec.ts`)
- **Covered Capabilities**: Deductive proof workspace (`/proof`), formal verification header, AST deduction graph nodes, Rule Palette, and Export dialog (`Export|Share Proof`).
- **Failure Symptoms**: `/proof` route crashes on render, proof graph nodes fail to mount, or Export modal fails to render or close cleanly.
- **Triage Steps**:
  1. **Run Isolated Probe**:
     ```bash
     PLAYWRIGHT_TEST_BASE_URL="<TARGET_URL>" npx playwright test __tests__/e2e/synthetic-probes.spec.ts -g "Probe 3"
     ```
  2. **Verify AST Evaluator Engine**: Run unit test suite to rule out cycle detection or stack overflow in propositional AST evaluator (`lib/proof-utils.ts`):
     ```bash
     npm test __tests__/proof-engine.test.ts
     ```
  3. **Check WebGL / SVG Canvas Errors**: Inspect browser console for Framer Motion animation or SVG rendering errors on the graph canvas.
  4. **Validate Export Dialog**: Ensure `ModalContainer` trapped focus restored properly on `Escape` key press.

### Runbook 4: Arcade Canvas 2D Engine Journey

- **Probe ID**: Probe 4 (`__tests__/e2e/synthetic-probes.spec.ts`)
- **Covered Capabilities**: Game cabinet route (`/arcade/laser-loon`), `Launch Cabinet` trigger button interaction, HTML5 `<canvas>` element mounting, and 2D rendering loop initialization.
- **Failure Symptoms**: `Launch Cabinet` button unclickable, `<canvas>` element fails to mount within 20s, or graphics context creation throws unhandled errors.
- **Triage Steps**:
  1. **Run Isolated Probe**:
     ```bash
     PLAYWRIGHT_TEST_BASE_URL="<TARGET_URL>" npx playwright test __tests__/e2e/synthetic-probes.spec.ts -g "Probe 4"
     ```
  2. **Inspect Cabinet Launch Workflow**: Verify that `<PlayCabinet>` launch button `Launch Cabinet` receives click events after CRT monitor warmup.
  3. **Verify Canvas 2D Context Support**: Ensure headless browser has hardware acceleration or software WebGL/Canvas 2D fallbacks enabled (`vitest.setup.ts` canvas stubs).
  4. **Check Web Audio Synthesizer**: Verify that Web Audio API initialization in `components/arcade/ControlDocks.tsx` handles `hover: none` touch environments defensively.

### Runbook 5: API Ingestion, Schema Guard & Rate Limiting Journey

- **Probe ID**: Probe 5 (`__tests__/e2e/synthetic-probes.spec.ts`)
- **Covered Capabilities**: Telemetry API (`/api/telemetry`), Case Studies API (`/api/case-studies`), Zod schema validation guard (`lib/schemas.ts`), and sliding-window rate limiter.
- **Failure Symptoms**: Valid telemetry POST fails with status != 200/201, invalid telemetry POST fails to reject with HTTP 400, or case studies GET fails.
- **Triage Steps**:
  1. **Run Isolated Probe**:
     ```bash
     PLAYWRIGHT_TEST_BASE_URL="<TARGET_URL>" npx playwright test __tests__/e2e/synthetic-probes.spec.ts -g "Probe 5"
     ```
  2. **Test Valid Telemetry Ingestion Manually**:
     ```bash
     curl -i -X POST <TARGET_URL>/api/telemetry \
       -H "Content-Type: application/json" \
       -d '{"eventType":"page_view","projectSlug":"triage-probe"}'
     ```
     Verify HTTP status `200` or `201` and response `{ "success": true }`.
  3. **Test Schema Guard Rejection**:
     ```bash
     curl -i -X POST <TARGET_URL>/api/telemetry \
       -H "Content-Type: application/json" \
       -d '{"projectSlug":"malformed-payload"}'
     ```
     Verify HTTP status `400 Bad Request` and JSON error details.
  4. **Inspect Database & Redis Rate Limiter**: Check Neon PostgreSQL connection string (`DATABASE_URL`) and Upstash Redis rate limiting headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).
