import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { Metadata } from "next";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.crf);

export default function CRFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
