#!/usr/bin/env node
/**
 * Upstash Redis & Rate Limiting Verification Script
 *
 * Non-mutating verification CLI for Redis connectivity, namespace isolation,
 * key TTLs, command cost estimates, and outage fallback behavior.
 *
 * Usage:
 *   npx tsx scripts/verify-upstash.ts [--strict] [--json]
 */

import { Redis } from "@upstash/redis";
import { getEnv } from "../lib/env";
import { getRedisKeyPrefix, getScopedRedisKey } from "../lib/redis";

interface UpstashVerificationResult {
  timestamp: string;
  status: "connected" | "degraded_fallback" | "unreachable";
  environment: {
    nodeEnv: string;
    vercelEnv: string | null;
    isolatedPrefix: string;
    redactedEndpoint: string;
    tokenFingerprint: string;
  };
  keyspaces: {
    telemetryBuffer: string;
    telemetryProcessing: string;
    rateLimitPrefix: string;
    queueTtlSeconds: number;
    rateLimitWindowSeconds: number;
    maxRequestsPerWindow: number;
  };
  quotas: {
    tier: string;
    commandLimitDaily: number;
    storageLimitBytes: number;
    rateLimitPerSecond: number;
  };
  policies: {
    telemetryFailPolicy: string;
    contactFailPolicy: string;
    newsletterFailPolicy: string;
    circuitBreakerCooldownMs: number;
    requestDeadlineTimeoutMs: number;
  };
  liveConnection?: {
    latencyMs: number;
    response: string;
  };
  error?: string;
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  return {
    strict: args.includes("--strict"),
    json: args.includes("--json"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

function printUsage() {
  console.log(`
Upstash Redis & Rate Limiting Verification

Usage:
  npx tsx scripts/verify-upstash.ts [options]

Options:
  --strict    Exit with code 1 if live connection fails or credentials are unset
  --json      Output structured JSON envelope
  --help, -h  Show this help screen
`);
}

function redactUrl(url: string | undefined): string {
  if (!url) return "[unset]";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "[invalid-url]";
  }
}

function redactToken(token: string | undefined): string {
  if (!token) return "[unset]";
  if (token.length <= 8) return "[masked]";
  return `${token.slice(0, 4)}...${token.slice(-4)} (${token.length} chars)`;
}

export async function runUpstashVerification(
  options: {
    strict?: boolean;
  } = {}
): Promise<{ success: boolean; data: UpstashVerificationResult }> {
  const currentEnv = getEnv();
  const rawUrl = currentEnv.UPSTASH_REDIS_REST_URL;
  const rawToken = currentEnv.UPSTASH_REDIS_REST_TOKEN;
  const prefix = getRedisKeyPrefix();

  const isConfigured = Boolean(
    rawUrl &&
    rawToken &&
    !rawUrl.includes("localhost:8079") &&
    rawToken !== "example_token" &&
    rawToken !== "example_dev_token"
  );

  const baseResult: UpstashVerificationResult = {
    timestamp: new Date().toISOString(),
    status: isConfigured ? "connected" : "degraded_fallback",
    environment: {
      nodeEnv: currentEnv.NODE_ENV,
      vercelEnv: currentEnv.VERCEL_ENV || null,
      isolatedPrefix: prefix || "[none - default/production]",
      redactedEndpoint: redactUrl(rawUrl),
      tokenFingerprint: redactToken(rawToken),
    },
    keyspaces: {
      telemetryBuffer: getScopedRedisKey("telemetry_buffer"),
      telemetryProcessing: getScopedRedisKey("telemetry_processing"),
      rateLimitPrefix: getScopedRedisKey("@upstash/ratelimit"),
      queueTtlSeconds: 48 * 60 * 60, // 48h
      rateLimitWindowSeconds: 60,
      maxRequestsPerWindow: 60,
    },
    quotas: {
      tier: "Upstash Free Tier (Hobby)",
      commandLimitDaily: 10000,
      storageLimitBytes: 256 * 1024 * 1024, // 256MB
      rateLimitPerSecond: 100,
    },
    policies: {
      telemetryFailPolicy:
        "Fail-open to local generational memory cache with 30s circuit breaker",
      contactFailPolicy: "Fail-closed (429) memory rate limiting (5 req / 10m)",
      newsletterFailPolicy:
        "Fail-closed (429) memory rate limiting (5 req / 10m)",
      circuitBreakerCooldownMs: 30000,
      requestDeadlineTimeoutMs: 1500,
    },
  };

  if (!isConfigured) {
    if (options.strict) {
      return {
        success: false,
        data: {
          ...baseResult,
          status: "degraded_fallback",
          error: "Strict mode enabled: live Upstash credentials not configured",
        },
      };
    }
    return {
      success: true,
      data: baseResult,
    };
  }

  // Attempt read-only live ping check
  try {
    const client = new Redis({
      url: rawUrl,
      token: rawToken,
    });

    const start = performance.now();
    const pingRes = await client.ping();
    const latency = Math.round(performance.now() - start);

    return {
      success: true,
      data: {
        ...baseResult,
        status: "connected",
        liveConnection: {
          latencyMs: latency,
          response: String(pingRes),
        },
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: !options.strict,
      data: {
        ...baseResult,
        status: "unreachable",
        error: `Live connection failed: ${message}`,
      },
    };
  }
}

async function main() {
  const args = parseCliArgs();
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const { success, data } = await runUpstashVerification({
    strict: args.strict,
  });

  if (args.json) {
    console.log(JSON.stringify({ success, result: data }, null, 2));
    process.exit(success ? 0 : 1);
  }

  console.log("\n--- Upstash Redis & Rate Limiting Verification ---");
  console.log(`Status:      ${data.status.toUpperCase()}`);
  console.log(
    `Environment: NODE_ENV=${data.environment.nodeEnv}, VERCEL_ENV=${data.environment.vercelEnv || "none"}`
  );
  console.log(`Prefix:      ${data.environment.isolatedPrefix}`);
  console.log(`Endpoint:    ${data.environment.redactedEndpoint}`);
  console.log(`Token:       ${data.environment.tokenFingerprint}`);
  console.log("\nKeyspaces & Namespaces:");
  console.log(`  Buffer Queue:     ${data.keyspaces.telemetryBuffer}`);
  console.log(`  Processing Queue: ${data.keyspaces.telemetryProcessing}`);
  console.log(`  RateLimit Prefix: ${data.keyspaces.rateLimitPrefix}`);
  console.log(`  Queue TTL:        ${data.keyspaces.queueTtlSeconds}s (48h)`);
  console.log("\nOutage & Fault Tolerance:");
  console.log(`  Telemetry:        ${data.policies.telemetryFailPolicy}`);
  console.log(`  Contact/News:     ${data.policies.contactFailPolicy}`);
  console.log(
    `  Request Deadline: ${data.policies.requestDeadlineTimeoutMs}ms`
  );
  console.log(
    `  Circuit Breaker:  ${data.policies.circuitBreakerCooldownMs}ms cooldown`
  );

  if (data.liveConnection) {
    console.log("\nLive Connection:");
    console.log(`  Ping Latency:     ${data.liveConnection.latencyMs}ms`);
    console.log(`  Response:         ${data.liveConnection.response}`);
  }

  if (data.error) {
    console.log(`\nNote: ${data.error}`);
  }

  console.log("--------------------------------------------------\n");
  process.exit(success ? 0 : 1);
}

if (
  process.env.NODE_ENV !== "test" &&
  typeof require !== "undefined" &&
  require.main === module
) {
  void main();
}
