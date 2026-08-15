import type { Metadata } from "next";
import { ArcadeHubClient } from "@/components/arcade/ArcadeHubClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getCollectionPageSchema } from "@/lib/seo";
import { ARCADE_GAMES_METADATA } from "@/lib/arcade-data";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.arcade);

export default function ArcadePage() {
  const collectionItems = ARCADE_GAMES_METADATA.map((game) => ({
    name: game.title,
    url: game.route,
    description: game.description,
  }));

  return (
    <main className="min-h-screen pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getCollectionPageSchema(
            "Engineering Arcade Hub & Systems Simulators",
            "Interactive physics engines, formal logic puzzles, and embedded memory simulators by Frederick de Ruiter.",
            "/arcade",
            collectionItems
          ),
        }}
      />
      <ArcadeHubClient />
    </main>
  );
}
