import { NextResponse } from "next/server";
import { validateRouteInitialization, validateSyncRequest } from "@/lib/security";
import { SyncParamsSchema } from "@/lib/schemas";
import { TelemetryService } from "@/lib/services/telemetry-service";
import { createApiHandler } from "@/lib/route-wrapper";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

validateRouteInitialization();

export const GET = createApiHandler(
  async (req) => {
    const authResult = validateSyncRequest(req);
    if (!authResult.isValid && authResult.errorResponse) {
      return authResult.errorResponse;
    }

    try {
      const url = new URL(req.url);
      const batchParam = url.searchParams.get("batch");
      const parsedQuery = SyncParamsSchema.safeParse({
        batch: batchParam !== null ? batchParam : undefined,
      });

      if (!parsedQuery.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: parsedQuery.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      const BATCH_SIZE = parsedQuery.data.batch;
      const result = await TelemetryService.syncBufferedEvents(BATCH_SIZE);

      if (result.processed === 0) {
        return NextResponse.json({ success: true, processed: 0 });
      }

      return NextResponse.json({
        success: true,
        processed: result.processed,
        inserted: result.inserted,
      });
    } catch (err) {
      Sentry.captureException(err);
      console.error("Failed to sync buffered telemetry events:", err);
      return NextResponse.json(
        { error: "Failed to sync events to primary database" },
        { status: 500 }
      );
    }
  }
);
