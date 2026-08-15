import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Redis } from "@upstash/redis";
import { validateRouteInitialization, validateSyncRequest } from "@/lib/security";
import { SyncParamsSchema } from "@/lib/schemas";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// Evaluate local environment configuration during route initialization
validateRouteInitialization();

export async function GET(req: NextRequest) {
  // Validate the request's credentials
  const authResult = validateSyncRequest(req);
  if (!authResult.isValid && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const url = new URL(req.url);
    const batchParam = url.searchParams.get("batch");
    const parsedQuery = SyncParamsSchema.safeParse({
      batch: batchParam !== null ? batchParam : undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsedQuery.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const BATCH_SIZE = parsedQuery.data.batch;

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
    });
    
    const p = redis.pipeline();
    for (let i = 0; i < BATCH_SIZE; i++) {
      p.rpop("telemetry_buffer");
    }
    
    const results = await p.exec();
    const events = results.filter(e => e !== null);

    if (events.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    interface BufferedEvent {
      id: string;
      projectSlug: string;
      eventType: string;
      createdAt: string | Date;
    }

    // Insert events into PostgreSQL, skipping duplicates with transactional re-enqueue safeguard
    let createResult;
    try {
      createResult = await prisma.telemetryEvent.createMany({
        data: (events as BufferedEvent[]).map((e) => ({
          id: e.id,
          projectSlug: e.projectSlug,
          eventType: e.eventType,
          createdAt: new Date(e.createdAt),
        })),
        skipDuplicates: true,
      });
    } catch (dbErr) {
      console.warn("Primary database write failed during sync. Re-enqueueing popped events to Redis buffer.", dbErr);
      try {
        const rollbackPipeline = redis.pipeline();
        for (const evt of events) {
          rollbackPipeline.lpush("telemetry_buffer", evt);
        }
        rollbackPipeline.expire("telemetry_buffer", 48 * 60 * 60);
        await rollbackPipeline.exec();
      } catch (redisErr) {
        console.error("Critical: Failed to re-enqueue buffered telemetry events to Redis:", redisErr);
      }
      throw dbErr;
    }

    return NextResponse.json({ success: true, processed: events.length, inserted: createResult.count });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to sync buffered telemetry events:", err);
    return NextResponse.json(
      { error: "Failed to sync events to primary database" },
      { status: 500 }
    );
  }
}
