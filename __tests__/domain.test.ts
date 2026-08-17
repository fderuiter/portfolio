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

  it("prioritizes NEXT_PUBLIC_APP_URL on the server", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://env-resolved-domain.com/");
    expect(resolveBaseUrl()).toBe("https://env-resolved-domain.com");
  });

  it("falls back to the production canonical URL in production environment if NEXT_PUBLIC_APP_URL is omitted", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(resolveBaseUrl()).toBe("https://fderuiter-portfolio.vercel.app");

    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveBaseUrl()).toBe("https://fderuiter-portfolio.vercel.app");
  });

  it("falls back to localhost in non-production environments if NEXT_PUBLIC_APP_URL is omitted", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");
    expect(resolveBaseUrl()).toBe("http://localhost:3000");

    vi.stubEnv("VERCEL_ENV", "preview");
    expect(resolveBaseUrl()).toBe("http://localhost:3000");
  });
});
