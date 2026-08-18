import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import crypto from "crypto";
import { FeedbackSubmissionSchema } from "@/lib/schemas";
import { enforceRateLimit } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// Ephemeral/in-memory fallback store as secondary buffer
const mockFeedbackStore = new Map<string, Array<{ takeaways: string[]; comments: string; connectionHash: string; createdAt: string }>>();

function getConnectionHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}

interface FallbackFeedbackEntry {
  id: string;
  caseStudySlug: string;
  takeaways: string[];
  comments: string;
  connectionHash: string;
  createdAt: string;
}

/**
 * Retrieves cached feedback entries from durable Redis fallback storage and in-memory cache.
 */
async function getFallbackFeedback(slug: string): Promise<FallbackFeedbackEntry[]> {
  const items: FallbackFeedbackEntry[] = [];

  try {
    const rawList = await redis.lrange(`feedback_fallback:${slug}`, 0, -1);
    if (Array.isArray(rawList)) {
      for (const raw of rawList) {
        try {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (parsed && typeof parsed === "object") {
            items.push({
              id: parsed.id || `fallback-${Date.now()}`,
              caseStudySlug: parsed.caseStudySlug || slug,
              takeaways: Array.isArray(parsed.takeaways)
                ? parsed.takeaways
                : typeof parsed.takeaways === "string"
                ? JSON.parse(parsed.takeaways)
                : [],
              comments: parsed.comments || "",
              connectionHash: parsed.connectionHash || "",
              createdAt: parsed.createdAt || new Date().toISOString(),
            });
          }
        } catch {
          // ignore malformed entry
        }
      }
    }
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to query Redis feedback fallback store:", err);
    }
  }

  const mockList = mockFeedbackStore.get(slug) || [];
  for (const f of mockList) {
    if (!items.some((item) => item.connectionHash === f.connectionHash && item.comments === f.comments)) {
      items.push({
        id: `mock-${f.createdAt}`,
        caseStudySlug: slug,
        takeaways: f.takeaways,
        comments: f.comments,
        connectionHash: f.connectionHash,
        createdAt: f.createdAt,
      });
    }
  }

  return items;
}

/**
 * Persists fallback feedback entry into durable Upstash Redis fallback storage.
 */
