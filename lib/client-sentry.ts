/**
 * Utility for lazy Sentry loading and conditional initialization on client side.
 */

import { getEnv } from "./env";

export const isDummyOrMissingDsn = (dsn?: string): boolean => {
  if (!dsn || !dsn.trim()) return true;
  const lower = dsn.toLowerCase();
  return (
    lower.includes("dummy") ||
    lower.includes("example") ||
    lower.includes("0000") ||
    lower === "https://dummy@o0.ingest.sentry.io/0"
  );
};

let isInitialized = false;

export function resetSentryInitializationForTesting() {
  isInitialized = false;
}

/**
 * Dynamically initializes Sentry SDK if a valid DSN is provided.
 */
export async function initClientSentry(): Promise<boolean | null> {
  const dsn = getEnv().NEXT_PUBLIC_SENTRY_DSN;
  if (isDummyOrMissingDsn(dsn)) {
    return null;
  }

  if (isInitialized) {
    return true;
  }

  const Sentry = await import("@sentry/nextjs");
  const initFn = Sentry.init || (Sentry as unknown as { default: typeof Sentry }).default?.init;
  if (typeof initFn === "function") {
    initFn({
      dsn,
      tracesSampleRate: 1.0,
      debug: false,
      sendDefaultPii: false,
      beforeSend(event, hint) {
        const error = hint?.originalException;
        if (
          error &&
          ((error instanceof Error && error.name === "GameEngineException") ||
            (typeof error === "object" &&
              (("name" in error && error.name === "GameEngineException") ||
                error.constructor?.name === "GameEngineException")))
        ) {
          return null; // Discard simulated game engine exceptions globally
        }
        return event;
      },
    });
  }
  isInitialized = true;
  return true;
}

/**
 * Dynamically captures exceptions in client error boundaries without statically bundling Sentry SDK.
 */
export async function reportClientError(error: unknown): Promise<void> {
  const dsn = getEnv().NEXT_PUBLIC_SENTRY_DSN;
  if (isDummyOrMissingDsn(dsn)) {
    return;
  }

  try {
    const isReady = await initClientSentry();
    if (isReady) {
      const Sentry = await import("@sentry/nextjs");
      const captureFn =
        Sentry.captureException ||
        (Sentry as unknown as { default: typeof Sentry }).default?.captureException;
      if (typeof captureFn === "function") {
        captureFn(error);
      }
    }
  } catch (err) {
    console.warn("Failed to dynamically load error telemetry SDK:", err);
  }
}
