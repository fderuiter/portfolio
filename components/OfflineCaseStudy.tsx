"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TracingBeam } from "@/components/ui/TracingBeam";
import { RichNarrative } from "@/components/RichNarrative";
import { SandboxTerminal } from "@/components/SandboxTerminal";
import { IconTerminal, IconWifiOff } from "@tabler/icons-react";

interface CaseStudy {
  slug: string;
  title: string;
  primary_language: string;
  editorial_content: string;
  architectural_narrative: string;
  tags: string;
  id: string;
  github_url: string | null;
}

export function OfflineCaseStudy({ slug }: { slug: string }) {
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [source, setSource] = useState<"cache" | "manifest" | "none">("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOfflineData() {
      // 1. Check local storage cache
      try {
        const cacheKey = "offline_narrative_cache";
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cache = JSON.parse(cached);
          if (cache[slug]) {
            setStudy(cache[slug]);
            setSource("cache");
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to read from offline cache:", err);
      }

      // 2. Fall back to bundled manifest
      try {
        const res = await fetch("/narrative-manifest.json");
        if (res.ok) {
          const manifest = await res.json();
          const found = manifest.find((item: CaseStudy) => item.slug === slug);
          if (found) {
            // Provide a simplified version indicator if needed
            setStudy(found);
            setSource("manifest");
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch narrative manifest:", err);
      }

      setLoading(false);
    }

    fetchOfflineData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-zinc-950 text-foreground">
        <div className="w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-zinc-950 text-foreground text-center">
        <IconWifiOff className="w-12 h-12 text-zinc-600 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-100 mb-2">Content Unavailable</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          The server is currently unreachable and this case study has not been cached locally.
        </p>
        <Link
          href="/"
          className="px-6 py-3 text-sm font-bold bg-neutral-900 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  const tagsList = study.tags ? study.tags.split(",").map((t: string) => t.trim()) : [];

  return (
    <main className="min-h-screen py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-foreground flex flex-col items-center relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        <TracingBeam>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-mono font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors inline-flex items-center gap-2 cursor-pointer group"
            >
              <svg
                className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Core Feed
            </Link>

            {/* Resilience Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/30 border border-amber-900/50 text-amber-500 text-xs font-mono font-medium">
              <IconWifiOff className="w-3.5 h-3.5" />
              Degraded Mode: Served from {source === "cache" ? "local cache" : "offline manifest"}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-100 mb-4 leading-tight">
            {study.title}
          </h1>

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-zinc-900 pb-8">
            <span className="px-3 py-1 text-xs font-mono font-bold bg-brand-cyan/5 border border-brand-cyan/20 text-brand-cyan rounded-md">
              {study.primary_language}
            </span>
            <span className="text-xs font-mono text-muted">
              Node ID: {study.id}
            </span>
          </div>

          {/* Long-form Article Narrative */}
          <article className="prose prose-invert max-w-none text-neutral-300 leading-relaxed space-y-8">
            {/* Editorial Content Highlight block */}
            <div className="text-lg text-muted-strong font-medium border-l-2 border-brand-cyan/60 pl-6 py-2 italic bg-zinc-900/10 rounded-r-xl">
              {study.editorial_content}
            </div>

            {/* Tags list row */}
            <div className="flex flex-wrap gap-2 pt-4">
              {tagsList.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs font-mono font-medium bg-zinc-900/60 border border-zinc-800/80 text-muted-strong rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Interactive Sandbox Terminal Shell (Issue #42) */}
            {slug === "imednet-python-sdk" && (
              <div className="mt-12 border-t border-zinc-900/50 pt-10">
                <h2 className="text-xl font-bold font-sans text-neutral-100 mb-3 flex items-center gap-2">
                  <IconTerminal className="w-5 h-5 text-brand-cyan" />
                  Interactive CLI Developer Sandbox (Offline)
                </h2>
                <p className="text-xs font-mono text-zinc-500 mb-6 leading-relaxed">
                  Test clinical trial EDC operations and view structured telemetry outputs directly inside the browser. Use the interactive badges or type &apos;help&apos; inside the prompt. Note: Some live features may be degraded.
                </p>
                <SandboxTerminal />
              </div>
            )}

            {/* Technical Deep Dive Narrative */}
            <RichNarrative
              html={study.architectural_narrative}
              className="mt-12 space-y-6 text-sm md:text-base leading-relaxed text-muted-strong border-t border-zinc-900/50 pt-10"
            />
          </article>
        </TracingBeam>
      </div>
    </main>
  );
}
