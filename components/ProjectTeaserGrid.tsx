"use client";

import React from "react";
import Link from "next/link";
import { BaseCaseStudy } from "@/types/domain";
import { IconChevronRight, IconArrowRight, IconLayersIntersect } from "@tabler/icons-react";
import { useTerminology } from "@/components/providers/TerminologyProvider";

interface ProjectTeaserGridProps {
  caseStudies: BaseCaseStudy[];
}

const LANGUAGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  TypeScript: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20" },
  JavaScript: { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/20" },
  Python: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  Haskell: { bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-500/20" },
  React: { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/20" },
};

const DEFAULT_STYLE = { bg: "bg-zinc-800/40", text: "text-zinc-300", border: "border-white/10" };

/**
 * Synchronously swaps compiled terminology tags for either simplified plain-text definitions
 * or original technical terms, then strips remaining raw HTML tags.
 */
export function resolveSnippetTerminology(html: string, simplified: boolean): string {
  if (!html) return "";

  const unescapeAttr = (str: string): string => {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  };

  const termTagRegex = /<(span|abbr)\b([^>]*)>([\s\S]*?)<\/\1>/gi;

  let resolved = html.replace(termTagRegex, (fullTag, _tagName, attrs, innerContent) => {
    const isTermTag =
      /data-term=/i.test(attrs) ||
      /data-definition=/i.test(attrs) ||
      /data-key=/i.test(attrs);

    if (!isTermTag) {
      return fullTag;
    }

    if (simplified) {
      const termMatch = /data-term=["']([^"']*)["']/i.exec(attrs);
      if (termMatch && termMatch[1]) {
        return unescapeAttr(termMatch[1]);
      }
    }

    return unescapeAttr(innerContent);
  });

  // Strip any remaining or unclosed HTML tags to prevent broken markup in card text
  resolved = resolved.replace(/<[^>]*>/g, "");

  return resolved;
}

// Clean inline text formatter that converts markdown bold/code markers without heavy parsing
function CleanMarkdownSnippet({ text }: { text: string }) {
  const { simplified } = useTerminology();
  const resolvedText = resolveSnippetTerminology(text, simplified);
  const trimmed = resolvedText.length > 220 ? `${resolvedText.slice(0, 217).trim()}...` : resolvedText;
  const parts = trimmed.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-zinc-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export const ProjectTeaserGrid: React.FC<ProjectTeaserGridProps> = ({ caseStudies }) => {
  const topProjects = caseStudies.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3-Column Systems Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full mb-8 sm:mb-10">
        {topProjects.map((study, idx) => {
          const style = LANGUAGE_STYLES[study.primary_language] || DEFAULT_STYLE;
          const sysId = `SYS-0${idx + 1}`;

          return (
            <article
              key={study.id}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#13151a]/80 border border-white/10 hover:border-amber-500/40 hover:bg-[#181b22] transition-colors transition-shadow duration-300 backdrop-blur-md overflow-hidden shadow-xl"
            >
              <div className="relative z-10 flex flex-col h-full">
                {/* Header: System Number, Language Badge & Slug */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded">
                      {sysId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-mono font-bold border rounded-md ${style.bg} ${style.text} ${style.border}`}
                    >
                      {study.primary_language}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[120px]">
                    {study.slug}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug mb-3 group-hover:text-amber-300 transition-colors">
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="focus-visible:outline-none focus-visible:underline"
                  >
                    {study.title}
                  </Link>
                </h3>

                {/* Lightweight Description */}
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans flex-1 mb-5 line-clamp-4">
                  <CleanMarkdownSnippet text={study.editorial_content} />
                </p>

                {/* Card Footer Link */}
                <div className="pt-3 border-t border-white/10 mt-auto flex items-center justify-between">
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="inline-flex items-center min-h-[44px] text-xs font-mono font-bold text-amber-400 hover:text-amber-200 transition-colors duration-200"
                    aria-label={`Read case study for ${study.title}`}
                  >
                    <span>Read Case Study</span>
                    <IconChevronRight className="ml-1 w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>

                  <span className="text-[10px] font-mono text-zinc-600 uppercase">INSPECT // DOSSIER</span>
                </div>
              </div>

              {/* Subtle ambient hover highlight */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            </article>
          );
        })}
      </div>

      {/* Primary CTA leading to full /case-studies showcase */}
      <div className="w-full flex justify-center">
        <Link
          href="/case-studies"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#14161d] hover:bg-amber-400 border border-white/10 hover:border-amber-400 text-zinc-200 hover:text-black font-mono text-xs font-bold rounded-xl transition-colors transition-transform duration-200 shadow-md active:scale-[0.98] group"
        >
          <IconLayersIntersect className="w-4 h-4 text-amber-400 group-hover:text-black transition-colors" />
          <span>View All Architectural Case Studies ({caseStudies.length})</span>
          <IconArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
};
