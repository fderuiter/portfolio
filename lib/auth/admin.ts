import { auth, currentUser } from "@clerk/nextjs/server";
import { getEnv } from "@/lib/env";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

/**
 * Parses comma-separated string of allowed identifiers into a trimmed lowercase set.
 */
function parseAllowedList(rawString?: string): Set<string> {
  if (!rawString) return new Set();
  return new Set(
    rawString
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Shape of a Clerk `EmailAddress` this module needs: structurally compatible
 * with `@clerk/backend`'s `EmailAddress` (and `@clerk/nextjs`'s re-export),
 * but expressed independently so tests can pass synthetic objects without
 * constructing real Clerk SDK instances.
 */
export interface AdminEmailCandidate {
  emailAddress?: string | null;
  verification?: { status?: string | null } | null;
}

/**
 * Pure evaluation helper determining if a given Clerk User ID or list of
 * email addresses is present in the server's authorized admin allowlist.
 *
 * Email-based authorization policy: only an address with
 * `verification.status === "verified"` can satisfy the `ADMIN_EMAILS`
 * allowlist. An address with no verification record, a non-"verified"
 * status, or a matching string but unverified ownership is never sufficient
 * — Clerk lets an account hold unverified email addresses, and an attacker
 * who adds an allowlisted address to their own account without proving
 * ownership must not inherit that address's trust. This check applies
 * uniformly to every address Clerk returns for the user (primary and
 * secondary alike): restricting it to only the primary address would not
 * close the gap, since Clerk does not require the primary address to be
 * verified either.
 */
export function isUserAuthorizedAdmin(
  userId?: string | null,
  emailAddresses?: AdminEmailCandidate[] | null
): boolean {
  const env = getEnv();
  const allowedUserIds = parseAllowedList(env.ADMIN_USER_IDS);
  const allowedEmails = parseAllowedList(env.ADMIN_EMAILS);

  // If no admin configuration exists, default closed for safety
  if (allowedUserIds.size === 0 && allowedEmails.size === 0) {
    return false;
  }

  if (userId && allowedUserIds.has(userId.trim().toLowerCase())) {
    return true;
  }

  if (emailAddresses && emailAddresses.length > 0) {
    for (const candidate of emailAddresses) {
      if (candidate?.verification?.status !== "verified") continue;
      const email = candidate.emailAddress;
      if (email && allowedEmails.has(email.trim().toLowerCase())) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Server-side helper to check if the active Clerk session belongs to an authorized admin.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await currentUser();
    const emailAddresses = user?.emailAddresses ?? [];

    return isUserAuthorizedAdmin(userId, emailAddresses);
  } catch (error) {
    logger.error("[AUTH] Error verifying current admin user:", error);
    return false;
  }
}

/**
 * Structured auth session state for admin and author interfaces.
 */
export interface AdminAuthSession {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string;
  primaryEmail: string;
  displayName: string;
  user: Awaited<ReturnType<typeof currentUser>>;
}

/**
 * Server-side helper to acquire the active session for admin pages.
 * Redirects unauthenticated visitors to `/admin/login`, and returns
 * structured authorization state without throwing runtime exceptions.
 */
export async function getAdminAuthSession(): Promise<AdminAuthSession> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/admin/login");
    return {
      isAuthenticated: false,
      isAdmin: false,
      userId: "",
      primaryEmail: "",
      displayName: "",
      user: null,
    };
  }

  const user = await currentUser();
  const emailAddresses = user?.emailAddresses ?? [];
  const primaryEmail = emailAddresses[0]?.emailAddress ?? "N/A";
  const displayName = user?.fullName || user?.firstName || "Author";
  const isAdmin = isUserAuthorizedAdmin(userId, emailAddresses);

  return {
    isAuthenticated: true,
    isAdmin,
    userId,
    primaryEmail,
    displayName,
    user,
  };
}

/**
 * Enforces admin authorization on Server Components or Server Actions.
 * Redirects to /admin/login if unauthenticated, or throws an authorization error if unauthorized.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/admin/login");
    return { userId: "" };
  }

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error(
      "403 Forbidden: User does not have administrator privileges."
    );
  }

  return { userId };
}
