import { initClientSentry } from "@/lib/client-sentry";

export { initClientSentry };

export const clientSentryPromise =
  typeof window !== "undefined"
    ? initClientSentry().catch((err) => {
        console.warn("Failed to initialize client Sentry:", err);
      })
    : Promise.resolve(null);
