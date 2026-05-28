"use client";

import React, { useState, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { BaseCaseStudy } from "@/types/domain";
import { hexToRgba } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { designManifest } from "@/lib/design-manifest";
import { 
  parseMarkdownToRichItems, 
  type ExtendedRichInlineItem 
} from "@/hooks/usePretextLayout";
import { 
  prepareRichInline, 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineLine,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";

interface LayoutStudy extends BaseCaseStudy {
  height: number;
  lines: RichInlineLine[];
  items: ExtendedRichInlineItem[];
}

interface CaseStudyShowcaseProps {
  caseStudies: BaseCaseStudy[];
}

const FILTER_TABS = ["All", "TypeScript", "Python"];

export const CaseStudyShowcase: React.FC<CaseStudyShowcaseProps> = ({ caseStudies }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Client-side interactive filter
  const filteredStudies = useMemo(() => {
    return selectedFilter === "All"
      ? caseStudies
      : caseStudies.filter((study) => study.primary_language === selectedFilter);
  }, [caseStudies, selectedFilter]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidthRef = useRef<number>(0);
  const preparedDataRef = useRef<Record<string, {
    prepared: PreparedRichInline;
    items: ExtendedRichInlineItem[];
    paddingHeight: number;
  }>>({});

  const [layoutState, setLayoutState] = useState<{
    colCount: number;
    columns: LayoutStudy[][];
    isReady: boolean;
  }>({
    colCount: 1,
    columns: [
      caseStudies.map((s) => ({
        ...s,
        height: 250,
        lines: [],
        items: [],
      })),
    ],
    isReady: false,
  });

  // Pre-prepare all case studies on mount to build the text measurement cache
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const rootStyle = window.getComputedStyle(document.documentElement);
    const rawFontFamily = rootStyle.getPropertyValue("--font-inter").trim();
    const resolvedFontFamily = rawFontFamily || designManifest.typography.fonts.sans;

    const fontSize = designManifest.typography.sizes.sm.fontSize;
    const baseFont = `400 ${fontSize}px ${resolvedFontFamily}`;
    const boldFont = `700 ${fontSize}px ${resolvedFontFamily}`;
    const italicFont = `italic 400 ${fontSize}px ${resolvedFontFamily}`;
    const codeFont = `500 ${fontSize - 1}px monospace`;

    const data: Record<string, {
      prepared: PreparedRichInline;
      items: ExtendedRichInlineItem[];
      paddingHeight: number;
    }> = {};
    for (const study of caseStudies) {
      const parsedItems = parseMarkdownToRichItems(study.editorial_content, baseFont, boldFont, italicFont, codeFont);
      const prepared = prepareRichInline(parsedItems);
      const paddingHeight = study.githubStats ? designManifest.masonry.paddingWithStats : designManifest.masonry.paddingWithoutStats;
      
      data[study.id] = {
        prepared,
        items: parsedItems,
        paddingHeight,
      };
    }
    
    preparedDataRef.current = data;
  }, [caseStudies]);

  const recalculateLayout = useCallback((containerWidth: number) => {
    if (Object.keys(preparedDataRef.current).length === 0) return;

    let colCount = 1;
    if (containerWidth >= designManifest.breakpoints.lg) {
      colCount = 3;
    } else if (containerWidth >= designManifest.breakpoints.md) {
      colCount = 2;
    }

    const gap = designManifest.layout.gap; // using generated gap token
    const columnWidth = (containerWidth - (gap * (colCount - 1))) / colCount;

    // 1. Calculate heights of each study
    const studiesWithHeight = filteredStudies.map((study) => {
      const cached = preparedDataRef.current[study.id];
      if (!cached) {
        return { ...study, height: 250, lines: [], items: [] };
      }

      const linesRanges: RichInlineLineRange[] = [];
      walkRichInlineLineRanges(cached.prepared, columnWidth - (designManifest.layout.cardPadding * 2), (range) => {
        linesRanges.push(range);
      });

      const materializedLines = linesRanges.map((range) =>
        materializeRichInlineLineRange(cached.prepared, range)
      );

      const textHeight = materializedLines.length * designManifest.typography.sizes.sm.lineHeight;
      const totalHeight = textHeight + cached.paddingHeight;

      return {
        ...study,
        height: totalHeight,
        lines: materializedLines,
        items: cached.items,
      };
    });

    // 2. Greedy distribution (Zero-whitespace Masonry Scheduler)
    const columns: LayoutStudy[][] = Array.from({ length: colCount }, () => []);
    const columnHeights = Array(colCount).fill(0);

    for (const study of studiesWithHeight) {
      let minColIdx = 0;
      let minHeight = columnHeights[0];
      for (let i = 1; i < colCount; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i];
          minColIdx = i;
        }
      }

      columns[minColIdx].push(study);
      columnHeights[minColIdx] += study.height + gap;
    }

    setLayoutState({
      colCount,
      columns,
      isReady: true,
    });
  }, [filteredStudies]);

  // Bind ResizeObserver to capture container width changes
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidthRef.current = entry.contentRect.width;
        recalculateLayout(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    const initialWidth = containerRef.current.getBoundingClientRect().width;
    containerWidthRef.current = initialWidth;
    recalculateLayout(initialWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, [recalculateLayout]);

  // Handle dynamic filter tab switching
  useLayoutEffect(() => {
    if (containerWidthRef.current > 0) {
      recalculateLayout(containerWidthRef.current);
    }
  }, [filteredStudies, recalculateLayout]);

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
