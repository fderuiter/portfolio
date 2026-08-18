import { createSocialImageResponse, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/og-image";
import { ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";

export const runtime = "nodejs";
export const alt = "Garmin Connect IQ 32KB Memory Runner | Frederick de Ruiter";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  const config = ROUTE_METADATA_CONFIGS.garminWatch;
  return createSocialImageResponse({
    category: "ENGINEERING ARCADE // EMBEDDED SIMULATOR",
    title: config.title,
    description: config.description,
    badge: "MONKEY C // 32KB RAM",
    tags: ["Connect IQ", "Monkey C", "32KB RAM", "Embedded Allocator", "Canvas 2D"],
    systemStatus: "MEM_USAGE: 28KB // GC STABLE",
  });
}
