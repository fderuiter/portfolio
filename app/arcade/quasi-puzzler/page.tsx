import type { Metadata } from "next";
import { QuasiPuzzlerClient } from "@/components/arcade/QuasiPuzzlerClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.quasiPuzzler);

export default function QuasiPuzzlerPage() {
  return (
    <div className="min-h-screen pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Quasi-Perfect Puzzler",
            description: "Lean-style formal verification arcade. Drag and apply tactics to simplify mathematical AST goals and preserve theorem morality.",
            url: "/arcade/quasi-puzzler",
            applicationCategory: "GameApplication",
            genre: "Formal Logic Puzzle",
          }),
        }}
      />
      <QuasiPuzzlerClient />
    </div>
  );
}
