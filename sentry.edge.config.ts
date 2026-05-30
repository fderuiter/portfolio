import * as Sentry from "@sentry/nextjs";
import { env } from "./env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
  debug: false,
  sendDefaultPii: false,
});
