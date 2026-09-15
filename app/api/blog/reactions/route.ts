import { NextRequest, NextResponse } from "next/server";
import { BlogPostReactionSubmissionSchema } from "@/lib/schemas";
import { BlogPostService } from "@/lib/services/blog-service";
import { getConnectionHashFromRequest } from "@/lib/services/privacy-service";
import { createApiHandler } from "@/lib/route-wrapper";
import { checkSubmissionAttemptRateLimit } from "@/lib/moderation";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export const GET = createApiHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || searchParams.get("blogPostSlug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing required query parameter 'slug' or 'blogPostSlug'" },
      { status: 400 }
    );
  }

  const connectionHash = await getConnectionHashFromRequest(req);
  const result = await BlogPostService.getReactions(slug, connectionHash);
  return NextResponse.json(result);
});

export const POST = createApiHandler(
  async (req: NextRequest, { data }) => {
    try {
      const connectionHash = await getConnectionHashFromRequest(req);

      const rateLimitCheck = checkSubmissionAttemptRateLimit(connectionHash);
      if (rateLimitCheck.isRateLimited) {
        return NextResponse.json(
          { error: "Too many submission attempts. Please try again later." },
          { status: 429 }
        );
      }

      const result = await BlogPostService.submitReaction(data, connectionHash);

      if (result.notFound) {
        return NextResponse.json(
          { error: result.message || "Blog post not found or not published" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: result.success,
          reactionType: result.reactionType,
          counts: result.counts,
          userReactions: result.userReactions,
        },
        { status: 200 }
      );
    } catch (err) {
      Sentry.captureException(err);
      console.error("Failed to process blog post reaction submission:", err);
      return NextResponse.json(
        {
          error:
            "Internal server error processing blog post reaction submission",
        },
        { status: 500 }
      );
    }
  },
  {
    schema: BlogPostReactionSubmissionSchema,
    type: "body",
    customJsonError: "Invalid JSON body payload",
    customValidationError: (err) => {
      const issues = (
        err as {
          issues: Array<{ path: Array<string | number>; message: string }>;
        }
      ).issues;
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
