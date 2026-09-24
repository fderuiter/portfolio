import fs from "node:fs";
import path from "node:path";
import { getEnv } from "@/lib/env";

/**
 * Result of a media upload operation.
 */
export interface MediaUploadResult {
  url: string;
  key: string;
}

/**
 * Persisted media asset record returned by storage providers.
 */
export interface MediaAssetRecord {
  buffer: Buffer;
  contentType: string;
  createdAt: Date;
}

/**
 * Pluggable media storage provider contract per ADR 0043.
 */
export interface MediaStorageProvider {
  upload(
    file: Buffer,
    filename: string,
    contentType: string
  ): Promise<MediaUploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  getAsset?(key: string): Promise<MediaAssetRecord | null>;
}

/**
 * Maps common file extensions to standard image MIME types.
 */
export function getMimeTypeForExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

/**
 * Local filesystem storage provider persisting media assets to disk (.media-storage/).
 * Used in local development and automated testing environments.
 */
export class LocalStorageProvider implements MediaStorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), ".media-storage");
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    const safeKey = path.basename(key);
    return path.join(this.baseDir, safeKey);
  }

  async upload(
    file: Buffer,
    filename: string,
    _contentType: string
  ): Promise<MediaUploadResult> {
    this.ensureDir();
    const filePath = this.getFilePath(filename);
    await fs.promises.writeFile(filePath, file);
    return {
      url: `/api/media/${filename}`,
      key: filename,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // Ignored if file does not exist
    }
  }

  getUrl(key: string): string {
    return `/api/media/${key}`;
  }

  async getAsset(key: string): Promise<MediaAssetRecord | null> {
    const filePath = this.getFilePath(key);
    try {
      const buffer = await fs.promises.readFile(filePath);
      const ext = path.extname(key).replace(/^\./, "").toLowerCase();
      const contentType = getMimeTypeForExtension(ext);
      return {
        buffer,
        contentType,
        createdAt: new Date(),
      };
    } catch {
      return null;
    }
  }
}

/**
 * Cloud storage provider directing media uploads to Vercel Blob.
 * Active in preview and production environments with BLOB_READ_WRITE_TOKEN.
 */
export class VercelBlobStorageProvider implements MediaStorageProvider {
  private token: string;

  constructor(token?: string) {
    this.token = token || getEnv().BLOB_READ_WRITE_TOKEN || "";
    if (!this.token) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is required for VercelBlobStorageProvider"
      );
    }
  }

  async upload(
    file: Buffer,
    filename: string,
    contentType: string
  ): Promise<MediaUploadResult> {
    const res = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${this.token}`,
        "x-content-type": contentType,
        "x-add-random-suffix": "false",
      },
      body: new Uint8Array(file),
    });

    if (!res.ok) {
      throw new Error(`Vercel Blob upload failed: ${res.statusText}`);
    }

    const data = (await res.json()) as { url: string; pathname?: string };
    return {
      url: data.url,
      key: data.pathname || filename,
    };
  }

  async delete(key: string): Promise<void> {
    const res = await fetch("https://blob.vercel-storage.com/delete", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ urls: [key] }),
    });

    if (!res.ok) {
      throw new Error(`Vercel Blob delete failed: ${res.statusText}`);
    }
  }

  getUrl(key: string): string {
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    return `https://blob.vercel-storage.com/${key}`;
  }
}

let activeProvider: MediaStorageProvider | null = null;

/**
 * Returns the active MediaStorageProvider instance based on environment configuration.
 */
export function getMediaStorageProvider(): MediaStorageProvider {
  if (activeProvider) {
    return activeProvider;
  }

  const { BLOB_READ_WRITE_TOKEN: token, NODE_ENV, VERCEL_ENV } = getEnv();
  if (token && token.trim().length > 0) {
    return new VercelBlobStorageProvider(token);
  }

  if (
    NODE_ENV === "production" ||
    VERCEL_ENV === "production" ||
    VERCEL_ENV === "preview"
  ) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required for media storage in production or preview environments"
    );
  }

  return new LocalStorageProvider();
}

/**
 * Overrides the active MediaStorageProvider for testing or configuration.
 */
export function setMediaStorageProvider(
  provider: MediaStorageProvider | null
): void {
  activeProvider = provider;
}
