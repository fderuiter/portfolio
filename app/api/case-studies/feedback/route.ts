import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { FeedbackSubmissionSchema } from "@/lib/schemas";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// In-memory fallback cache for mock/testing or secondary storage
const mockFeedbackStore = new Map<string, Array<{ takeaways: string[]; comments: string; connectionHash: string; createdAt: string }>>();

function getConnectionHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
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

    const hasSubmitted = feedbackList.some((f) => f.connectionHash === connectionHash);

    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      hasSubmitted,
      totalFeedback: feedbackList.length,
      feedback: feedbackList.map((f) => ({
        id: f.id,
        takeaways: JSON.parse(f.takeaways || "[]"),
        comments: f.comments,
        createdAt: f.createdAt,
      })),
    });
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.error("Failed to query case study feedback:", err);
    }
    const mockList = mockFeedbackStore.get(slug) || [];
    const hasSubmitted = mockList.some((f) => f.connectionHash === connectionHash);
    return NextResponse.json({
      success: true,
      caseStudySlug: slug,
      hasSubmitted,
      totalFeedback: mockList.length,
      feedback: mockList.map((f, i) => ({
        id: `mock-${i}`,
        takeaways: f.takeaways,
        comments: f.comments,
        createdAt: f.createdAt,
      })),
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

    // Check for duplicate feedback from the same connection hash within 1 hour
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existing = await prisma.caseStudyFeedback.findFirst({
        where: {
          caseStudySlug,
          connectionHash,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Feedback already submitted for this case study. Please try again later." },
          { status: 429 }
        );
      }

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
        console.error("Database feedback creation failed, using fallback:", dbErr);
      }
      const existingMock = (mockFeedbackStore.get(caseStudySlug) || []).find(
        (f) => f.connectionHash === connectionHash
      );
      if (existingMock) {
        return NextResponse.json(
          { error: "Feedback already submitted for this case study. Please try again later." },
          { status: 429 }
        );
      }

      const list = mockFeedbackStore.get(caseStudySlug) || [];
      const newEntry = {
        takeaways,
        comments,
        connectionHash,
        createdAt: new Date().toISOString(),
      };
      mockFeedbackStore.set(caseStudySlug, [...list, newEntry]);

      return NextResponse.json(
        {
          success: true,
          message: "Feedback submitted successfully",
          feedback: {
            id: `mock-${Date.now()}`,
            caseStudySlug,
            takeaways,
            comments,
            createdAt: newEntry.createdAt,
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
