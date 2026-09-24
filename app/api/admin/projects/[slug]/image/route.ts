import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import {
  ProjectImageService,
  MAX_PROJECT_IMAGE_SIZE_BYTES,
} from "@/lib/services/project-image-service";
import { CaseStudyService } from "@/lib/services/case-study-service";
import { applySecurityHeaders } from "@/lib/security-headers";
import { sanitizeError } from "@/lib/error-sanitization";
import { createApiHandler } from "@/lib/route-wrapper";
import { logger } from "@/lib/logger";

interface FormFileBlob {
  arrayBuffer(): Promise<ArrayBuffer>;
  type?: string;
}

export const dynamic = "force-dynamic";

export const POST = createApiHandler(
  async (req, { params }) => {
    const slug =
      typeof params.slug === "string"
        ? params.slug
        : Array.isArray(params.slug)
          ? params.slug[0] || ""
          : "";

    if (!slug) {
      const res = NextResponse.json(
        { error: "Project slug parameter is required" },
        { status: 400 }
      );
      return applySecurityHeaders(res, req);
    }

    // 1. Enforce Server-Side Administrator Authorization
    const { userId } = await auth();
    if (!userId) {
      const res = NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
      return applySecurityHeaders(res, req);
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      const res = NextResponse.json(
        { error: "Administrator access required" },
        { status: 403 }
      );
      return applySecurityHeaders(res, req);
    }

    // 2. Parse Multipart Form Data Payload
    try {
      const contentLength = req.headers.get("content-length");
      if (
        contentLength &&
        parseInt(contentLength, 10) > MAX_PROJECT_IMAGE_SIZE_BYTES + 64 * 1024
      ) {
        const res = NextResponse.json(
          { error: "File size exceeds maximum allowed limit of 5MB." },
          { status: 400 }
        );
        return applySecurityHeaders(res, req);
      }

      const formData = await req.formData();
      const file = formData.get("file") || formData.get("image");

      if (
        !file ||
        typeof file === "string" ||
        typeof (file as unknown as FormFileBlob).arrayBuffer !== "function"
      ) {
        const res = NextResponse.json(
          { error: "Image file is required in 'file' or 'image' field" },
          { status: 400 }
        );
        return applySecurityHeaders(res, req);
      }

      const fileBlob = file as unknown as FormFileBlob & { size?: number };
      if (
        typeof fileBlob.size === "number" &&
        fileBlob.size > MAX_PROJECT_IMAGE_SIZE_BYTES
      ) {
        const res = NextResponse.json(
          { error: "File size exceeds maximum allowed limit of 5MB." },
          { status: 400 }
        );
        return applySecurityHeaders(res, req);
      }

      const arrayBuffer = await fileBlob.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_PROJECT_IMAGE_SIZE_BYTES) {
        const res = NextResponse.json(
          { error: "File size exceeds maximum allowed limit of 5MB." },
          { status: 400 }
        );
        return applySecurityHeaders(res, req);
      }

      const buffer = Buffer.from(arrayBuffer);
      const mimeType = fileBlob.type || "application/octet-stream";

      // 3. Process, Validate & Upload Project Image Asset
      const result = await ProjectImageService.uploadProjectImage(
        slug,
        buffer,
        mimeType
      );

      const res = NextResponse.json(
        {
          success: true,
          data: {
            slug,
            hero_image_url: result.hero_image_url,
            key: result.key,
          },
        },
        { status: 200 }
      );
      return applySecurityHeaders(res, req);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Image processing failed";

      // Handle known user validation errors (size limit, file format, magic bytes)
      if (
        message.includes("limit") ||
        message.includes("Invalid") ||
        message.includes("Malformed") ||
        message.includes("Header") ||
        message.includes("exceeds") ||
        message.includes("not found")
      ) {
        const res = NextResponse.json({ error: message }, { status: 400 });
        return applySecurityHeaders(res, req);
      }

      logger.error("Project image upload failed:", sanitizeError(err));
      const res = NextResponse.json(
        { error: "Failed to process and store project image" },
        { status: 500 }
      );
      return applySecurityHeaders(res, req);
    }
  },
  { auth: "clerk_admin" }
);

export const DELETE = createApiHandler(
  async (req, { params }) => {
    const slug =
      typeof params.slug === "string"
        ? params.slug
        : Array.isArray(params.slug)
          ? params.slug[0] || ""
          : "";

    if (!slug) {
      const res = NextResponse.json(
        { error: "Project slug parameter is required" },
        { status: 400 }
      );
      return applySecurityHeaders(res, req);
    }

    const { userId } = await auth();
    if (!userId) {
      const res = NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
      return applySecurityHeaders(res, req);
    }

    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      const res = NextResponse.json(
        { error: "Administrator access required" },
        { status: 403 }
      );
      return applySecurityHeaders(res, req);
    }

    try {
      const existing = await CaseStudyService.getCaseStudyBySlug(slug);
      if (!existing) {
        const res = NextResponse.json(
          { error: `Case study with slug "${slug}" not found` },
          { status: 404 }
        );
        return applySecurityHeaders(res, req);
      }

      const priorKey = ProjectImageService.extractMediaKeyFromUrl(
        existing.hero_image_url
      );

      await CaseStudyService.updateCaseStudyImage(slug, null);

      if (priorKey) {
        await ProjectImageService.deleteMediaAsset(priorKey);
      }

      const res = NextResponse.json(
        { success: true, data: { slug, hero_image_url: null } },
        { status: 200 }
      );
      return applySecurityHeaders(res, req);
    } catch (err) {
      logger.error("Failed to clear project image:", sanitizeError(err));
      const res = NextResponse.json(
        { error: "Failed to clear project image" },
        { status: 500 }
      );
      return applySecurityHeaders(res, req);
    }
  },
  { auth: "clerk_admin" }
);
