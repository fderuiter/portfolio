import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";
import {
  generateClientConnectionHash,
  extractClientIp,
} from "@/lib/services/privacy-service";

const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isPublicAuthRoute = createRouteMatcher(["/admin/login(.*)"]);

/**
 * Next.js 16 Edge Proxy
 * Chains Clerk authentication for protected administrative routes,
 * generates privacy-preserving client connection tokens for API telemetry/rate limiting,
 * and attaches standard HTTP security headers globally.
 */
const authMiddleware = clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req) && !isPublicAuthRoute(req)) {
    await auth.protect();
  }

  const isApi = req.nextUrl.pathname.startsWith("/api");
  const requestHeaders = new Headers(req.headers);

  if (isApi) {
    const ip = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || "";
    const connectionHash = await generateClientConnectionHash(
      `${ip}:${userAgent}`
    );
    requestHeaders.set("x-connection-hash", connectionHash);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return applySecurityHeaders(response);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function proxy(req: NextRequest, event?: any) {
  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
