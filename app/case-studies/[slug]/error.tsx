"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function CaseStudyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Case study route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground">
      <div className="relative z-10 w-full max-w-md p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl">
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-red-950/20 border border-red-900/40 text-red-400 rounded-md mb-6">
          CASE_LOAD_FAIL
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mb-4">
          Query Transaction Failed
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
          The server failed to parse the case study records from the Neon database stream due to an active runtime exception. The details have been reported to our automated observability system.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
          >
            Retry Fetch
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-transparent border border-neutral-900 hover:border-neutral-800 text-neutral-400 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            Back to Core
          </Link>
        </div>
      </div>
    </main>
  );
}
