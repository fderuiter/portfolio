import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

if (isProd) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
    tracesSampleRate: 1.0,
    debug: false,
    sendDefaultPii: false,
  });
}
