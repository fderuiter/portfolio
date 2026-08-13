import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Redis } from "@upstash/redis";
import { validateRouteInitialization, validateSyncRequest } from "@/lib/security";

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
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
    });

    const BATCH_SIZE = 50;
    
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

    // Insert events into PostgreSQL, skipping duplicates
    const createResult = await prisma.telemetryEvent.createMany({
      data: (events as BufferedEvent[]).map((e) => ({
        id: e.id,
        projectSlug: e.projectSlug,
        eventType: e.eventType,
        createdAt: new Date(e.createdAt),
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, processed: events.length, inserted: createResult.count });
  } catch (err) {
    console.error("Failed to sync buffered telemetry events:", err);
    return NextResponse.json(
      { error: "Failed to sync events to primary database" },
      { status: 500 }
    );
  }
}
