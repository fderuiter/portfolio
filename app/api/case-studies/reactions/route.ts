import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import crypto from "crypto";
import { ReactionSubmissionSchema, ALLOWED_REACTIONS } from "@/lib/schemas";
import { enforceRateLimit } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// Ephemeral/in-memory fallback reactions store as secondary buffer
const mockReactionsStore = new Map<string, Map<string, number>>();

function getConnectionHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}

function getDefaultCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of ALLOWED_REACTIONS) {
    counts[r] = 0;
  }
  return counts;
}

interface FallbackReactionEntry {
  id: string;
  caseStudySlug: string;
  reactionType: string;
  connectionHash: string;
  createdAt: string;
}

/**
 * Retrieves cached reaction entries from durable Redis fallback storage and in-memory cache.
 */
async function getFallbackReactions(slug: string): Promise<FallbackReactionEntry[]> {
  const items: FallbackReactionEntry[] = [];

  try {
    const rawList = await redis.lrange(`reaction_fallback:${slug}`, 0, -1);
    if (Array.isArray(rawList)) {
      for (const raw of rawList) {
        try {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (parsed && typeof parsed === "object") {
            items.push({
              id: parsed.id || `fallback-rx-${Date.now()}`,
              caseStudySlug: parsed.caseStudySlug || slug,
              reactionType: parsed.reactionType || "",
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
      console.error("Failed to query Redis reaction fallback store:", err);
    }
  }

  const slugMap = mockReactionsStore.get(slug);
  if (slugMap) {
    for (const [rType, count] of slugMap.entries()) {
      const existingCount = items.filter((i) => i.reactionType === rType).length;
      const deficit = count - existingCount;
      for (let i = 0; i < deficit; i++) {
        items.push({
          id: `mock-rx-${rType}-${i}`,
          caseStudySlug: slug,
          reactionType: rType,
          connectionHash: `mock-hash-${i}`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return items;
}

/**
 * Persists fallback reaction entry into durable Upstash Redis fallback storage.
 */
async function saveFallbackReaction(entry: {
  caseStudySlug: string;
  reactionType: string;
  connectionHash: string;
}): Promise<FallbackReactionEntry> {
  const createdAt = new Date().toISOString();
  const id = `fallback-rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const record: FallbackReactionEntry = {
    id,
    caseStudySlug: entry.caseStudySlug,
    reactionType: entry.reactionType,
    connectionHash: entry.connectionHash,
    createdAt,
  };

  if (!mockReactionsStore.has(entry.caseStudySlug)) {
    mockReactionsStore.set(entry.caseStudySlug, new Map());
  }
  const slugMap = mockReactionsStore.get(entry.caseStudySlug)!;
  const currentCount = slugMap.get(entry.reactionType) || 0;
  slugMap.set(entry.reactionType, currentCount + 1);

  try {
    const p = redis.pipeline();
    p.lpush(`reaction_fallback:${entry.caseStudySlug}`, JSON.stringify(record));
    p.expire(`reaction_fallback:${entry.caseStudySlug}`, 172800); // 48-hour TTL
    await p.exec();
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to save reaction to durable Redis fallback storage:", err);
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
    const reactions = await prisma.caseStudyReaction.groupBy({
      by: ["reactionType"],
      where: { caseStudySlug: slug },
      _count: { id: true },
    });

    const userReactionsList = await prisma.caseStudyReaction.findMany({
      where: { caseStudySlug: slug, connectionHash },
      select: { reactionType: true },
    });

    const counts = getDefaultCounts();
    for (const r of reactions) {
      if (counts[r.reactionType] !== undefined) {
        counts[r.reactionType] = r._count.id;
      }
    }

    const fallbackEntries = await getFallbackReactions(slug);
    for (const f of fallbackEntries) {
      if (counts[f.reactionType] !== undefined) {
        counts[f.reactionType] += 1;
      }
    }

    const userReactionsSet = new Set<string>(userReactionsList.map((ur) => ur.reactionType));
    for (const f of fallbackEntries) {
      if (f.connectionHash === connectionHash && f.reactionType) {
        userReactionsSet.add(f.reactionType);
      }
    }

    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      counts,
      userReactions: Array.from(userReactionsSet),
    });
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to query case study reactions from primary database:", err);
    }
    const counts = getDefaultCounts();
    const fallbackEntries = await getFallbackReactions(slug);
    for (const f of fallbackEntries) {
      if (counts[f.reactionType] !== undefined) {
        counts[f.reactionType] += 1;
      }
    }

    const userReactionsSet = new Set<string>();
    for (const f of fallbackEntries) {
      if (f.connectionHash === connectionHash && f.reactionType) {
        userReactionsSet.add(f.reactionType);
      }
    }

    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      counts,
      userReactions: Array.from(userReactionsSet),
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

    const result = ReactionSubmissionSchema.safeParse(payload);
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

    const { caseStudySlug, reactionType } = result.data;
    const connectionHash = getConnectionHash(req);

    // Evaluate deduplication across primary database and active fallback entries
    let alreadyReacted = false;

    try {
      const existing = await prisma.caseStudyReaction.findFirst({
        where: {
          caseStudySlug,
          reactionType,
          connectionHash,
        },
      });
      if (existing) {
        alreadyReacted = true;
      }
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database reaction check failed, relying on fallback store:", dbErr);
      }
    }

    if (!alreadyReacted) {
      const fallbackEntries = await getFallbackReactions(caseStudySlug);
      const duplicateFallback = fallbackEntries.find(
        (f) => f.reactionType === reactionType && f.connectionHash === connectionHash
      );
      if (duplicateFallback) {
        alreadyReacted = true;
      }
    }

    if (!alreadyReacted) {
      // Direct database write is the primary path during healthy operations
      try {
        await prisma.caseStudyReaction.create({
          data: {
            caseStudySlug,
            reactionType,
            connectionHash,
          },
        });
      } catch (dbErr) {
        if (env.VERCEL_ENV === "production") {
          console.error("Database reaction creation failed, storing in durable Redis fallback:", dbErr);
        }

        await saveFallbackReaction({
          caseStudySlug,
          reactionType,
          connectionHash,
        });
      }
    }

    // Retrieve updated aggregate counts across primary database and active Redis fallback entries
    const counts = getDefaultCounts();
    const userReactionsSet = new Set<string>();

    try {
      const reactions = await prisma.caseStudyReaction.groupBy({
        by: ["reactionType"],
        where: { caseStudySlug },
        _count: { id: true },
      });

      for (const r of reactions) {
        if (counts[r.reactionType] !== undefined) {
          counts[r.reactionType] = r._count.id;
        }
      }

      const userReactionsList = await prisma.caseStudyReaction.findMany({
        where: { caseStudySlug, connectionHash },
        select: { reactionType: true },
      });

      userReactionsList.forEach((ur) => userReactionsSet.add(ur.reactionType));
    } catch {
      // Primary DB query failed: counts will be aggregated strictly from fallback store
    }

    const fallbackEntries = await getFallbackReactions(caseStudySlug);
    for (const f of fallbackEntries) {
      if (counts[f.reactionType] !== undefined) {
        counts[f.reactionType] += 1;
      }
      if (f.connectionHash === connectionHash && f.reactionType) {
        userReactionsSet.add(f.reactionType);
      }
    }

    return NextResponse.json(
      {
        success: true,
        reactionType,
        counts,
        userReactions: Array.from(userReactionsSet),
      },
      { status: 200 }
    );
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to process reaction submission:", err);
    return NextResponse.json(
      { error: "Internal server error processing reaction submission" },
      { status: 500 }
    );
  }
}
