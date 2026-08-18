import { NextRequest } from "next/server";

/**
 * Computes a privacy-preserving SHA-256 hash token from client IP / connection info
 * using standard Web Crypto APIs (crypto.subtle), safe for Edge and Node runtimes.
 * Never stores or logs plain-text IP addresses.
 */
export async function generateClientConnectionHash(ip: string): Promise<string> {
  const normalizedIp = ip?.trim() || "127.0.0.1";
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedIp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extracts client IP address from proxy headers without logging or retaining raw IP.
 */
export function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    if (ips[0]) {
      return ips[0].trim();
    }
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Generates an anonymous SHA-256 connection hash directly from a NextRequest.
 */
export async function getConnectionHashFromRequest(req: NextRequest): Promise<string> {
  const existingHash = req.headers.get("x-connection-hash");
  if (existingHash) {
    return existingHash;
  }
  const userAgent = req.headers.get("user-agent") || "";
  const ip = extractClientIp(req);
  return generateClientConnectionHash(`${ip}:${userAgent}`);
}
