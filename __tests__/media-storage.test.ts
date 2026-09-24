import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  LocalStorageProvider,
  VercelBlobStorageProvider,
  getMediaStorageProvider,
  setMediaStorageProvider,
  getMimeTypeForExtension,
  type MediaStorageProvider,
} from "@/lib/services/media-storage";
import * as envModule from "@/lib/env";

describe("Media Storage Provider Test Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    setMediaStorageProvider(null);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    setMediaStorageProvider(null);
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("getMimeTypeForExtension", () => {
    it("maps standard image extensions to their corresponding MIME types", () => {
      expect(getMimeTypeForExtension("jpg")).toBe("image/jpeg");
      expect(getMimeTypeForExtension("jpeg")).toBe("image/jpeg");
      expect(getMimeTypeForExtension("png")).toBe("image/png");
      expect(getMimeTypeForExtension("webp")).toBe("image/webp");
      expect(getMimeTypeForExtension("gif")).toBe("image/gif");
      expect(getMimeTypeForExtension("svg")).toBe("image/svg+xml");
      expect(getMimeTypeForExtension("avif")).toBe("image/avif");
    });

    it("handles case-insensitive extensions", () => {
      expect(getMimeTypeForExtension("JPG")).toBe("image/jpeg");
      expect(getMimeTypeForExtension("PnG")).toBe("image/png");
      expect(getMimeTypeForExtension("WEBP")).toBe("image/webp");
      expect(getMimeTypeForExtension("GIF")).toBe("image/gif");
      expect(getMimeTypeForExtension("SVG")).toBe("image/svg+xml");
      expect(getMimeTypeForExtension("AVIF")).toBe("image/avif");
    });

    it("returns application/octet-stream for unknown file extensions", () => {
      expect(getMimeTypeForExtension("bin")).toBe("application/octet-stream");
      expect(getMimeTypeForExtension("exe")).toBe("application/octet-stream");
      expect(getMimeTypeForExtension("txt")).toBe("application/octet-stream");
      expect(getMimeTypeForExtension("")).toBe("application/octet-stream");
    });
  });

  describe("LocalStorageProvider", () => {
    const mockDir = path.resolve("/mock/media-storage");

    it("uses default directory when no baseDir is passed", () => {
      const provider = new LocalStorageProvider();
      expect(provider.getUrl("sample.png")).toBe("/api/media/sample.png");
    });

    it("creates storage directory if it does not exist during upload", async () => {
      const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(false);
      const mkdirSpy = vi
        .spyOn(fs, "mkdirSync")
        .mockImplementation(() => undefined as unknown as string);
      const writeFileSpy = vi
        .spyOn(fs.promises, "writeFile")
        .mockResolvedValue(undefined);

      const provider = new LocalStorageProvider(mockDir);
      const fileBuffer = Buffer.from("test image data");
      const result = await provider.upload(
        fileBuffer,
        "test-image.png",
        "image/png"
      );

      expect(existsSpy).toHaveBeenCalledWith(mockDir);
      expect(mkdirSpy).toHaveBeenCalledWith(mockDir, { recursive: true });
      expect(writeFileSpy).toHaveBeenCalledWith(
        path.join(mockDir, "test-image.png"),
        fileBuffer
      );
      expect(result).toEqual({
        url: "/api/media/test-image.png",
        key: "test-image.png",
      });
    });

    it("skips creating directory if it already exists", async () => {
      const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true);
      const mkdirSpy = vi
        .spyOn(fs, "mkdirSync")
        .mockImplementation(() => undefined as unknown as string);
      vi.spyOn(fs.promises, "writeFile").mockResolvedValue(undefined);

      const provider = new LocalStorageProvider(mockDir);
      await provider.upload(Buffer.from("data"), "existing.png", "image/png");

      expect(existsSpy).toHaveBeenCalledWith(mockDir);
      expect(mkdirSpy).not.toHaveBeenCalled();
    });

    it("sanitizes keys to prevent directory traversal in file paths", async () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      const writeFileSpy = vi
        .spyOn(fs.promises, "writeFile")
        .mockResolvedValue(undefined);

      const provider = new LocalStorageProvider(mockDir);
      const result = await provider.upload(
        Buffer.from("traversal test"),
        "../../etc/passwd.png",
        "image/png"
      );

      expect(writeFileSpy).toHaveBeenCalledWith(
        path.join(mockDir, "passwd.png"),
        expect.any(Buffer)
      );
      expect(result.key).toBe("../../etc/passwd.png");
    });

    it("deletes existing file cleanly", async () => {
      const unlinkSpy = vi
        .spyOn(fs.promises, "unlink")
        .mockResolvedValue(undefined);

      const provider = new LocalStorageProvider(mockDir);
      await provider.delete("file-to-delete.png");

      expect(unlinkSpy).toHaveBeenCalledWith(
        path.join(mockDir, "file-to-delete.png")
      );
    });

    it("ignores errors gracefully when deleting a non-existent file", async () => {
      vi.spyOn(fs.promises, "unlink").mockRejectedValue(
        new Error("ENOENT: no such file or directory")
      );

      const provider = new LocalStorageProvider(mockDir);
      await expect(provider.delete("non-existent.png")).resolves.not.toThrow();
    });

    it("generates local media URLs correctly", () => {
      const provider = new LocalStorageProvider(mockDir);
      expect(provider.getUrl("my-avatar.webp")).toBe(
        "/api/media/my-avatar.webp"
      );
    });

    it("retrieves asset successfully when file exists", async () => {
      const contentBuffer = Buffer.from("asset content");
      vi.spyOn(fs.promises, "readFile").mockResolvedValue(contentBuffer);

      const provider = new LocalStorageProvider(mockDir);
      const asset = await provider.getAsset("hero-banner.jpg");

      expect(asset).not.toBeNull();
      expect(asset?.buffer).toEqual(contentBuffer);
      expect(asset?.contentType).toBe("image/jpeg");
      expect(asset?.createdAt).toBeInstanceOf(Date);
    });

    it("returns null when reading asset fails", async () => {
      vi.spyOn(fs.promises, "readFile").mockRejectedValue(new Error("ENOENT"));

      const provider = new LocalStorageProvider(mockDir);
      const asset = await provider.getAsset("missing.png");

      expect(asset).toBeNull();
    });
  });

  describe("VercelBlobStorageProvider", () => {
    const testToken = "vercel_blob_rw_test_token_12345";

    it("throws an error when constructor is called without token or BLOB_READ_WRITE_TOKEN in env", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        BLOB_READ_WRITE_TOKEN: undefined,
      });

      expect(() => new VercelBlobStorageProvider("")).toThrow(
        "BLOB_READ_WRITE_TOKEN is required for VercelBlobStorageProvider"
      );
    });

    it("initializes successfully when token is supplied explicitly", () => {
      const provider = new VercelBlobStorageProvider(testToken);
      expect(provider.getUrl("file.png")).toBe(
        "https://blob.vercel-storage.com/file.png"
      );
    });

    it("initializes successfully when token is read from getEnv()", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        BLOB_READ_WRITE_TOKEN: testToken,
      });

      const provider = new VercelBlobStorageProvider();
      expect(provider.getUrl("file.png")).toBe(
        "https://blob.vercel-storage.com/file.png"
      );
    });

    it("uploads file to Vercel Blob storage via PUT request", async () => {
      const provider = new VercelBlobStorageProvider(testToken);
      const fileBuffer = Buffer.from("cloud payload");

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            url: "https://abc.public.blob.vercel-storage.com/cloud-hero.png",
            pathname: "cloud-hero.png",
          }),
          { status: 200, statusText: "OK" }
        )
      );

      const result = await provider.upload(
        fileBuffer,
        "cloud-hero.png",
        "image/png"
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://blob.vercel-storage.com/cloud-hero.png",
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${testToken}`,
            "x-content-type": "image/png",
            "x-add-random-suffix": "false",
          },
          body: expect.any(Uint8Array),
        }
      );

      expect(result).toEqual({
        url: "https://abc.public.blob.vercel-storage.com/cloud-hero.png",
        key: "cloud-hero.png",
      });
    });

    it("uses filename as key if response does not contain pathname", async () => {
      const provider = new VercelBlobStorageProvider(testToken);

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            url: "https://abc.public.blob.vercel-storage.com/file.jpg",
          }),
          { status: 200, statusText: "OK" }
        )
      );

      const result = await provider.upload(
        Buffer.from("data"),
        "file.jpg",
        "image/jpeg"
      );
      expect(result.key).toBe("file.jpg");
    });

    it("throws error when Vercel Blob upload HTTP request fails", async () => {
      const provider = new VercelBlobStorageProvider(testToken);

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          statusText: "Unauthorized",
        })
      );

      await expect(
        provider.upload(Buffer.from("data"), "hero.png", "image/png")
      ).rejects.toThrow("Vercel Blob upload failed: Unauthorized");
    });

    it("deletes file from Vercel Blob storage via POST request", async () => {
      const provider = new VercelBlobStorageProvider(testToken);

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          statusText: "OK",
        })
      );

      await provider.delete(
        "https://abc.public.blob.vercel-storage.com/cloud-hero.png"
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://blob.vercel-storage.com/delete",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${testToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            urls: ["https://abc.public.blob.vercel-storage.com/cloud-hero.png"],
          }),
        }
      );
    });

    it("returns key as-is from getUrl if it is already an absolute HTTP/HTTPS URL", () => {
      const provider = new VercelBlobStorageProvider(testToken);
      const absoluteUrl =
        "https://abc.public.blob.vercel-storage.com/image.png";
      const httpUrl = "http://localhost:3000/api/media/image.png";

      expect(provider.getUrl(absoluteUrl)).toBe(absoluteUrl);
      expect(provider.getUrl(httpUrl)).toBe(httpUrl);
    });

    it("prefixes key with blob domain from getUrl if key is relative", () => {
      const provider = new VercelBlobStorageProvider(testToken);
      expect(provider.getUrl("relative-key.png")).toBe(
        "https://blob.vercel-storage.com/relative-key.png"
      );
    });
  });

  describe("getMediaStorageProvider & setMediaStorageProvider", () => {
    it("returns LocalStorageProvider by default when BLOB_READ_WRITE_TOKEN is unconfigured", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        BLOB_READ_WRITE_TOKEN: undefined,
      });

      const provider = getMediaStorageProvider();
      expect(provider).toBeInstanceOf(LocalStorageProvider);
    });

    it("returns VercelBlobStorageProvider when BLOB_READ_WRITE_TOKEN is configured in env", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_env_token_999",
      });

      const provider = getMediaStorageProvider();
      expect(provider).toBeInstanceOf(VercelBlobStorageProvider);
    });

    it("allows overriding active provider via setMediaStorageProvider", () => {
      const customProvider: MediaStorageProvider = {
        upload: vi.fn(),
        delete: vi.fn(),
        getUrl: (key) => `https://custom-cdn.com/${key}`,
      };

      setMediaStorageProvider(customProvider);
      const active = getMediaStorageProvider();

      expect(active).toBe(customProvider);
      expect(active.getUrl("asset.png")).toBe(
        "https://custom-cdn.com/asset.png"
      );
    });

    it("restores default environment provider when setMediaStorageProvider(null) is called", () => {
      const customProvider: MediaStorageProvider = {
        upload: vi.fn(),
        delete: vi.fn(),
        getUrl: vi.fn(),
      };

      setMediaStorageProvider(customProvider);
      expect(getMediaStorageProvider()).toBe(customProvider);

      setMediaStorageProvider(null);
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        BLOB_READ_WRITE_TOKEN: undefined,
      });

      expect(getMediaStorageProvider()).toBeInstanceOf(LocalStorageProvider);
    });
  });

  describe("Storage Fallback Logic", () => {
    it("falls back gracefully from Vercel Blob to Local Storage when cloud credentials are omitted", async () => {
      // Simulate environment where BLOB_READ_WRITE_TOKEN is absent
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ...envModule.getEnv(),
        BLOB_READ_WRITE_TOKEN: "",
      });

      const activeProvider = getMediaStorageProvider();
      expect(activeProvider).toBeInstanceOf(LocalStorageProvider);

      // Verify file operations work cleanly using local fallback
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      const writeFileSpy = vi
        .spyOn(fs.promises, "writeFile")
        .mockResolvedValue(undefined);

      const result = await activeProvider.upload(
        Buffer.from("fallback asset"),
        "fallback-image.png",
        "image/png"
      );

      expect(result.url).toBe("/api/media/fallback-image.png");
      expect(writeFileSpy).toHaveBeenCalledWith(
        expect.stringContaining("fallback-image.png"),
        expect.any(Buffer)
      );
    });

    it("executes fallback upload to LocalStorageProvider when primary VercelBlobStorageProvider upload fails", async () => {
      const cloudToken = "vercel_blob_rw_primary_123";
      const primaryCloudProvider = new VercelBlobStorageProvider(cloudToken);
      const fallbackLocalProvider = new LocalStorageProvider();

      // Mock cloud upload failure (e.g. 500 internal server error or network failure)
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ error: "Storage service unavailable" }), {
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      // Mock local storage fallback write
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs.promises, "writeFile").mockResolvedValue(undefined);

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Resilient upload pattern executing cloud upload with fallback to local storage
      const uploadWithFallback = async (
        file: Buffer,
        filename: string,
        contentType: string
      ) => {
        try {
          return await primaryCloudProvider.upload(file, filename, contentType);
        } catch (cloudError) {
          console.warn(
            "Primary cloud storage upload failed, attempting local fallback:",
            cloudError
          );
          return await fallbackLocalProvider.upload(
            file,
            filename,
            contentType
          );
        }
      };

      const fileBuffer = Buffer.from("resilient asset content");
      const result = await uploadWithFallback(
        fileBuffer,
        "resilient-hero.png",
        "image/png"
      );

      expect(result.url).toBe("/api/media/resilient-hero.png");
      expect(result.key).toBe("resilient-hero.png");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Primary cloud storage upload failed, attempting local fallback:",
        expect.any(Error)
      );
    });
  });
});
