import type { Metadata } from "next";
import { LaserLoonClient } from "@/components/arcade/LaserLoonClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.laserLoon);

export default function LaserLoonPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Laser Loon: Loon Command & Stratospheric Relay",
            description: "High-altitude atmospheric navigation and optical laser beam routing simulator.",
            url: "/arcade/laser-loon",
            applicationCategory: "GameApplication",
            genre: "Stratospheric Simulation",
          }),
        }}
      />
      <LaserLoonClient />
    </PageLayout>
  );
}
