/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEnv } from "./env";

/**
 * Utility to sanitize errors for production environment console output.
 * Blocks the leak of absolute system paths and deep stack traces.
 */

export function sanitizeString(str: string): string {
  if (!str) return str;

  let scrubbed = str;

  // 1. Scrub Windows absolute paths (e.g. C:\Users\...)
  scrubbed = scrubbed.replace(/[a-zA-Z]:\\[^\s:)]+/g, "[scrubbed]");

  // 2. Scrub Unix absolute paths starting with system or app roots
  // Support typical routes: Users, home, app, var, opt, tmp, usr, private, etc.
  scrubbed = scrubbed.replace(/\/(?:Users|home|app|var|opt|tmp|usr|private)\/[^\s:)]+/g, "[scrubbed]");

  // 3. Scrub Unix absolute paths pointing to files with extensions anywhere
  scrubbed = scrubbed.replace(/\/(?:[a-zA-Z0-9_\-\.]+\/)+[a-zA-Z0-9_\-\.]+\.(?:ts|tsx|js|jsx|json|html|css|sh|py|go|rs|md|png|jpg|jpeg|gif)/g, "[scrubbed]");

  return scrubbed;
}

export function sanitizeError(error: any): any {
  if (!error) return error;

  // Sanitization rules must only run in production environments
  if (getEnv().NODE_ENV !== "production") {
    return error;
  }

  // If error is a string
  if (typeof error === "string") {
    return sanitizeString(error);
  }

  const message = typeof error.message === "string" ? sanitizeString(error.message) : "";
  const name = typeof error.name === "string" ? error.name : "Error";

  // Create a new Error object so we do NOT modify the original error object (Requirement 1 & 4 constraint)
  const sanitized = new Error(message);
  sanitized.name = name;

  // Handle stack - deep stack traces removed
  if (typeof error.stack === "string") {
    const lines = error.stack.split("\n");
    // Keep only the first line (the error message header) and sanitize it
    sanitized.stack = sanitizeString(lines[0] || "");
  } else {
    sanitized.stack = undefined;
  }

  // Copy other safe non-trace properties of the error, but omit stack-trace/frame arrays or absolute paths
  for (const key of Object.keys(error)) {
    if (["message", "stack", "name", "cause"].includes(key)) {
      continue;
    }

    // Skip any stack trace arrays or Sentry/internal instrumentation fields
    if (
      key.toLowerCase().includes("trace") || 
      key.toLowerCase().includes("frame") || 
      key.toLowerCase().includes("sentry") ||
      Array.isArray(error[key])
    ) {
      continue;
    }

    const val = error[key];
    if (typeof val === "string") {
      (sanitized as any)[key] = sanitizeString(val);
    } else if (typeof val === "object" && val !== null) {
      try {
        (sanitized as any)[key] = JSON.parse(sanitizeString(JSON.stringify(val)));
      } catch {
        // Safe fallback: skip to avoid leaking raw info
      }
    } else {
      (sanitized as any)[key] = val;
    }
  }

  if (error.cause) {
    (sanitized as any).cause = sanitizeError(error.cause);
  }

  return sanitized;
}
