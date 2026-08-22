import { NextRequest, NextResponse } from "next/server";
import { NewsletterSubscriptionSchema } from "@/lib/schemas";
import { EmailService } from "@/lib/services/email-service";
import { getConnectionHashFromRequest } from "@/lib/services/privacy-service";
import { createApiHandler } from "@/lib/route-wrapper";
import { checkSubmissionAttemptRateLimit } from "@/lib/moderation";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

/**
 * Minimum duration in milliseconds required between form mount and submission.
 * Human users take > 2000ms to complete fields; bots submit instantaneously.
 */
const MIN_SUBMISSION_DURATION_MS = 2000;

export const POST = createApiHandler(
  async (req: NextRequest, { data }) => {
    try {
      const connectionHash = await getConnectionHashFromRequest(req);

      // 1. Anonymous Connection-Hash Rate Limiting (5 attempts per 10 minutes)
      const rateLimitCheck = checkSubmissionAttemptRateLimit(connectionHash, 5, 600000);
      if (rateLimitCheck.isRateLimited) {
        return NextResponse.json(
          { error: "Too many subscription attempts. Please try again later." },
          { status: 429 }
        );
      }

      // 2. Invisible Honeypot Trap Check
      if (data._gotcha && data._gotcha.trim().length > 0) {
        return NextResponse.json(
          {
            success: true,
            message: "You have been successfully subscribed to the systems dispatch.",
            simulated: true,
          },
          { status: 201 }
        );
      }

      // 3. Timestamp Elapsed Verification (Duration Gate)
      if (data._clientTimestamp && typeof data._clientTimestamp === "number") {
        const elapsed = Date.now() - data._clientTimestamp;
        if (elapsed < MIN_SUBMISSION_DURATION_MS) {
          return NextResponse.json(
            {
              success: true,
              message: "You have been successfully subscribed to the systems dispatch.",
              simulated: true,
            },
            { status: 201 }
          );
        }
      }

      // 4. Dispatch Newsletter Subscription
      const result = await EmailService.subscribeNewsletter(data.email, connectionHash);

      if (!result.success) {
        return NextResponse.json(
          {
            error:
              result.error ||
              "Unable to register subscription at this time. Please try again later.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "You have been successfully subscribed to the systems dispatch.",
          subscriberId: result.data?.id,
          simulated: result.simulated,
        },
        { status: 201 }
      );
    } catch (err) {
      Sentry.captureException(err);
      console.error("Failed to process newsletter subscription:", err);
      return NextResponse.json(
        { error: "Internal server error processing newsletter subscription" },
        { status: 500 }
      );
    }
  },
  {
    schema: NewsletterSubscriptionSchema,
    type: "body",
    customJsonError: "Invalid JSON body payload",
  }
);
