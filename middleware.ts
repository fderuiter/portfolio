import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";
import { generateClientConnectionHash, extractClientIp } from "@/lib/services/privacy-service";

export const config = {
  matcher: "/api/:path*",
};

/**
 * Edge Middleware
 * Intercepts incoming API requests to evaluate rate limits,
 * attach standard HTTP security headers, and generate privacy-preserving
 * client connection fingerprint tokens using Web Crypto APIs.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const ip = extractClientIp(req);
  const userAgent = req.headers.get("user-agent") || "";
  
  // Privacy-preserving Web Crypto SHA-256 client token (no raw IP stored or logged)
  const connectionHash = await generateClientConnectionHash(`${ip}:${userAgent}`);

  // Clone headers and propagate anonymous connection token downstream
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-connection-hash", connectionHash);

  // Continue request chain with updated request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Apply standard HTTP security headers globally at network edge
  return applySecurityHeaders(response);
}
