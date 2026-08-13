"use client";

import React, { useState, useMemo } from "react";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { SetbackBentoCard } from "@/components/ui/SetbackBentoCard";
import { BaseCaseStudy, BaseSetback } from "@/types/domain";
import { hexToRgba } from "@/lib/utils";
import { GitHubStats } from "@/lib/github";
import { motion, AnimatePresence } from "framer-motion";
import { designManifest } from "@/lib/design-manifest";
import { useMasonryLayout } from "@/hooks/useMasonryLayout";
import { BentoLayoutProvider } from "@/components/providers/BentoLayoutContext";

interface HydratedCaseStudy extends BaseCaseStudy {
  githubStats: GitHubStats | null;
  setbacks?: BaseSetback[];
}

interface CaseStudyShowcaseProps {
  caseStudies: HydratedCaseStudy[];
}

type GridItem =
  | (HydratedCaseStudy & { gridType: "project" })
  | {
      gridType: "setback";
      id: string;
      title: string;
      editorial_content: string;
      created_at: Date;
      updated_at: Date;
      caseStudyId: string;
      parentSlug: string;
      parentTitle: string;
      primary_language: string;
    };

const LANGUAGE_TABS = ["All", "TypeScript", "Python", "Haskell"];

const TYPE_OPTIONS = [
  { value: "all" as const, label: "All Items" },
  { value: "project" as const, label: "Projects Only" },
  { value: "setback" as const, label: "Setbacks Only" },
];

const CaseStudyShowcaseInner: React.FC<CaseStudyShowcaseProps> = ({ caseStudies }) => {
  const [selectedType, setSelectedType] = useState<"all" | "project" | "setback" >("all");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Construct unified list of grid items including both case studies and setbacks
  const allGridItems = useMemo(() => {
    const items: GridItem[] = [];
    
    caseStudies.forEach((study) => {
      // 1. Add the case study itself
      items.push({
        ...study,
        gridType: "project",
      });
      
      // 2. Add any associated setbacks
      if (study.setbacks) {
        study.setbacks.forEach((sb) => {
          items.push({
            gridType: "setback",
            id: sb.id,
            title: sb.title,
            editorial_content: sb.editorial_content,
            created_at: sb.created_at,
            updated_at: sb.updated_at,
            caseStudyId: sb.caseStudyId,
            parentSlug: study.slug,
            parentTitle: study.title,
            primary_language: study.primary_language,
          });
        });
      }
    });

    // Chronological sorting (newest first)
    return items.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }, [caseStudies]);

  // Client-side filtering of unified grid items
  const filteredItems = useMemo(() => {
    return allGridItems.filter((item) => {
      // Filter by content type
      if (selectedType !== "all" && item.gridType !== selectedType) {
        return false;
      }
      // Filter by programming language
      if (selectedLanguage !== "All" && item.primary_language !== selectedLanguage) {
        return false;
      }
      return true;
    });
  }, [allGridItems, selectedType, selectedLanguage]);

  // Feed polymorphic GridItem lists into the layout hook
  const { containerRef, layoutState } = useMasonryLayout(allGridItems, filteredItems);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Interactive Controls Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12 relative z-20">
        
        {/* Grid Content Type Selector */}
        <div className="flex gap-1.5 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-900/60 backdrop-blur-md">
          {TYPE_OPTIONS.map((opt) => {
            const isActive = selectedType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`relative px-4 py-2 text-xs font-mono font-bold transition-colors duration-300 rounded-xl cursor-pointer select-none ${
                  isActive ? "text-brand-cyan" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTypeTab"
                    style={{ "--tab-glow": `0 0 15px ${hexToRgba(designManifest.colors["brand-cyan"], 0.12)}` } as React.CSSProperties}
                    className="absolute inset-0 bg-zinc-950 border border-zinc-800/80 rounded-xl -z-10 shadow-[var(--tab-glow)]"
                    transition={designManifest.motion.springs.snappy}
                  />
                )}
                {opt.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Programming Language Selector */}
        <div className="flex gap-1.5 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-900/60 backdrop-blur-md">
          {LANGUAGE_TABS.map((tab) => {
            const isActive = selectedLanguage === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedLanguage(tab)}
                className={`relative px-4 py-2 text-xs font-mono font-bold transition-colors duration-300 rounded-xl cursor-pointer select-none ${
                  isActive ? "text-brand-cyan" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLangTab"
                    style={{ "--tab-glow": `0 0 15px ${hexToRgba(designManifest.colors["brand-cyan"], 0.12)}` } as React.CSSProperties}
                    className="absolute inset-0 bg-zinc-950 border border-zinc-800/80 rounded-xl -z-10 shadow-[var(--tab-glow)]"
                    transition={designManifest.motion.springs.snappy}
                  />
                )}
                {tab === "All" ? "ALL LANGUAGES" : tab.toUpperCase()}
              </button>
            );
          })}
        </div>
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
                {colCards.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="w-full"
                  >
                    {item.gridType === "project" ? (
                      <CaseStudyBentoCard 
                        study={item} 
                        preCalculatedHeight={item.height}
                        preCalculatedLines={item.lines}
                        preCalculatedItems={item.items}
                      />
                    ) : (
                      <SetbackBentoCard
                        setback={item}
                        preCalculatedHeight={item.height}
                        preCalculatedLines={item.lines}
                        preCalculatedItems={item.items}
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
            {allGridItems.map((item) => (
              item.gridType === "project" ? (
                <CaseStudyBentoCard key={item.id} study={item} />
              ) : (
                <SetbackBentoCard key={item.id} setback={item} />
              )
            ))}
          </div>
        )}
      </div>

      {/* Empty States fallback */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 px-6 bg-zinc-900/10 border border-zinc-900/40 border-dashed rounded-2xl w-full max-w-lg mt-4"
        >
          <p className="text-sm text-zinc-500 italic">
            No items found matching the selected type and language filters.
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
