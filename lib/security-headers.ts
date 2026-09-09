import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

// A publishable key contains the instance hostname; never allow every Clerk tenant.
function clerkOrigin(): string {
  const key = getEnv().NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return "";
  try {
    const encoded = key.match(/^pk_(?:test|live)_(.+)$/)?.[1];
    if (!encoded) return "";
    const hostname = atob(encoded).replace(/\$$/, "");
    return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(hostname)
      ? `https://${hostname}`
      : "";
  } catch {
    return "";
  }
}

const authOrigin = clerkOrigin();

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com ${authOrigin} https://challenges.cloudflare.com https://*.protect.clerk.com`,
      `connect-src 'self' https://vitals.vercel-insights.com ${authOrigin} https://clerk-telemetry.com https://*.clerk-telemetry.com https://*.protect.clerk.com:*`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://img.clerk.com",
      "frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com",
      "worker-src 'self' blob:",
    ].join("; ") + ";",
};

/**
 * Applies global security headers to a NextResponse object.
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}
