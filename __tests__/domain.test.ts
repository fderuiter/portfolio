import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveBaseUrl } from "@/lib/domain";

describe("Dynamic Domain Helper (resolveBaseUrl)", () => {
  const originalWin = global.window;

  beforeEach(() => {
    // Start with window undefined (SSR mode)
    // @ts-expect-error - simulating SSR environment
    global.window = undefined;
  });

  afterEach(() => {
    global.window = originalWin;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("safely uses window.location.origin when in a browser environment", () => {
    vi.stubGlobal("window", {
      location: {
        origin: "https://browser-resolved-domain.com/",
      },
    });

    expect(resolveBaseUrl()).toBe("https://browser-resolved-domain.com");
  });

  it("prioritizes valid non-localhost NEXT_PUBLIC_APP_URL in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://custom.deruiter.dev/");
    expect(resolveBaseUrl()).toBe("https://custom.deruiter.dev");
  });

  it("defensively ignores localhost NEXT_PUBLIC_APP_URL in production and returns canonical domain", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    expect(resolveBaseUrl()).toBe("https://www.deruiter.dev");
  });

  it("falls back to the production canonical URL in production environment if NEXT_PUBLIC_APP_URL is omitted or undefined", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(resolveBaseUrl()).toBe("https://www.deruiter.dev");

    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveBaseUrl()).toBe("https://www.deruiter.dev");
  });

  it("prioritizes NEXT_PUBLIC_APP_URL in non-production environments", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.deruiter.dev/");
    expect(resolveBaseUrl()).toBe("https://staging.deruiter.dev");
  });

  it("falls back to localhost in non-production environments if NEXT_PUBLIC_APP_URL is omitted", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");
    expect(resolveBaseUrl()).toBe("http://localhost:3000");

    vi.stubEnv("VERCEL_ENV", "preview");
    expect(resolveBaseUrl()).toBe("http://localhost:3000");
  });
});
