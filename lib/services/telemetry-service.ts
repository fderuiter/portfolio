import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { RateLimitParamsSchema } from "@/lib/schemas";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/lib/env";
import {
  generateClientConnectionHash,
  extractClientIp,
} from "./privacy-service";

export interface TelemetryEventInput {
  projectSlug: string;
  eventType: string;
}

/** A telemetry event as it is held in, and read back from, the Redis buffer. */
export interface BufferedTelemetryEvent {
  id: string;
  projectSlug: string;
  eventType: string;
  createdAt: string | Date;
}

export interface LocalCacheEntry {
  count: number;
  expiresAt: number;
}

const rateLimitConfig = RateLimitParamsSchema.parse({});
const RATE_LIMIT_WINDOW_S = rateLimitConfig.windowMs / 1000;
const MAX_REQUESTS_PER_WINDOW = rateLimitConfig.maxRequests;

const sdkEphemeralCache = new Map<string, number>();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    MAX_REQUESTS_PER_WINDOW,
    `${RATE_LIMIT_WINDOW_S} s`
  ),
  ephemeralCache: sdkEphemeralCache,
});

let activeGeneration = new Map<string, LocalCacheEntry>();
let inactiveGeneration = new Map<string, LocalCacheEntry>();
let lastSwapTime = Date.now();

const SWAP_INTERVAL_MS = 5000;
const CIRCUIT_BREAKER_COOLDOWN_MS = 30000;
let circuitBreakerCooldownUntil = 0;

function swapGenerations() {
  const temp = inactiveGeneration;
  inactiveGeneration = activeGeneration;
  activeGeneration = temp;
  activeGeneration.clear();
  lastSwapTime = Date.now();
}

function checkAndSwapPassive() {
  const now = Date.now();
  if (now - lastSwapTime >= SWAP_INTERVAL_MS) {
    if (now - lastSwapTime >= SWAP_INTERVAL_MS * 2) {
      activeGeneration.clear();
      inactiveGeneration.clear();
      lastSwapTime = now;
    } else {
      swapGenerations();
    }
  }
}

export const _testCache = {
  get active() {
    return activeGeneration;
  },
  get inactive() {
    return inactiveGeneration;
  },
  get circuitBreakerCooldownUntil() {
    return circuitBreakerCooldownUntil;
  },
  swap() {
    swapGenerations();
  },
  reset() {
    activeGeneration.clear();
    inactiveGeneration.clear();
    lastSwapTime = Date.now();
    circuitBreakerCooldownUntil = 0;
  },
};

export class TelemetryService {
  /**
   * Evaluates rate limiting anonymously using Web Crypto SHA-256 IP hashing.
   */
  static async isRateLimited(
    req: NextRequest
  ): Promise<{ limited: boolean; headers?: Record<string, string> }> {
    checkAndSwapPassive();

    const ip = extractClientIp(req);
    const ipHash = await generateClientConnectionHash(ip);
    const now = Date.now();

    const isCircuitActive = now < circuitBreakerCooldownUntil;

    const buildLocalHeaders = (entry: LocalCacheEntry) => ({
      "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
      "X-RateLimit-Remaining": String(
        Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count)
      ),
      "X-RateLimit-Reset": String(Math.ceil(entry.expiresAt / 1000)),
    });

    let cached = activeGeneration.get(ipHash);
    if (!cached) {
      cached = inactiveGeneration.get(ipHash);
    }

    if (isCircuitActive) {
      if (cached && now < cached.expiresAt) {
        cached.count += 1;
        cached.expiresAt = Math.max(
          cached.expiresAt,
          circuitBreakerCooldownUntil
        );
      } else {
        cached = {
          count: 1,
          expiresAt: Math.max(circuitBreakerCooldownUntil, now + 5000),
        };
        activeGeneration.set(ipHash, cached);
      }

      const isLimited = cached.count > MAX_REQUESTS_PER_WINDOW;
      return {
        limited: isLimited,
        headers: buildLocalHeaders(cached),
      };
    }

    if (cached && now < cached.expiresAt) {
      if (cached.count < MAX_REQUESTS_PER_WINDOW) {
        cached.count += 1;
        return {
          limited: false,
          headers: buildLocalHeaders(cached),
        };
      }
    }

