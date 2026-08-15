import { describe, it, expect, vi } from "vitest";
import {
  evaluateCanaryRollout,
  executeAutomatedRollback,
  type TelemetryMetrics,
} from "@/scripts/canary-analyzer";

describe("Automated Canary Analysis (ACA) & Anomaly Detection", () => {
  const healthyBaseline: TelemetryMetrics = {
    totalRequests: 100000,
    serverErrors5xx: 50, // 0.05%
    p95LatencyMs: 120,
    sentryExceptionCount: 2,
    windowDurationMinutes: 60,
  };

  it("evaluates healthy canary deployment within error budget and latency limits", () => {
    const canaryMetrics: TelemetryMetrics = {
      totalRequests: 20000,
      serverErrors5xx: 10, // 0.05%
      p95LatencyMs: 125,
      sentryExceptionCount: 0,
      windowDurationMinutes: 15,
    };

    const result = evaluateCanaryRollout(canaryMetrics, healthyBaseline);
    expect(result.decision).toBe("HEALTHY");
    expect(result.rollbackTriggered).toBe(false);
    expect(result.reasons[0]).toContain("within normal bounds");
  });

  it("flags DEGRADED status when latency regresses beyond relative percentage threshold", () => {
    const degradedCanary: TelemetryMetrics = {
      totalRequests: 20000,
      serverErrors5xx: 10,
      p95LatencyMs: 170, // ~41.6% increase (> 25% threshold) but < 800ms hard ceiling
      sentryExceptionCount: 1,
      windowDurationMinutes: 15,
    };

    const result = evaluateCanaryRollout(degradedCanary, healthyBaseline);
    expect(result.decision).toBe("DEGRADED");
    expect(result.rollbackTriggered).toBe(false);
    expect(result.reasons.some((r) => r.includes("WARNING: p95 latency increased by"))).toBe(true);
  });

  it("triggers ROLLBACK_REQUIRED when 5xx error rate breaches 0.5% threshold", () => {
    const errorSpikeCanary: TelemetryMetrics = {
      totalRequests: 10000,
      serverErrors5xx: 120, // 1.2% error rate (> 0.5% threshold)
      p95LatencyMs: 130,
      sentryExceptionCount: 0,
      windowDurationMinutes: 15,
    };

    const result = evaluateCanaryRollout(errorSpikeCanary, healthyBaseline);
    expect(result.decision).toBe("ROLLBACK_REQUIRED");
    expect(result.rollbackTriggered).toBe(true);
    expect(result.reasons.some((r) => r.includes("CRITICAL: Canary 5xx error rate"))).toBe(true);
  });

  it("triggers ROLLBACK_REQUIRED when p95 latency breaches hard SLA limit (800ms)", () => {
    const laggyCanary: TelemetryMetrics = {
      totalRequests: 20000,
      serverErrors5xx: 5,
      p95LatencyMs: 950, // > 800ms hard SLA
      sentryExceptionCount: 0,
      windowDurationMinutes: 15,
    };

    const result = evaluateCanaryRollout(laggyCanary, healthyBaseline);
    expect(result.decision).toBe("ROLLBACK_REQUIRED");
    expect(result.rollbackTriggered).toBe(true);
    expect(result.reasons.some((r) => r.includes("breached hard latency SLA"))).toBe(true);
  });

  it("triggers ROLLBACK_REQUIRED when Sentry exception count spikes vs baseline", () => {
    const buggylCanary: TelemetryMetrics = {
      totalRequests: 20000,
      serverErrors5xx: 5,
      p95LatencyMs: 130,
      sentryExceptionCount: 25, // 12.5x baseline (2)
      windowDurationMinutes: 15,
    };

    const result = evaluateCanaryRollout(buggylCanary, healthyBaseline);
    expect(result.decision).toBe("ROLLBACK_REQUIRED");
    expect(result.rollbackTriggered).toBe(true);
    expect(result.reasons.some((r) => r.includes("Sentry exception count spiked"))).toBe(true);
  });

  describe("executeAutomatedRollback", () => {
    it("returns no-op message for healthy evaluation", async () => {
      const evaluation = evaluateCanaryRollout(
        {
          totalRequests: 1000,
          serverErrors5xx: 0,
          p95LatencyMs: 100,
          sentryExceptionCount: 0,
          windowDurationMinutes: 10,
        },
        healthyBaseline
      );

      const rollbackRes = await executeAutomatedRollback(evaluation);
      expect(rollbackRes.success).toBe(true);
      expect(rollbackRes.message).toContain("Rollout healthy");
    });

    it("prepares dry-run rollback payload when rollback is required", async () => {
      const evaluation = evaluateCanaryRollout(
        {
          totalRequests: 1000,
          serverErrors5xx: 50, // 5% error rate
          p95LatencyMs: 100,
          sentryExceptionCount: 0,
          windowDurationMinutes: 10,
        },
        healthyBaseline
      );

      const rollbackRes = await executeAutomatedRollback(evaluation, { dryRun: true });
      expect(rollbackRes.success).toBe(true);
      expect(rollbackRes.message).toContain("[DRY RUN] Automated rollback payload prepared");
    });

    it("dispatches webhook payload to remote URL", async () => {
      const evaluation = evaluateCanaryRollout(
        {
          totalRequests: 1000,
          serverErrors5xx: 50, // 5% error rate
          p95LatencyMs: 100,
          sentryExceptionCount: 0,
          windowDurationMinutes: 10,
        },
        healthyBaseline
      );

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        const rollbackRes = await executeAutomatedRollback(evaluation, {
          webhookUrl: "https://api.vercel.com/v1/integrations/deploy/rollback",
        });

        expect(rollbackRes.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledOnce();
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});