async function saveFallbackFeedback(entry: {
  caseStudySlug: string;
  takeaways: string[];
  comments: string;
  connectionHash: string;
}): Promise<FallbackFeedbackEntry> {
  const createdAt = new Date().toISOString();
  const id = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const record: FallbackFeedbackEntry = {
    id,
    caseStudySlug: entry.caseStudySlug,
    takeaways: entry.takeaways,
    comments: entry.comments,
    connectionHash: entry.connectionHash,
    createdAt,
  };

  const currentMock = mockFeedbackStore.get(entry.caseStudySlug) || [];
  mockFeedbackStore.set(entry.caseStudySlug, [
    ...currentMock,
    {
      takeaways: entry.takeaways,
      comments: entry.comments,
      connectionHash: entry.connectionHash,
      createdAt,
    },
  ]);

  try {
    const p = redis.pipeline();
    p.lpush(`feedback_fallback:${entry.caseStudySlug}`, JSON.stringify(record));
    p.expire(`feedback_fallback:${entry.caseStudySlug}`, 172800); // 48-hour TTL
    await p.exec();
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to save feedback to durable Redis fallback storage:", err);
    }
  }

  return record;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || searchParams.get("caseStudySlug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing required query parameter 'slug' or 'caseStudySlug'" },
      { status: 400 }
    );
  }

  const connectionHash = getConnectionHash(req);

  try {
    const feedbackList = await prisma.caseStudyFeedback.findMany({
      where: { caseStudySlug: slug },
      select: {
        id: true,
        takeaways: true,
        comments: true,
        createdAt: true,
        connectionHash: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const fallbackEntries = await getFallbackFeedback(slug);
    const hasSubmitted =
      feedbackList.some((f) => f.connectionHash === connectionHash) ||
      fallbackEntries.some((f) => f.connectionHash === connectionHash);

    const formattedDb = feedbackList.map((f) => ({
      id: f.id,
      takeaways: JSON.parse(f.takeaways || "[]"),
      comments: f.comments,
      createdAt: typeof f.createdAt === "string" ? f.createdAt : f.createdAt.toISOString(),
      connectionHash: f.connectionHash,
    }));

    const combinedMap = new Map<string, { id: string; takeaways: string[]; comments: string; createdAt: string | Date }>();
    for (const f of [...formattedDb, ...fallbackEntries]) {
      const key = `${f.connectionHash}:${f.comments}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, {
          id: f.id,
          takeaways: f.takeaways,
          comments: f.comments,
          createdAt: f.createdAt,
        });
      }
    }

    const combinedList = Array.from(combinedMap.values());

    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      hasSubmitted,
      totalFeedback: combinedList.length,
      feedback: combinedList.slice(0, 20),
    });
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to query case study feedback from primary database:", err);
    }
    const fallbackList = await getFallbackFeedback(slug);
    const hasSubmitted = fallbackList.some((f) => f.connectionHash === connectionHash);
    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      hasSubmitted,
      totalFeedback: fallbackList.length,
      feedback: fallbackList.map((f) => ({
        id: f.id,
        takeaways: f.takeaways,
        comments: f.comments,
        createdAt: f.createdAt,
      })),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await enforceRateLimit(req);
    if (rateLimitCheck.limited && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body payload" },
        { status: 400 }
      );
    }

    const result = FeedbackSubmissionSchema.safeParse(payload);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.issues.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { caseStudySlug, takeaways, comments } = result.data;
    const connectionHash = getConnectionHash(req);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Evaluate duplicate submissions across primary database and active fallback entries
    let isDuplicate = false;

    try {
      const existing = await prisma.caseStudyFeedback.findFirst({
        where: {
          caseStudySlug,
          connectionHash,
          createdAt: { gte: oneHourAgo },
        },
      });
      if (existing) {
        isDuplicate = true;
      }
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database check for duplicate feedback failed, relying on fallback store:", dbErr);
      }
    }

    if (!isDuplicate) {
      const fallbackEntries = await getFallbackFeedback(caseStudySlug);
      const duplicateFallback = fallbackEntries.find((f) => {
        if (f.connectionHash !== connectionHash) return false;
        const entryTime = new Date(f.createdAt).getTime();
        return entryTime >= oneHourAgo.getTime();
      });
      if (duplicateFallback) {
        isDuplicate = true;
      }
    }

    if (isDuplicate) {
      return NextResponse.json(
        { error: "Feedback already submitted for this case study. Please try again later." },
        { status: 429 }
      );
    }

    // Direct database write is the primary path during healthy operations
    try {
      const created = await prisma.caseStudyFeedback.create({
        data: {
          caseStudySlug,
          takeaways: JSON.stringify(takeaways),
          comments,
          connectionHash,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Feedback submitted successfully",
          feedback: {
            id: created.id,
            caseStudySlug: created.caseStudySlug,
            takeaways,
            comments: created.comments,
            createdAt: created.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database feedback creation failed, storing in durable Redis fallback:", dbErr);
      }

      const fallbackRecord = await saveFallbackFeedback({
        caseStudySlug,
        takeaways,
        comments,
        connectionHash,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Feedback submitted successfully",
          feedback: {
            id: fallbackRecord.id,
            caseStudySlug,
            takeaways,
            comments,
            createdAt: fallbackRecord.createdAt,
          },
        },
        { status: 201 }
      );
    }
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to process feedback submission:", err);
    return NextResponse.json(
      { error: "Internal server error processing feedback submission" },
      { status: 500 }
    );
  }
}
