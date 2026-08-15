import type { Metadata } from "next";
import { GarminWatchClient } from "@/components/arcade/GarminWatchClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.garminWatch);

export default function GarminWatchPage() {
  return (
    <div className="min-h-screen pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Garmin Connect IQ 32KB Memory Runner",
            description: "Circular 280×280 smartwatch simulator. Navigate severe 32KB RAM memory constraints, manage garbage collection (GC) freezes, and wipe thermal condensation.",
            url: "/arcade/garmin-watch",
            applicationCategory: "GameApplication",
            genre: "Embedded Simulation",
          }),
        }}
      />
      <GarminWatchClient />
    </div>
  );
}
