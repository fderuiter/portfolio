"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { Card, CardTitle } from "@/components/BentoGrid";
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

// Skeleton component matching exact layout bounds to eliminate layout shifts (CLS)
const SimulatorCardSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[520px] flex flex-col justify-between items-center py-8">
      <div className="w-full px-4">
        <div className="w-16 h-4 bg-zinc-900 border border-zinc-850 rounded-md mb-3 animate-pulse" />
        <div className="w-48 h-6 bg-zinc-900 border border-zinc-850 rounded-md mb-2.5 animate-pulse" />
        <div className="w-full h-12 bg-zinc-900/40 border border-zinc-900/60 rounded-xl mb-4 animate-pulse" />
      </div>
      <div className="w-64 h-64 rounded-full border-4 border-zinc-900 bg-zinc-950 flex items-center justify-center animate-pulse shadow-[inset_0_0_15px_rgba(0,0,0,0.95)]">
        <span className="text-[10px] font-mono text-zinc-400">Simulating...</span>
      </div>
      <div className="w-[260px] h-8 bg-zinc-900/40 border border-zinc-850 rounded-xl animate-pulse" />
    </div>
  );
};

// Lazy loaded simulator with ssr: false
const LazyGarminWatchSimulator = dynamic(
  () => import("@/components/GarminWatchSimulator").then((mod) => mod.GarminWatchSimulator),
  {
    ssr: false,
    loading: () => <SimulatorCardSkeleton />,
  }
);

interface SimulatorBentoCardProps {
  study: BaseCaseStudy & { height?: number };
  className?: string;
}

const SimulatorBentoCard: React.FC<SimulatorBentoCardProps> = ({ study, className }) => {
  return (
    <Card
      className={className}
      style={{
        height: study.height ? `${study.height}px` : "520px",
        transition: "height 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex flex-col h-full justify-between select-none">
        <div>
          {/* Card Top Pill & Header */}
          <div className="flex justify-between items-center mb-2.5">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold border border-cyan-500/20 bg-cyan-950/40 text-cyan-400 rounded-md">
              Simulation
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {study.slug.toUpperCase()}
            </span>
          </div>

          <CardTitle className="text-lg md:text-xl font-extrabold tracking-tight">
            {study.title}
          </CardTitle>

          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans mb-3">
            {study.editorial_content}
          </p>
        </div>

        {/* Watch Game Simulator with stable boundaries */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <LazyGarminWatchSimulator />
        </div>
      </div>
    </Card>
  );
};

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
                    {study.id === "simulator-card" ? (
                      <SimulatorBentoCard study={study} />
                    ) : (
                      <CaseStudyBentoCard 
                        study={study} 
                        preCalculatedHeight={study.height}
                        preCalculatedParagraphsLines={study.paragraphsLines}
                        preCalculatedParagraphsItems={study.paragraphsItems}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))
        ) : (
          /* SSR Safe Parallel Layout Fallback */
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {caseStudies.map((study) => (
              study.id === "simulator-card" ? (
                <SimulatorBentoCard key={study.id} study={study} />
              ) : (
                <CaseStudyBentoCard key={study.id} study={study} />
              )
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
