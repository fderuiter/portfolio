"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getClosestMatches, type CaseStudyItem } from "@/lib/search-utils";
import { useSearch } from "@/components/providers/SearchProvider";

export default function CaseStudyNotFound() {
  const { recordEvent } = useTelemetry();
  const { openSearch } = useSearch();
  const hasTracked = useRef(false);
  const [invalidPath, setInvalidPath] = useState<string>("");
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Capture the path and track telemetry safely on-mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      setTimeout(() => {
        setInvalidPath(currentPath);
      }, 0);

      if (!hasTracked.current) {
        hasTracked.current = true;
        recordEvent(currentPath, "route_error").catch((err) => {
          console.error("Failed to record case-study route error telemetry:", err);
        });
      }
    }
  }, [recordEvent]);

  // Fetch the active case studies client-side from /api/case-studies
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const res = await fetch("/api/case-studies");
        if (res.ok) {
          const data = await res.json();
          setCaseStudies(data);
        }
      } catch (err) {
        console.error("Failed to fetch case studies for recovery suggestions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, []);

  // Compute up to three closest matching case studies
  const matches = useMemo(() => {
    return getClosestMatches(invalidPath, caseStudies);
  }, [invalidPath, caseStudies]);

  const handleSuggestionClick = (slug: string) => {
    recordEvent(slug, "project_click").catch((err) => {
      console.error("Failed to record telemetry suggestion click:", err);
    });
  };

  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground">
      {/* Background Blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl">
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-cyan rounded-md mb-6">
          CASE_NOT_FOUND
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mb-4">
          Case Study Unresolved
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
          The requested clinical case study narrative does not exist or has not been published to the active database partition.
        </p>

        {/* Display Attempted Invalid URL Path */}
        {invalidPath && (
          <div className="mb-6 p-4 bg-neutral-950/80 border border-neutral-900/60 rounded-2xl text-left">
            <span className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Attempted System Path
            </span>
            <div className="font-mono text-xs text-brand-cyan/90 break-all select-all font-semibold">
              {invalidPath}
            </div>
          </div>
        )}

        {/* Closest Matching Case Study Suggestions */}
        {loading ? (
          <div className="mb-6 p-4 bg-neutral-950/40 border border-neutral-900/40 rounded-2xl flex items-center justify-center">
            <span className="animate-pulse text-xs font-mono text-neutral-500">
              Querying active partitions...
            </span>
          </div>
        ) : matches.length > 0 ? (
          <div className="mb-6 text-left">
            <span className="block text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3">
              Dynamic Recovery Routes
            </span>
            <div className="space-y-3">
              {matches.map((study) => {
                const tagsList = typeof study.tags === "string"
                  ? study.tags.split(",").map((t: string) => t.trim())
                  : Array.isArray(study.tags)
                    ? study.tags
                    : [];

                return (
                  <Link
                    key={study.id}
                    href={`/case-studies/${study.slug}`}
                    onClick={() => handleSuggestionClick(study.slug)}
                    className="group block p-4 bg-neutral-950/60 hover:bg-neutral-900/60 border border-neutral-900 hover:border-brand-cyan/40 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="text-sm font-bold text-neutral-200 group-hover:text-brand-cyan transition-colors duration-250">
                        {study.title}
                      </h4>
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-blue rounded">
                        {study.primary_language}
                      </span>
                    </div>
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {tagsList.slice(0, 3).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[9px] font-mono bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={openSearch}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
          >
            Search Site
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold bg-transparent border border-neutral-900 hover:border-neutral-800 text-neutral-400 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            Return to Core Feed
          </Link>
        </div>
      </div>
    </main>
  );
}
