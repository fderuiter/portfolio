import type { Metadata } from "next";
import { RetroLabyrinthClient } from "@/components/arcade/RetroLabyrinthClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.retroLabyrinth);

export default function RetroLabyrinthPage() {
  return (
    <div className="min-h-screen pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Retro Labyrinth: Graveyard Roguelike",
            description: "Dungeon crawler exploring abandoned codebases. Navigate TSP dynamic shifting walls, wield developer weapons (npm install, git push -f), and defeat the 3D FaceForge boss.",
            url: "/arcade/retro-labyrinth",
            applicationCategory: "GameApplication",
            genre: "Dungeon Roguelike",
          }),
        }}
      />
      <RetroLabyrinthClient />
    </div>
  );
}
