import React from "react";
import { BaseCaseStudy } from "@/types/domain";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CaseStudyCardProps {
  study: BaseCaseStudy;
  className?: string;
}

export const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ study, className }) => {
  // Split tags by comma for individual rendering
  const tagsList = study.tags ? study.tags.split(",").map(t => t.trim()) : [];

  return (
    <div
      className={cn(
        "group relative p-6 bg-neutral-950/40 border border-neutral-900 rounded-2xl overflow-hidden hover:border-brand-cyan/60 transition-all duration-300 backdrop-blur-md",
        className
      )}
    >
      {/* Dynamic Brand Gradient Hover Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Header Grid */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-extrabold text-neutral-100 group-hover:text-brand-cyan transition-colors duration-300">
          {study.title}
        </h3>
        <span className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-blue rounded-md">
          {study.primary_language}
        </span>
      </div>

      {/* Editorial Content Summary */}
      <p className="text-sm text-neutral-400 leading-relaxed mb-6 group-hover:text-neutral-300 transition-colors duration-300">
        {study.editorial_content}
      </p>

      {/* Tags Array */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tagsList.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 text-[11px] font-mono font-medium bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom Footer Actions */}
      <Link
        href={`/case-studies/${study.slug}`}
        className="inline-flex items-center text-xs font-bold text-brand-cyan/80 group-hover:text-brand-cyan transition-colors duration-300 cursor-pointer relative z-10"
      >
        <span>Analyze Architecture</span>
        <svg
          className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
};
