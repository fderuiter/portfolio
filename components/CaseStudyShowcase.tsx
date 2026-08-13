"use client";

import React, { useState, useMemo } from "react";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { BaseCaseStudy } from "@/types/domain";
import { hexToRgba } from "@/lib/utils";
import { GitHubStats } from "@/lib/github";
import { motion, AnimatePresence } from "framer-motion";
import { designManifest } from "@/lib/design-manifest";
import { useMasonryLayout } from "@/hooks/useMasonryLayout";
import { BentoLayoutProvider } from "@/components/providers/BentoLayoutContext";

interface HydratedCaseStudy extends BaseCaseStudy {
  githubStats: GitHubStats | null;
}

interface CaseStudyShowcaseProps {
  caseStudies: HydratedCaseStudy[];
}

const FILTER_TABS = ["All", "TypeScript", "Python", "Haskell"];

const CaseStudyShowcaseInner: React.FC<CaseStudyShowcaseProps> = ({ caseStudies }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Client-side interactive filter
  const filteredStudies = useMemo(() => {
    return selectedFilter === "All"
      ? caseStudies
      : caseStudies.filter((study) => study.primary_language === selectedFilter);
  }, [caseStudies, selectedFilter]);

  const { containerRef, layoutState } = useMasonryLayout(caseStudies, filteredStudies);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Premium Staggered Filtering Tabs */}
      <div className="flex gap-1.5 mb-12 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-900/60 backdrop-blur-md relative z-20">
        {FILTER_TABS.map((tab) => {
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`relative px-4 py-2 text-xs font-mono font-bold transition-colors duration-300 rounded-xl cursor-pointer select-none ${
                isActive ? "text-brand-cyan" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{ "--tab-glow": `0 0 15px ${hexToRgba(designManifest.colors["brand-cyan"], 0.12)}` } as React.CSSProperties}
                  className="absolute inset-0 bg-zinc-950 border border-zinc-800/80 rounded-xl -z-10 shadow-[var(--tab-glow)]"
                  transition={designManifest.motion.springs.snappy}
                />
              )}
              {tab === "All" ? "ALL PROJECTS" : tab.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Dynamic Masonry Bento Grid */}
      <div 
        ref={containerRef} 
        className="w-full flex gap-4 items-start relative z-10"
      >
        {layoutState.isReady ? (
          layoutState.columns.map((colCards, colIdx) => (
            <div 
              key={colIdx} 
              className="flex flex-col gap-4 flex-1"
              style={{ minWidth: 0 }}
            >
              <AnimatePresence mode="popLayout">
                {colCards.map((study) => (
                  <motion.div
                    key={study.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <CaseStudyBentoCard 
                      study={study} 
                      preCalculatedHeight={study.height}
                      preCalculatedLines={study.lines}
                      preCalculatedItems={study.items}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))
        ) : (
          /* SSR Safe Parallel Layout Fallback */
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {caseStudies.map((study) => (
              <CaseStudyBentoCard key={study.id} study={study} />
            ))}
          </div>
        )}
      </div>

      {/* Empty States fallback */}
      {filteredStudies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-6 bg-zinc-900/10 border border-zinc-900/40 border-dashed rounded-2xl w-full max-w-lg mt-4"
        >
          <p className="text-sm text-zinc-500 italic">
            No projects found matching language filter &quot;{selectedFilter}&quot;.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export const CaseStudyShowcase: React.FC<CaseStudyShowcaseProps> = (props) => {
  return (
    <BentoLayoutProvider>
      <CaseStudyShowcaseInner {...props} />
    </BentoLayoutProvider>
  );
};

