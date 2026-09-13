-- Preserve aggregate telemetry before the maintenance pipeline prunes raw rows.
CREATE TABLE "TelemetryDailyRollup" (
    "day" DATE NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryDailyRollup_pkey" PRIMARY KEY ("day", "projectSlug", "eventType")
);

CREATE INDEX "TelemetryDailyRollup_day_idx" ON "TelemetryDailyRollup"("day");
