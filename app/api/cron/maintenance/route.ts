import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/route-wrapper";
import { SyncParamsSchema } from "@/lib/schemas";
import {
  validateRouteInitialization,
  validateSyncRequest,
} from "@/lib/security";
import { MaintenanceService } from "@/lib/services/maintenance-service";

export const dynamic = "force-dynamic";

validateRouteInitialization();

export const GET = createApiHandler(
  async (req, { data }) => {
    const authResult = validateSyncRequest(req);
    if (!authResult.isValid && authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const summary = await MaintenanceService.run({ batchSize: data.batch });
    return NextResponse.json(summary, { status: 200 });
  },
  { schema: SyncParamsSchema, type: "query" }
);
