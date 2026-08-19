import { auth, currentUser } from "@clerk/nextjs/server";
import { getEnv } from "@/lib/env";
import { redirect } from "next/navigation";

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
 * Pure evaluation helper determining if a given Clerk User ID or list of emails
 * is present in the server's authorized admin allowlist.
 */
export function isUserAuthorizedAdmin(
  userId?: string | null,
  emailAddresses?: (string | undefined | null)[] | null
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
    for (const email of emailAddresses) {
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
    const emails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

    return isUserAuthorizedAdmin(userId, emails);
  } catch (error) {
    console.error("[AUTH] Error verifying current admin user:", error);
    return false;
  }
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
    throw new Error("403 Forbidden: User does not have administrator privileges.");
  }

  return { userId };
}
