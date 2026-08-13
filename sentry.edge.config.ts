import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
  debug: false,
  sendDefaultPii: false,
  beforeSend(event, hint) {
    const error = hint?.originalException;
    if (error && (
      (error instanceof Error && error.name === "GameEngineException") ||
      (typeof error === "object" && (
        ("name" in error && error.name === "GameEngineException") || 
        error.constructor?.name === "GameEngineException"
      ))
    )) {
      return null; // Discard simulated game engine exceptions globally
    }
    return event;
  },
});

