import type { Metadata } from "next";
import { MemeVaultClient } from "@/components/arcade/MemeVaultClient";
import { buildRouteMetadata, ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { getWebApplicationSchema } from "@/lib/seo";
import { PageLayout } from "@/components/PageLayout";

export const metadata: Metadata = buildRouteMetadata(ROUTE_METADATA_CONFIGS.memeVault);

export default function MemeVaultPage() {
  return (
    <PageLayout variant="studio" className="pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getWebApplicationSchema({
            name: "Secret Meme Vault & Developer Soundboard",
            description: "Synthesized Web Audio sound effects, Easter egg achievement trophies, and interactive engineering memes.",
            url: "/arcade/meme-vault",
            applicationCategory: "GameApplication",
            genre: "Secret Easter Egg Chamber",
          }),
        }}
      />
      <MemeVaultClient />
    </PageLayout>
  );
}
