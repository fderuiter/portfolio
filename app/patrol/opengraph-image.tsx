import {
  createSocialImageResponse,
  OG_IMAGE_SIZE,
  OG_IMAGE_CONTENT_TYPE,
} from "@/lib/og-image";
import { ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";

export const runtime = "nodejs";
export const alt =
  "Patrol Shift Studio: Midwest Ski Patrol Simulator | Frederick de Ruiter";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  const config = ROUTE_METADATA_CONFIGS.patrol;
  return createSocialImageResponse({
    category: "EMERGENCY SYSTEMS // PATROL SIMULATOR",
    title: config.title,
    description: config.description,
    badge: "OET ENGINE // TRIAGE FSM",
    tags: [
      "Ski Patrol",
      "OET Evaluation",
      "Triage FSM",
      "Clinical Judgment",
      "Winter Response",
    ],
    systemStatus: "SIMULATOR ONLINE // SHIFT ACTIVE",
  });
}
