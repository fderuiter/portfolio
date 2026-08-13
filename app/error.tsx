"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { sanitizeError } from "@/lib/error-sanitization";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture the error in external observability system
    Sentry.captureException(error);
    console.error("Layout compile error:", sanitizeError(error));
  }, [error]);

  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground">
      <div className="relative z-10 w-full max-w-md p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl">
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-red-950/20 border border-red-900/40 text-red-400 rounded-md mb-6">
          RUNTIME_ERROR
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mb-4">
          Pipeline Stalled
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
          A runtime exception has interrupted the rendering pipeline. The details have been reported to the automated observability system.
        </p>

        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
        >
          Re-evaluate Pipeline
        </button>
      </div>
    </main>
  );
}
