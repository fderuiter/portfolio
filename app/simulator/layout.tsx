import type { Metadata } from "next";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.simulator);

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Engineering Alignment & Incident Simulator",
            description: "Interactive incident commander decision tree — navigate high-stress production outages, architectural dilemmas, and verify technical candidate compatibility.",
            url: "/simulator",
            applicationCategory: "EducationalApplication",
            genre: "Incident Commander Simulator",
          }),
        }}
      />
      {children}
    </>
  );
}
