import type { Metadata } from "next";
import { WorkingWithDuckClient } from "@/components/arcade/WorkingWithDuckClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.workingWithDuck);

export default function WorkingWithDuckPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Working With Duck: Rubber Duck Debugging",
            description: "Interactive conversational debugging simulator. Formulate hypotheses, diagnose tricky concurrency bugs, and preserve developer sanity.",
            url: "/arcade/working-with-duck",
            applicationCategory: "GameApplication",
            genre: "Developer Simulation",
          }),
        }}
      />
      <WorkingWithDuckClient />
    </PageLayout>
  );
}
