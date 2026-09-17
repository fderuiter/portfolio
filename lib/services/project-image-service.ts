import DOMPurify from "isomorphic-dompurify";
import { CaseStudyService } from "@/lib/services/case-study-service";
import type { ServiceResult } from "@/lib/services/service-result";
import {
  getMediaStorageProvider,
  type MediaAssetRecord,
} from "@/lib/services/media-storage";

export type ProjectImageResult = ServiceResult<{
  key: string;
  hero_image_url: string;
}>;

export const MAX_PROJECT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

export type { MediaAssetRecord };

/**
 * Sanitizes SVG XML strings using DOMPurify defense-in-depth, stripping
 * scripts, foreign objects, inline event handlers, and external URLs per ADR 0043.
 */
export function sanitizeSvg(svgContent: string): string {
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: [
      "script",
      "feImage",
      "foreignObject",
      "iframe",
      "object",
      "embed",
    ],
    FORBID_ATTR: [
      "onload",
      "onerror",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
      "xlink:href",
    ],
    ALLOWED_URI_REGEXP: /^#/,
  });
}

/**
 * Checks file header magic bytes to prevent MIME-type spoofing and reject malformed files.
 */
export function validateImageMagicBytes(
  buffer: Buffer,
  mimeType: string
): boolean {
  if (!buffer || buffer.length === 0) return false;

  const normalizedMime = mimeType.toLowerCase();

  if (normalizedMime === "image/jpeg" || normalizedMime === "image/jpg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (normalizedMime === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 && // P
      buffer[2] === 0x4e && // N
      buffer[3] === 0x47 && // G
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (normalizedMime === "image/gif") {
    if (buffer.length < 6) return false;
    const header = buffer.toString("ascii", 0, 6);
    return header === "GIF87a" || header === "GIF89a";
  }

  if (normalizedMime === "image/webp") {
    if (buffer.length < 12) return false;
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }

  if (normalizedMime === "image/svg+xml") {
    const snippet = buffer
      .toString("utf-8", 0, Math.min(buffer.length, 1024))
      .toLowerCase();
    return snippet.includes("<svg") || snippet.includes("<?xml");
  }

  if (normalizedMime === "image/avif") {
    if (buffer.length < 12) return false;
    const ftyp = buffer.toString("ascii", 4, 8);
    const brand = buffer.toString("ascii", 8, 12);
    return ftyp === "ftyp" && (brand === "avif" || brand === "mif1");
  }

  return false;
}

/**
 * Validates file size, MIME type, and magic bytes.
 * Throws user-safe validation error if validation fails.
 */
export function validateProjectImage(buffer: Buffer, mimeType: string): void {
  if (!buffer || buffer.length === 0) {
    throw new Error("Invalid image payload: File is empty or missing.");
  }

  if (buffer.length > MAX_PROJECT_IMAGE_SIZE_BYTES) {
    throw new Error("File size exceeds maximum allowed limit of 5MB.");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType.toLowerCase())) {
    throw new Error(
      "Invalid image type. Allowed formats: JPEG, PNG, WebP, GIF, SVG, and AVIF."
    );
  }

  const isValidMagic = validateImageMagicBytes(buffer, mimeType);
  if (!isValidMagic) {
    throw new Error(
      "Malformed or corrupt image file header. Image magic bytes do not match declared content type."
    );
  }
}

/**
 * Helper to get file extension from MIME type.
 */
export function getExtensionForMimeType(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

export class ProjectImageService {
  /**
   * Saves a validated media buffer to storage and returns its relative asset URL.
   */
  static async saveMediaAsset(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const provider = getMediaStorageProvider();
    const result = await provider.upload(buffer, key, contentType);
    return result.url;
  }

  /**
   * Retrieves a media asset from storage by key.
   */
  static async getMediaAsset(key: string): Promise<MediaAssetRecord | null> {
    const provider = getMediaStorageProvider();
    if (provider.getAsset) {
      return await provider.getAsset(key);
    }
    return null;
  }

  /**
   * Deletes a media asset from storage by key.
   */
  static async deleteMediaAsset(key: string): Promise<boolean> {
    const provider = getMediaStorageProvider();
    try {
      await provider.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Processes, validates, persists, and links a project image asset to a case study.
   * If database persistence fails, the prior asset is preserved.
   */
  static async uploadProjectImage(
    slug: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<{ hero_image_url: string; key: string }> {
    // 1. Validate image format, size, and magic bytes
    validateProjectImage(fileBuffer, mimeType);

    // 2. SVG Defense-in-Depth sanitization
    if (mimeType.toLowerCase() === "image/svg+xml") {
      const sanitized = sanitizeSvg(fileBuffer.toString("utf-8"));
      fileBuffer = Buffer.from(sanitized, "utf-8");
      if (!validateImageMagicBytes(fileBuffer, mimeType)) {
        throw new Error(
          "Invalid image payload: Sanitized SVG contains no valid svg element."
        );
      }
    }

    // 3. Fetch existing case study to preserve prior asset URL on failure
    const existing = await CaseStudyService.getCaseStudyBySlug(slug);
    const priorAssetUrl = existing?.hero_image_url ?? null;

    // 4. Generate key and save media asset using provider
    const ext = getExtensionForMimeType(mimeType);
    const key = `project-${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const assetUrl = await ProjectImageService.saveMediaAsset(
      key,
      fileBuffer,
      mimeType
    );

    try {
      // 5. Atomic database persistence and cache eviction
      await CaseStudyService.updateCaseStudyImage(slug, assetUrl);
      return { hero_image_url: assetUrl, key };
    } catch (error) {
      // 6. On failure: Clean up newly created asset and ensure prior asset is preserved
      await ProjectImageService.deleteMediaAsset(key);
      if (existing) {
        try {
          await CaseStudyService.updateCaseStudyImage(slug, priorAssetUrl);
        } catch {
          // Best effort rollback
        }
      }
      throw error;
    }
  }
}
