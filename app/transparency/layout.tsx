import type { Metadata } from "next";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.transparency);

export default function TransparencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Platform Transparency Hub | Real-Time Telemetry",
            description: "Verifiable operational metrics, live security telemetry, rate-limiting audit logs, and build reliability statistics.",
            url: "/transparency",
            applicationCategory: "DeveloperApplication",
            genre: "Telemetry & Security Observability Dashboard",
          }),
        }}
      />
      {children}
    </>
  );
}
