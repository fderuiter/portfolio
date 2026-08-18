import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { ReactionSubmissionSchema, ALLOWED_REACTIONS } from "@/lib/schemas";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// In-memory fallback reactions store
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

    const userReactions = userReactionsList.map((ur) => ur.reactionType);

    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      counts,
      userReactions,
    });
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to query case study reactions:", err);
    }
    const counts = getDefaultCounts();
    const slugMap = mockReactionsStore.get(slug);
    if (slugMap) {
      for (const [r, count] of slugMap.entries()) {
        counts[r] = count;
      }
    }
    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      counts,
      userReactions: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    try {
      // Check if user already reacted with this type
      const existing = await prisma.caseStudyReaction.findFirst({
        where: {
          caseStudySlug,
          reactionType,
          connectionHash,
        },
      });

      if (!existing) {
        await prisma.caseStudyReaction.create({
          data: {
            caseStudySlug,
            reactionType,
            connectionHash,
          },
        });
      }

      // Fetch updated aggregate counts
      const reactions = await prisma.caseStudyReaction.groupBy({
        by: ["reactionType"],
        where: { caseStudySlug },
        _count: { id: true },
      });

      const userReactionsList = await prisma.caseStudyReaction.findMany({
        where: { caseStudySlug, connectionHash },
        select: { reactionType: true },
      });

      const counts = getDefaultCounts();
      for (const r of reactions) {
        if (counts[r.reactionType] !== undefined) {
          counts[r.reactionType] = r._count.id;
        }
      }

      return NextResponse.json(
        {
          success: true,
          reactionType,
          counts,
          userReactions: userReactionsList.map((ur) => ur.reactionType),
        },
        { status: 200 }
      );
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database reaction creation failed, using fallback:", dbErr);
      }
      if (!mockReactionsStore.has(caseStudySlug)) {
        mockReactionsStore.set(caseStudySlug, new Map());
      }
      const slugMap = mockReactionsStore.get(caseStudySlug)!;
      const currentCount = slugMap.get(reactionType) || 0;
      slugMap.set(reactionType, currentCount + 1);

      const counts = getDefaultCounts();
      for (const [r, count] of slugMap.entries()) {
        counts[r] = count;
      }

      return NextResponse.json(
        {
          success: true,
          reactionType,
          counts,
          userReactions: [reactionType],
        },
        { status: 200 }
      );
    }
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to process reaction submission:", err);
    return NextResponse.json(
      { error: "Internal server error processing reaction submission" },
      { status: 500 }
    );
  }
}
