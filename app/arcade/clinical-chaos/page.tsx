import type { Metadata } from "next";
import { ClinicalChaosClient } from "@/components/arcade/ClinicalChaosClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.clinicalChaos);

export default function ClinicalChaosPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Clinical Trial Chaos: CDISC Compliance",
            description: "Fast-paced compliance arcade. Map clinical variables across SDTM domains (DM, VS, AE, LB), sign electronic submissions, and survive FDA auditor scrutiny.",
            url: "/arcade/clinical-chaos",
            applicationCategory: "GameApplication",
            genre: "Regulatory Compliance Arcade",
          }),
        }}
      />
      <ClinicalChaosClient />
    </PageLayout>
  );
}
