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
            name: "Laser Loon: Cryo Bug Hunter",
            description: "Control a cybernetic Canadian Loon. Aim lasers and launch ice blocks to vaporize runtime errors and frozen bugs.",
            url: "/arcade/laser-loon",
            applicationCategory: "GameApplication",
            genre: "Physics Arcade",
          }),
        }}
      />
      <LaserLoonClient />
    </div>
  );
}
