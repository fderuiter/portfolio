import type { Metadata } from "next";
import { LaserLoonClient } from "@/components/arcade/LaserLoonClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.laserLoon);

export default function LaserLoonPage() {
  return (
    <div className="min-h-screen pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Laser Loon: Quest for the State Flag",
            description: "Pilot submission F277 Laser Loon on the Road to the Capitol in this retro canvas shooter.",
            url: "/arcade/laser-loon",
            applicationCategory: "GameApplication",
            genre: "Civic Arcade Shooter",
          }),
        }}
      />
      <LaserLoonClient />
    </div>
  );
}
