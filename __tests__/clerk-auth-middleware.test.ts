import { describe, it, expect, vi, beforeEach } from "vitest";
import { isUserAuthorizedAdmin, requireAdmin, isCurrentUserAdmin } from "@/lib/auth/admin";
import * as envModule from "@/lib/env";

const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
  clerkMiddleware: (handler: unknown) => handler,
  createRouteMatcher: (routes: string[]) => (req: { nextUrl: { pathname: string } }) => {
    return routes.some((pattern) => {
      const regex = new RegExp("^" + pattern.replace(/\(\.\*\)/g, ".*") + "$");
      return regex.test(req.nextUrl.pathname);
    });
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe("Clerk Admin Authorization & Allowlist Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isUserAuthorizedAdmin() Pure Evaluation", () => {
    it("returns false when neither user ID nor emails are configured (closed by default)", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ADMIN_USER_IDS: undefined,
        ADMIN_EMAILS: undefined,
      } as ReturnType<typeof envModule.getEnv>);

      expect(isUserAuthorizedAdmin("user_123", ["admin@example.com"])).toBe(false);
    });

    it("authorizes user matching ADMIN_USER_IDS allowlist (case-insensitive)", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ADMIN_USER_IDS: "user_owner123, user_secondary456",
        ADMIN_EMAILS: "",
      } as ReturnType<typeof envModule.getEnv>);

      expect(isUserAuthorizedAdmin("USER_OWNER123", [])).toBe(true);
      expect(isUserAuthorizedAdmin("user_secondary456", [])).toBe(true);
      expect(isUserAuthorizedAdmin("user_intruder", [])).toBe(false);
    });

    it("authorizes user matching ADMIN_EMAILS allowlist", () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ADMIN_USER_IDS: "",
        ADMIN_EMAILS: "frederick@deruiter.dev, admin@deruiter.dev",
      } as ReturnType<typeof envModule.getEnv>);

      expect(isUserAuthorizedAdmin("user_any", ["FREDERICK@deruiter.dev"])).toBe(true);
      expect(isUserAuthorizedAdmin("user_any", ["guest@example.com", "admin@deruiter.dev"])).toBe(true);
      expect(isUserAuthorizedAdmin("user_any", ["stranger@other.org"])).toBe(false);
    });
  });

  describe("isCurrentUserAdmin() & requireAdmin() Server Guards", () => {
    it("returns false from isCurrentUserAdmin when session is unauthenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null });
      const isAdmin = await isCurrentUserAdmin();
      expect(isAdmin).toBe(false);
    });

    it("returns true from isCurrentUserAdmin when authenticated user is authorized", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ADMIN_USER_IDS: "user_admin_valid",
        ADMIN_EMAILS: "",
      } as ReturnType<typeof envModule.getEnv>);

      mockAuth.mockResolvedValue({ userId: "user_admin_valid" });
      mockCurrentUser.mockResolvedValue({
        id: "user_admin_valid",
        emailAddresses: [{ emailAddress: "admin@test.com" }],
      });

      const isAdmin = await isCurrentUserAdmin();
      expect(isAdmin).toBe(true);
    });

    it("redirects to /admin/login in requireAdmin() when user is unauthenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null });

      await requireAdmin();
      expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
    });

    it("throws 403 error in requireAdmin() when authenticated user lacks admin privileges", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ADMIN_USER_IDS: "user_allowed_only",
        ADMIN_EMAILS: "",
      } as ReturnType<typeof envModule.getEnv>);

      mockAuth.mockResolvedValue({ userId: "user_unauthorized" });
      mockCurrentUser.mockResolvedValue({
        id: "user_unauthorized",
        emailAddresses: [{ emailAddress: "unauthorized@test.com" }],
      });

      await expect(requireAdmin()).rejects.toThrow("403 Forbidden");
    });

    it("returns userId in requireAdmin() when user is authorized", async () => {
      vi.spyOn(envModule, "getEnv").mockReturnValue({
        ADMIN_USER_IDS: "user_authorized",
        ADMIN_EMAILS: "",
      } as ReturnType<typeof envModule.getEnv>);

      mockAuth.mockResolvedValue({ userId: "user_authorized" });
      mockCurrentUser.mockResolvedValue({
        id: "user_authorized",
        emailAddresses: [{ emailAddress: "authorized@test.com" }],
      });

      const result = await requireAdmin();
      expect(result).toEqual({ userId: "user_authorized" });
    });
  });
});