    try {
      const result = await ratelimit.limit(ipHash);
      const headers = {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
      };

      if (result.success) {
        activeGeneration.set(ipHash, {
          count: MAX_REQUESTS_PER_WINDOW - result.remaining,
          expiresAt: Math.min(result.reset, now + 5000),
        });
        return { limited: false, headers };
      } else {
        activeGeneration.delete(ipHash);
        inactiveGeneration.delete(ipHash);
        return { limited: true, headers };
      }
    } catch (err) {
      console.error(
        "Upstream rate limiting check failed, activating 30s circuit breaker fallback:",
        err
      );
      circuitBreakerCooldownUntil = now + CIRCUIT_BREAKER_COOLDOWN_MS;

      if (cached && now < cached.expiresAt) {
        cached.count += 1;
        cached.expiresAt = Math.max(
          cached.expiresAt,
          circuitBreakerCooldownUntil
        );
      } else {
        cached = {
          count: 1,
          expiresAt: circuitBreakerCooldownUntil,
        };
        activeGeneration.set(ipHash, cached);
      }

      const isLimited = cached.count > MAX_REQUESTS_PER_WINDOW;
      return {
        limited: isLimited,
        headers: buildLocalHeaders(cached),
      };
    } finally {
      // Memory sweeping check when capacity is reached
      if (activeGeneration.size > 5000) {
        for (const [key, entry] of activeGeneration.entries()) {
          if (Date.now() >= entry.expiresAt) {
            activeGeneration.delete(key);
          }
        }
      }
    }
  }

  /**
   * Records a telemetry interaction event into the Redis buffer queue.
   *
   * The Redis buffer is the only store in front of the sync job, so a failed
   * enqueue drops the event outright. `buffered` reports whether the event was
   * actually accepted so callers never present a dropped event as durable.
   */
  static async recordEvent(
    data: TelemetryEventInput
  ): Promise<{ event: BufferedTelemetryEvent; buffered: boolean }> {
    const eventId = crypto.randomUUID();
    const eventData = {
      id: eventId,
      projectSlug: data.projectSlug,
      eventType: data.eventType,
      createdAt: new Date(),
    };

    if (env.PLAYWRIGHT_TEST === "true") {
      return { event: eventData, buffered: true };
    }

    try {
      const p = redis.pipeline();
      p.lpush("telemetry_buffer", eventData);
      p.expire("telemetry_buffer", 48 * 60 * 60); // 48 hours
      const [listLength] = await p.exec();

      if (Number(listLength) > 1000) {
        console.error(
          "ALERT: Secondary telemetry buffer occupancy exceeds threshold."
        );
      }
    } catch (err) {
      // Losing the event here is silent by nature: nothing else holds it.
      Sentry.captureException(err);
      console.error("Failed to commit telemetry event to Redis buffer:", err);
      return { event: eventData, buffered: false };
    }

    return { event: eventData, buffered: true };
  }

  /**
   * Fetches aggregate portfolio view/click telemetry statistics.
   */
  static async getAggregateStats() {
    if (env.PLAYWRIGHT_TEST === "true") {
      return {
        "synthetic-probe-runner": { views: 5, clicks: 2 },
        simulator: { views: 10, clicks: 4 },
        neuro: { views: 8, clicks: 3 },
      };
    }

    const stats = await prisma.telemetryEvent.groupBy({
      by: ["projectSlug", "eventType"],
      _count: {
        id: true,
      },
    });

    const formattedStats: Record<string, { views: number; clicks: number }> =
      {};

    for (const item of stats) {
      const slug = item.projectSlug;
      if (!formattedStats[slug]) {
        formattedStats[slug] = { views: 0, clicks: 0 };
      }

      if (item.eventType === "page_view") {
        formattedStats[slug].views = item._count.id;
      } else if (item.eventType === "project_click") {
        formattedStats[slug].clicks = item._count.id;
      }
    }

    return formattedStats;
  }

  /**
   * Synchronizes buffered telemetry events from Redis into PostgreSQL.
   * Atomically transfers event batches from 'telemetry_buffer' to 'telemetry_processing'
   * using LMOVE to guarantee zero telemetry loss during synchronization failures.
   */
  static async syncBufferedEvents(batchSize: number) {
    type BufferedEvent = BufferedTelemetryEvent;

    // 1. Fetch any pending events previously transferred to processing queue but not yet synced to DB
    const existingProcessing = (await redis.lrange(
      "telemetry_processing",
      0,
      -1
    )) as BufferedEvent[];
    let events: BufferedEvent[] = Array.isArray(existingProcessing)
      ? existingProcessing
      : [];

    // 2. If existing processing queue has fewer items than batchSize, atomically move remaining batch from buffer
    if (events.length < batchSize) {
      const needed = batchSize - events.length;
      const p = redis.pipeline();
      for (let i = 0; i < needed; i++) {
        p.lmove("telemetry_buffer", "telemetry_processing", "right", "left");
      }
      p.expire("telemetry_processing", 48 * 60 * 60);
      const moveResults = await p.exec();

      const newlyMoved = moveResults.filter(
        (item): item is BufferedEvent =>
          item !== null && typeof item === "object" && "id" in item
      );

      events = [...events, ...newlyMoved];
    }

    if (events.length === 0) {
      return { processed: 0, inserted: 0 };
    }

    let createResult;
    try {
      createResult = await prisma.telemetryEvent.createMany({
        data: events.map((e) => ({
          id: e.id,
          projectSlug: e.projectSlug,
          eventType: e.eventType,
          createdAt: new Date(e.createdAt),
        })),
        skipDuplicates: true,
      });
    } catch (dbErr) {
      console.warn(
        "Primary database write failed during sync. Telemetry event batch remains intact in processing queue.",
        dbErr
      );
      throw dbErr;
    }

    // On successful DB write, acknowledge exactly the events this invocation
    // persisted. Deleting the whole key would also discard events that an
    // overlapping sync moved into the processing queue after step 1 read it,
    // losing them before they ever reached the database. LREM removes a single
    // occurrence per owned event, so a concurrently moved event survives.
    const ack = redis.pipeline();
    for (const event of events) {
      ack.lrem("telemetry_processing", 1, event);
    }
    await ack.exec();

    return { processed: events.length, inserted: createResult.count };
  }
}
