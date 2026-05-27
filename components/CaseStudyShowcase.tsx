"use client";

import React, { useState } from "react";
import { BentoGrid } from "@/components/BentoGrid";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats } from "@/lib/github";
import { motion, AnimatePresence } from "framer-motion";

interface HydratedCaseStudy extends BaseCaseStudy {
  githubStats: GitHubStats | null;
}

interface CaseStudyShowcaseProps {
  caseStudies: HydratedCaseStudy[];
}

const FILTER_TABS = ["All", "TypeScript", "Python"];

export const CaseStudyShowcase: React.FC<CaseStudyShowcaseProps> = ({ caseStudies }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Client-side interactive filter
  const filteredStudies = selectedFilter === "All"
    ? caseStudies
    : caseStudies.filter((study) => study.primary_language === selectedFilter);

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
                  className="absolute inset-0 bg-zinc-950 border border-zinc-800/80 rounded-xl -z-10 shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {tab === "All" ? "ALL PROJECTS" : tab.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Dynamic Masonry Bento Grid */}
      <BentoGrid className="w-full relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredStudies.map((study) => (
            <motion.div
              key={study.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full"
            >
              <CaseStudyBentoCard study={study} />
            </motion.div>
          ))}
        </AnimatePresence>
      </BentoGrid>

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
