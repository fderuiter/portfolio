import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  tracesSampleRate: 0.1, // Reduced sample rate for production performance hardening
  debug: false,
  sendDefaultPii: false,
  // Ensure Sentry doesn't bloat the bundle with unnecessary features if possible
  integrations: [],
});
