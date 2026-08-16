import { createSocialImageResponse, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "Frederick de Ruiter | Principal Systems Engineer & Designer";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return createSocialImageResponse({
    category: "PRINCIPAL SYSTEMS ENGINEER & DESIGNER",
    title: "Engineering Scalable Systems, Canvas Physics & CDISC Engines",
    description:
      "A high-performance portfolio featuring DOM-free canvas rendering engines, serverless Neon Postgres data streams, and robust clinical CDISC data pipelines.",
    badge: "PORTFOLIO // 2026",
    tags: ["Next.js 16", "React 19", "Canvas 2D", "Pretext", "Neon Postgres"],
    systemStatus: "ALL SYSTEMS OPERATIONAL",
  });
}
