import type { Metadata } from "next";
import { GarminWatchClient } from "@/components/arcade/GarminWatchClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.garminWatch);

export default function GarminWatchPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Garmin Connect IQ Watch Face & Sensor Simulator",
            description: "Embedded Garmin Connect IQ simulator running high-performance Monkey C graphics rendering and sensor pipelines.",
            url: "/arcade/garmin-watch",
            applicationCategory: "GameApplication",
            genre: "Embedded Simulation",
          }),
        }}
      />
      <GarminWatchClient />
    </PageLayout>
  );
}
