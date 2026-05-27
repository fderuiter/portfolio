"use client";

import React from "react";
import { Card, CardTitle } from "@/components/BentoGrid";
import { PretextRichText, usePretextRichLayout, type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats } from "@/lib/github";
import { IconStar, IconGitFork, IconAlertCircle, IconTerminal, IconChevronRight } from "@tabler/icons-react";
import { type RichInlineLine } from "@chenglou/pretext/rich-inline";
import Link from "next/link";

interface CaseStudyBentoCardProps {
  study: BaseCaseStudy & { githubStats: GitHubStats | null };
  className?: string;
  preCalculatedHeight?: number;
  preCalculatedLines?: RichInlineLine[];
  preCalculatedItems?: ExtendedRichInlineItem[];
}

// Map common languages to premium styling colors
const LANGUAGE_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  TypeScript: { bg: "bg-blue-500/10", text: "text-blue-400", hex: "#3178c6" },
  JavaScript: { bg: "bg-yellow-500/10", text: "text-yellow-400", hex: "#f1e05a" },
  Python: { bg: "bg-emerald-500/10", text: "text-emerald-400", hex: "#3572a5" },
  CSS: { bg: "bg-purple-500/10", text: "text-purple-400", hex: "#563d7c" },
  HTML: { bg: "bg-orange-500/10", text: "text-orange-400", hex: "#e34c26" },
};

const DEFAULT_COLOR = { bg: "bg-zinc-500/10", text: "text-zinc-400", hex: "#8b949e" };

export const CaseStudyBentoCard: React.FC<CaseStudyBentoCardProps> = ({ 
  study, 
  className,
  preCalculatedHeight,
  preCalculatedLines,
  preCalculatedItems,
}) => {
  const { githubStats } = study;
  const tagsList = study.tags ? study.tags.split(",").map((t) => t.trim()) : [];
  const langColor = LANGUAGE_COLORS[study.primary_language] || DEFAULT_COLOR;

  const hasPrecalculated = preCalculatedHeight !== undefined && preCalculatedLines !== undefined && preCalculatedItems !== undefined;

  // We always execute the hook to follow dynamic hooks rules, but ignore if precalculated is provided
  const internalLayout = usePretextRichLayout({
    text: study.editorial_content,
    fontSize: 13,
    lineHeight: 18,
    fontFamilyVariable: "--font-inter",
  });

  const finalHeight = hasPrecalculated ? preCalculatedHeight : (internalLayout.isReady ? internalLayout.height + (githubStats ? 390 : 170) : undefined);
  const finalLines = hasPrecalculated ? preCalculatedLines : internalLayout.lines;
  const finalItems = hasPrecalculated ? preCalculatedItems : internalLayout.items;
  const isLayoutReady = hasPrecalculated ? true : internalLayout.isReady;

  return (
    <Card
      className={className}
      style={{
        height: finalHeight ? `${finalHeight}px` : "auto",
        transition: "height 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Card Top Pill & Header */}
          <div className="flex justify-between items-center mb-3">
            <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold border border-current/10 rounded-md ${langColor.bg} ${langColor.text}`}>
              {study.primary_language}
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {study.slug.toUpperCase()}
            </span>
          </div>

          <CardTitle className="text-lg md:text-xl font-extrabold tracking-tight">
            {study.title}
          </CardTitle>

          {/* Description Block using Pretext Rich Text */}
          <div ref={hasPrecalculated ? undefined : internalLayout.ref} className="mb-4">
            <PretextRichText
              lines={finalLines}
              items={finalItems}
              lineHeight={18}
              isReady={isLayoutReady}
              fallbackText={study.editorial_content}
              className="text-zinc-400 text-sm leading-relaxed font-sans"
            />
          </div>

          {/* Dynamic GitHub Statistics Hydration */}
          {githubStats && (
            <div className="space-y-4 mb-5 border-t border-zinc-900/60 pt-4">
              {/* Badges Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-2 flex flex-col items-center">
                  <IconStar className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-zinc-100 font-bold">{githubStats.stars.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-500">STARS</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-2 flex flex-col items-center">
                  <IconGitFork className="w-4 h-4 text-blue-500 mb-1" />
                  <span className="text-zinc-100 font-bold">{githubStats.forks.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-500">FORKS</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-2 flex flex-col items-center">
                  <IconAlertCircle className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-zinc-100 font-bold">{githubStats.openIssues.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-500">ISSUES</span>
                </div>
              </div>

              {/* Language Percentage Bar */}
              {githubStats.languages.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>LANGUAGE STACK</span>
                    <span className="text-zinc-400">
                      {githubStats.languages[0]?.name} {githubStats.languages[0]?.percentage}%
                    </span>
                  </div>
                  {/* Aggregated distribution bar */}
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                    {githubStats.languages.map((lang, idx) => {
                      const color = LANGUAGE_COLORS[lang.name] || DEFAULT_COLOR;
                      return (
                        <div
                          key={idx}
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: color.hex,
                          }}
                          className="h-full transition-all"
                          title={`${lang.name}: ${lang.percentage}%`}
                        />
                      );
                    })}
                  </div>
                  {/* Legend list */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-mono text-zinc-500">
                    {githubStats.languages.slice(0, 3).map((lang, idx) => {
                      const color = LANGUAGE_COLORS[lang.name] || DEFAULT_COLOR;
                      return (
                        <span key={idx} className="flex items-center">
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: color.hex }}
                          />
                          {lang.name} ({lang.percentage}%)
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monospace terminal logs commits feed */}
              <div className="bg-black/60 border border-zinc-900/60 rounded-xl p-3 font-mono text-[10px] leading-tight space-y-1 h-[130px] flex flex-col justify-start overflow-hidden">
                <div className="flex items-center text-zinc-500 border-b border-zinc-900/60 pb-1.5 mb-1.5">
                  <IconTerminal className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                  <span>git log --oneline -n 5</span>
                </div>
                <div className="flex-1 flex flex-col justify-start space-y-1 overflow-y-auto scrollbar-none text-zinc-400">
                  {githubStats.recentCommits.length > 0 ? (
                    githubStats.recentCommits.map((c, i) => (
                      <div key={i} className="truncate flex items-start gap-1">
                        <span className="text-brand-cyan select-none">{c.sha}</span>
                        <span className="text-zinc-500 select-none">|</span>
                        <span className="text-zinc-300 truncate" title={c.message}>{c.message}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-600 italic">No recent commits located.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tags list (only when no stats are rendered to save visual space, or inline) */}
          {!githubStats && (
            <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
              {tagsList.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono bg-zinc-900/60 border border-zinc-800 text-zinc-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer analyze link */}
        <div className="flex justify-between items-center border-t border-zinc-900/40 pt-3 mt-4">
          <Link
            href={`/case-studies/${study.slug}`}
            className="inline-flex items-center text-xs font-bold text-brand-cyan/80 hover:text-brand-cyan transition-colors duration-300 cursor-pointer relative z-10"
          >
            <span>Analyze Architecture</span>
            <IconChevronRight className="ml-1 w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <div className="text-[9px] font-mono text-zinc-600">
            {!isLayoutReady ? "MEASURING..." : `H: ${finalHeight}px`}
          </div>
        </div>
      </div>
    </Card>
  );
};
