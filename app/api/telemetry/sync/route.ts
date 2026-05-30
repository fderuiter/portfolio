import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Redis } from "@upstash/redis";
import { env } from "../../../../env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Use a secret to protect the endpoint if needed, for cron jobs standard is a header
  const authHeader = req.headers.get("authorization");
  if (
    env.CRON_SECRET &&
    authHeader !== `Bearer ${env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
      token: env.UPSTASH_REDIS_REST_TOKEN || "example_token",
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
