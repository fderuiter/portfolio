import { NextResponse } from "next/server";
import { TelemetryEventSchema } from "@/lib/schemas";
import { TelemetryService } from "@/lib/services/telemetry-service";
import { createApiHandler } from "@/lib/route-wrapper";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export const GET = createApiHandler(async () => {
  try {
    const formattedStats = await TelemetryService.getAggregateStats();
    return NextResponse.json(formattedStats, {
      status: 200,
      headers: {
        "Cache-Control":
          "public, max-age=10, s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Telemetry statistics aggregate query failed:", err);
    return NextResponse.json(
      { error: "Failed to compile aggregate portfolio telemetry" },
      { status: 500 }
    );
  }
});

export const POST = createApiHandler(
  async (req, { data }) => {
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

      const newEvent = await TelemetryService.recordEvent(data);

      const response = NextResponse.json(
        { success: true, event: newEvent },
        { status: 201 }
      );
      if (rateLimitRes.headers) {
        Object.entries(rateLimitRes.headers).forEach(([key, val]) => {
          response.headers.set(key, val);
        });
      }
      return response;
    } catch (err) {
      Sentry.captureException(err);
      console.error("Failed to commit telemetry event log:", err);
      return NextResponse.json(
        { error: "Failed to record telemetry interaction event" },
        { status: 500 }
      );
    }
  },
  {
    schema: TelemetryEventSchema,
    type: "body",
    customJsonError: "Invalid JSON body payload",
    customValidationError: (err) => {
      const issues = (
        err as {
          issues: Array<{ path: Array<string | number>; message: string }>;
        }
      ).issues;
      const firstIssue = issues[0];
      let errorMessage = "Validation failed";
      if (firstIssue && firstIssue.path[0] === "projectSlug") {
        errorMessage = "Missing or invalid projectSlug identifier";
      } else if (firstIssue && firstIssue.path[0] === "eventType") {
        errorMessage =
          "Missing or invalid eventType. Allowed: 'page_view', 'project_click', 'route_error', 'simulator_option_select', 'simulator_milestone_reached', 'simulator_schedule_click', 'simulator_report_copy'";
      }
      return {
        error: errorMessage,
        details: issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    },
  }
);
