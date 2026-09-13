import { initClientSentry } from "@/lib/client-sentry";

export { initClientSentry };

export const clientSentryPromise =
  typeof window !== "undefined"
    ? initClientSentry().catch((err) => {
        console.warn("Failed to initialize client Sentry:", err);
      })
    : Promise.resolve(null);

export async function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse"
) {
  try {
    const isReady = await initClientSentry();
    if (!isReady) return;

    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRouterTransitionStart(url, navigationType);
  } catch (err) {
    console.warn("Failed to capture Sentry router transition:", err);
  }
}
