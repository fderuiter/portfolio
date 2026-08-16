import React from "react";
import Link from "next/link";
import { BaseCaseStudy } from "@/types/domain";
import { IconChevronRight, IconArrowRight, IconLayersIntersect } from "@tabler/icons-react";

interface ProjectTeaserGridProps {
  caseStudies: BaseCaseStudy[];
}

const LANGUAGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  TypeScript: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  JavaScript: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  Python: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  Haskell: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  React: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
};

const DEFAULT_STYLE = { bg: "bg-zinc-800/40", text: "text-zinc-400", border: "border-zinc-700/40" };

// Clean inline text formatter that converts markdown bold/code markers without heavy parsing
function CleanMarkdownSnippet({ text }: { text: string }) {
  // Grab the first 1-2 sentences or max 160 characters
  const trimmed = text.length > 220 ? `${text.slice(0, 217).trim()}...` : text;
  const parts = trimmed.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-zinc-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded"
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
      {/* 3-Column Minimal Teaser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full mb-8 sm:mb-10">
        {topProjects.map((study) => {
          const style = LANGUAGE_STYLES[study.primary_language] || DEFAULT_STYLE;

          return (
            <article
              key={study.id}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 hover:border-brand-cyan/40 hover:bg-zinc-900/50 transition-all duration-300 backdrop-blur-sm overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full">
                {/* Header: Language Badge & Slug */}
                <div className="flex items-center justify-between mb-3.5">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold border rounded-md ${style.bg} ${style.text} ${style.border}`}
                  >
                    {study.primary_language}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[140px]">
                    {study.slug}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug mb-3 group-hover:text-brand-cyan transition-colors">
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
                <div className="pt-3 border-t border-zinc-800/60 mt-auto">
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="inline-flex items-center min-h-[44px] text-xs font-mono font-bold text-brand-cyan hover:text-white transition-colors duration-200"
                    aria-label={`Read case study for ${study.title}`}
                  >
                    <span>Read Case Study</span>
                    <IconChevronRight className="ml-1 w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>

              {/* Subtle ambient hover highlight */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-brand-cyan/10 transition-colors" />
            </article>
          );
        })}
      </div>

      {/* Primary CTA leading to full /case-studies showcase */}
      <div className="w-full flex justify-center">
        <Link
          href="/case-studies"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-zinc-900/80 hover:bg-brand-cyan border border-zinc-800 hover:border-brand-cyan text-zinc-200 hover:text-black font-mono text-xs font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-[0.98] group"
        >
          <IconLayersIntersect className="w-4 h-4 text-brand-cyan group-hover:text-black transition-colors" />
          <span>View All Architectural Case Studies ({caseStudies.length})</span>
          <IconArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
};
