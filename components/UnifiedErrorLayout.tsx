"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useSearch } from "@/components/providers/SearchProvider";

interface UnifiedErrorLayoutProps {
  badge: string;
  title: string;
  description: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  fallbackPath?: string;
}

export function UnifiedErrorLayout({
  badge,
  title,
  description,
  secondaryActionText = "Return to Core",
  secondaryActionHref = "/",
  fallbackPath = "/not-found",
}: UnifiedErrorLayoutProps) {
  const { recordEvent } = useTelemetry();
  const hasTracked = useRef(false);
  const { openSearch } = useSearch();

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const path = typeof window !== "undefined" ? window.location.pathname : fallbackPath;
    recordEvent(path, "route_error").catch((err) => {
      console.error(`Failed to record route error telemetry for ${badge}:`, err);
    });
  }, [recordEvent, badge, fallbackPath]);

  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground">
      {/* Background Blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl">
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-cyan rounded-md mb-6">
          {badge}
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
          {title}
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={openSearch}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
          >
            Search Site
          </button>

          <Link
            href={secondaryActionHref}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold bg-transparent border border-neutral-900 hover:border-neutral-800 text-neutral-400 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            {secondaryActionText}
          </Link>
        </div>
      </div>
    </main>
  );
}
