import type { Metadata } from "next";
import { RetroLabyrinthClient } from "@/components/arcade/RetroLabyrinthClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.retroLabyrinth);

export default function RetroLabyrinthPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Retro Labyrinth: Cellular Automata Dungeon",
            description: "Procedurally generated cellular automata maze crawler with dynamic lighting and CRT phosphor shaders.",
            url: "/arcade/retro-labyrinth",
            applicationCategory: "GameApplication",
            genre: "Roguelike Simulation",
          }),
        }}
      />
      <RetroLabyrinthClient />
    </PageLayout>
  );
}
