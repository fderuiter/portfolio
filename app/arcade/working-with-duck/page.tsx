import type { Metadata } from "next";
import { WorkingWithDuckClient } from "@/components/arcade/WorkingWithDuckClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.workingWithDuck);

export default function WorkingWithDuckPage() {
  return (
    <div className="min-h-screen pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Working With Duck",
            description: "Balance shipping code deadlines against managing Duck — an autonomous, fluffy white golden retriever puppy.",
            url: "/arcade/working-with-duck",
            applicationCategory: "GameApplication",
            genre: "Pet Simulation Arcade",
          }),
        }}
      />
      <WorkingWithDuckClient />
    </div>
  );
}
