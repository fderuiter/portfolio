import type { Metadata } from "next";
import { ROUTE_METADATA_CONFIGS, buildRouteMetadata } from "@/lib/seo-metadata";
import { StackOverviewView } from "@/components/stack/StackOverviewView";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.stack);

export default function StackPage() {
  return (
    <div className="min-h-screen pt-28 sm:pt-32">
      <StackOverviewView />
    </div>
  );
}
