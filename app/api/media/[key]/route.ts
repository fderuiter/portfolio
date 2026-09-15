import { NextRequest, NextResponse } from "next/server";
import { ProjectImageService } from "@/lib/services/project-image-service";
import { applySecurityHeaders } from "@/lib/security-headers";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  const { key } = await context.params;

  if (!key) {
    const response = NextResponse.json(
      { error: "Media asset key is required" },
      { status: 400 }
    );
    return applySecurityHeaders(response, req);
  }

  const asset = ProjectImageService.getMediaAsset(key);
  if (!asset) {
    const response = NextResponse.json(
      { error: "Media asset not found" },
      { status: 404 }
    );
    return applySecurityHeaders(response, req);
  }

  const response = new NextResponse(new Uint8Array(asset.buffer), {
    status: 200,
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });

  return applySecurityHeaders(response, req);
}
