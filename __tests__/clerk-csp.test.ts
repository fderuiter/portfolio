import { afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Clerk browser resource policy", () => {
  it.each(["more-mustang-704.clerk.accounts.dev", "clerk.example.com"])(
    "permits the configured Clerk host %s without allowing arbitrary scripts",
    async (host) => {
      vi.stubEnv(
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        `pk_test_${btoa(`${host}$`)}`
      );
      vi.resetModules();
      const { applySecurityHeaders } = await import("@/lib/security-headers");
      const response = applySecurityHeaders(NextResponse.next());
      const policy = response.headers.get("Content-Security-Policy")!;
      const directives = Object.fromEntries(
        policy
          .split(";")
          .filter(Boolean)
          .map((directive) => {
            const [name, ...sources] = directive.trim().split(/\s+/);
            return [name, sources];
          })
      );
      expect(directives["script-src"]).toContain(`https://${host}`);
      expect(directives["connect-src"]).toContain(`https://${host}`);
      expect(directives["frame-src"]).toContain(
        "https://challenges.cloudflare.com"
      );
      expect(directives["script-src"]).not.toContain("https:");
      expect(directives["script-src"]).not.toContain("*");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    }
  );
});
