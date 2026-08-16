import type { Metadata } from "next";
import { QuasiPuzzlerClient } from "@/components/arcade/QuasiPuzzlerClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.quasiPuzzler);

export default function QuasiPuzzlerPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Quasi-Perfect Puzzler: Aperiodic Logic",
            description: "Crystallographic tiling game based on Penrose aperiodicity, golden ratios, and deflation rules.",
            url: "/arcade/quasi-puzzler",
            applicationCategory: "GameApplication",
            genre: "Mathematical Puzzle",
          }),
        }}
      />
      <QuasiPuzzlerClient />
    </PageLayout>
  );
}
