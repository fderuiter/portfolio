import { NextRequest, NextResponse } from "next/server";
import { ReactionSubmissionSchema } from "@/lib/schemas";
import { CaseStudyService } from "@/lib/services/case-study-service";
import { getConnectionHashFromRequest } from "@/lib/services/privacy-service";
import { TelemetryService } from "@/lib/services/telemetry-service";
import { createApiHandler } from "@/lib/route-wrapper";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export const GET = createApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || searchParams.get("caseStudySlug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing required query parameter 'slug' or 'caseStudySlug'" },
      { status: 400 }
    );
  }

  const connectionHash = await getConnectionHashFromRequest(req);
  const result = await CaseStudyService.getReactions(slug, connectionHash);
  return NextResponse.json(result);
});

export const POST = createApiHandler(
  async (req: NextRequest, { data }) => {
    try {
      const rateLimitRes = await TelemetryService.isRateLimited(req);
      if (rateLimitRes.limited) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down rate pacing." },
          {
            status: 429,
            headers: rateLimitRes.headers,
          }
        );
      }

      const connectionHash = await getConnectionHashFromRequest(req);
      const result = await CaseStudyService.submitReaction(data, connectionHash);

      const response = NextResponse.json(
        {
          success: result.success,
          reactionType: result.reactionType,
          counts: result.counts,
          userReactions: result.userReactions,
        },
        { status: 200 }
      );

      if (rateLimitRes.headers) {
        Object.entries(rateLimitRes.headers).forEach(([key, val]) => {
          response.headers.set(key, val);
        });
      }

      return response;
    } catch (err) {
      Sentry.captureException(err);
      console.error("Failed to process reaction submission:", err);
      return NextResponse.json(
        { error: "Internal server error processing reaction submission" },
        { status: 500 }
      );
    }
  },
  {
    schema: ReactionSubmissionSchema,
    type: "body",
    customJsonError: "Invalid JSON body payload",
    customValidationError: (err) => {
      const issues = (err as { issues: Array<{ path: Array<string | number>; message: string }> }).issues;
      return {
        error: "Validation failed",
        details: issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    },
  }
);
