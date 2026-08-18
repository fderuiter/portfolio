import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface EscapeXmlOptions {
  /**
   * Entity format for single quote escaping.
   * - '&apos;' for standard XML (default)
   * - '&#39;' for numeric single quote entity (used in term validation and attribute escaping)
   */
  singleQuoteEntity?: "&apos;" | "&#39;" | boolean;
}

/**
 * Parameterized text escaper.
 * Escapes XML special characters securely.
 * Supports configurable single quote entity formatting.
 */
export function escapeXml(
  unsafe: string | null | undefined,
  options?: EscapeXmlOptions | "&apos;" | "&#39;" | boolean
): string {
  if (!unsafe) return "";

  let singleQuote = "&apos;";
  if (typeof options === "boolean") {
    singleQuote = options ? "&#39;" : "&apos;";
  } else if (typeof options === "string") {
    singleQuote = options;
  } else if (options && options.singleQuoteEntity !== undefined) {
    if (typeof options.singleQuoteEntity === "boolean") {
      singleQuote = options.singleQuoteEntity ? "&#39;" : "&apos;";
    } else {
      singleQuote = options.singleQuoteEntity;
    }
  }

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, singleQuote);
}

/**
 * Synchronous pure JavaScript SHA-256 hash algorithm.
 * Executable in browser, Node.js, and Edge runtimes without external dependencies.
 */
function sha256(str: string): string {
  function K(i: number): number {
    return [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ][i];
  }

  const utf8 = unescape(encodeURIComponent(str));
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }

  const bitLength = utf8.length * 8;
  words[bitLength >> 5] |= 0x80 << (24 - (bitLength % 32));
  words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;

  let a = 0x6a09e667, b = 0xbb67ae85, c = 0x3c6ef372, d = 0xa54ff53a;
  let e = 0x510e527f, f = 0x9b05688c, g = 0x1f83d9ab, h = 0x5be0cd19;

  for (let i = 0; i < words.length; i += 16) {
    const w: number[] = new Array(64);
    for (let j = 0; j < 16; j++) w[j] = words[i + j] | 0;
    for (let j = 16; j < 64; j++) {
      const s0 = ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^ ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^ (w[j - 15] >>> 3);
      const s1 = ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^ ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let A = a, B = b, C = c, D = d, E = e, F = f, G = g, H = h;

    for (let j = 0; j < 64; j++) {
      const S1 = ((E >>> 6) | (E << 26)) ^ ((E >>> 11) | (E << 21)) ^ ((E >>> 25) | (E << 7));
      const ch = (E & F) ^ (~E & G);
      const temp1 = (H + S1 + ch + K(j) + w[j]) | 0;
      const S0 = ((A >>> 2) | (A << 30)) ^ ((A >>> 13) | (A << 19)) ^ ((A >>> 22) | (A << 10));
      const maj = (A & B) ^ (A & C) ^ (B & C);
      const temp2 = (S0 + maj) | 0;

      H = G;
      G = F;
      F = E;
      E = (D + temp1) | 0;
      D = C;
      C = B;
      B = A;
      A = (temp1 + temp2) | 0;
    }

    a = (a + A) | 0;
    b = (b + B) | 0;
    c = (c + C) | 0;
    d = (d + D) | 0;
    e = (e + E) | 0;
    f = (f + F) | 0;
    g = (g + G) | 0;
    h = (h + H) | 0;
  }

  return [a, b, c, d, e, f, g, h]
    .map((v) => (v < 0 ? v + 0x100000000 : v).toString(16).padStart(8, "0"))
    .join("");
}

export type RequestOrHeaders =
  | Request
  | Headers
  | { headers: Headers | { get(name: string): string | null } }
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

function extractHeaderValue(reqOrHeaders: RequestOrHeaders, name: string): string | null | undefined {
  if (!reqOrHeaders) return undefined;
  if ("headers" in reqOrHeaders && reqOrHeaders.headers && typeof reqOrHeaders.headers === "object" && "get" in reqOrHeaders.headers && typeof reqOrHeaders.headers.get === "function") {
    return reqOrHeaders.headers.get(name);
  }
  if ("get" in reqOrHeaders && typeof reqOrHeaders.get === "function") {
    return (reqOrHeaders as Headers).get(name);
  }
  if (typeof reqOrHeaders === "object") {
    const record = reqOrHeaders as Record<string, string | string[] | undefined>;
    const lower = name.toLowerCase();
    const val = record[lower] ?? record[name];
    if (Array.isArray(val)) return val[0];
    return val;
  }
  return undefined;
}

/**
 * Extracts client IP address from proxy request headers with trimmed whitespace.
 */
export function getClientIp(reqOrHeaders?: RequestOrHeaders): string {
  if (!reqOrHeaders) return "127.0.0.1";

  const rawXff = extractHeaderValue(reqOrHeaders, "x-forwarded-for");
  if (rawXff) {
    const firstIp = rawXff.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = extractHeaderValue(reqOrHeaders, "x-real-ip")?.trim();
  if (realIp) return realIp;

  return "127.0.0.1";
}

/**
 * Computes an anonymous device hash incorporating trimmed proxy IP and optional User-Agent.
 * Standardizes client identification across telemetry and feedback endpoints.
 */
export function getAnonymousDeviceHash(
  reqOrHeaders?: RequestOrHeaders,
  includeUserAgent: boolean = true
): string {
  const ip = getClientIp(reqOrHeaders);

  let userAgent = "";
  if (includeUserAgent && reqOrHeaders) {
    userAgent = extractHeaderValue(reqOrHeaders, "user-agent") || "";
  }

  const input = includeUserAgent && userAgent ? `${ip}:${userAgent}` : ip;
  return sha256(input);
}

/**
 * Standardized random identifier generator.
 * Generates element or component IDs using a clean hash string.
 */
export function generateId(prefix?: string): string {
  let randomPart = "";
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 9);
    } catch {
      randomPart = Math.random().toString(36).substring(2, 11);
    }
  } else {
    randomPart = Math.random().toString(36).substring(2, 11);
  }

  if (!prefix) return randomPart;
  return prefix.endsWith("-") || prefix.endsWith("_")
    ? `${prefix}${randomPart}`
    : `${prefix}-${randomPart}`;
}

export const generateRandomId = generateId;

/**
 * Validates whether a date string is valid clinical ISO-8601 format.
 */
export function isValidIsoDate(dateString?: string | null): boolean {
  if (!dateString || typeof dateString !== "string") return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})?)?$/;
  if (!isoRegex.test(dateString.trim())) return false;

  const timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
}

/**
 * Formats a date into clinical ISO-8601 UTC timestamp format.
 */
export function formatIsoDate(date?: Date | string | number | null): string {
  if (!date) return "";
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString();
  } catch {
    return "";
  }
}

/**
 * Formats a date for user presentation (UI timestamps).
 */
export function formatDisplayDate(
  date?: Date | string | number | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "";
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(d);
  } catch {
    return "";
  }
}

/**
 * Formats a date relative to now (e.g. 'Just now', '5m ago', '2h ago', '3d ago').
 */
export function formatRelativeTime(date?: Date | string | number | null): string {
  if (!date) return "";
  try {
    const d = date instanceof Date ? date : new Date(date);
    const time = d.getTime();
    if (isNaN(time)) return "";

    const now = Date.now();
    const diffMs = now - time;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 30) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDisplayDate(d);
  } catch {
    return "";
  }
}
