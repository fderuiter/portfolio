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
            name: ROUTE_METADATA_CONFIGS.laserLoon.title,
            description: ROUTE_METADATA_CONFIGS.laserLoon.description,
            url: ROUTE_METADATA_CONFIGS.laserLoon.path,
            applicationCategory: "GameApplication",
            genre: "Civic Arcade Shooter",
          }),
        }}
      />
      <LaserLoonClient />
    </PageLayout>
  );
}
