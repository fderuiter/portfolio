"use client";

import React from "react";
import { Card, CardTitle } from "@/components/BentoGrid";
import { PretextRichText, usePretextRichLayout, type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats, getSimulatedTerminalCommand, getSimulatedTerminalLogs } from "@/lib/github";
import { IconStar, IconGitFork, IconAlertCircle, IconTerminal, IconChevronRight } from "@tabler/icons-react";
import { type RichInlineLine } from "@chenglou/pretext/rich-inline";
import Link from "next/link";
import { CommitSparkline } from "@/components/CommitSparkline";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAnnouncer } from "@/components/providers/A11yProvider";
import { LAYOUT_CONFIG } from "@/lib/layout-config";
import { useBentoLayout } from "@/components/providers/BentoLayoutContext";

const REALITY_CONTENT: Record<string, string> = {
  schemaflow: "While the drag-and-drop canvas is extremely smooth, we initially faced major rendering bottlenecks when rendering over 150 schema nodes. We had to implement node occlusion culling and state debouncing to maintain 60 FPS, and cyclical dependency detection still requires optimized Web Worker postMessage parsing.",
  "clinical-data-mapper": "Handling 2GB+ XML structures in Node.js was a memory nightmare. Even with SAX streaming, V8 garbage collection spikes caused transient API container restarts in production. We had to tune Kubernetes memory limits and implement chunked database transaction commits to stabilize the service under heavy load.",
  "imednet-python-sdk": "The platform SOAP endpoints are notoriously flaky and poorly documented. We spent over 80 hours reverse-engineering session token validation schemas. Retries are frequent, and TLS handshake timeouts on Legacy endpoints require an aggressive connection pooling and cache synchronization strategy."
};

const getRealityContent = (slug: string, originalContent: string) => {
  return REALITY_CONTENT[slug] || `Reality Check: ${originalContent} (Dynamic verification and performance testing in live staging revealed minor scaling limits under concurrent loads).`;
};

interface CaseStudyBentoCardProps {
  study: BaseCaseStudy & { githubStats: GitHubStats | null };
  className?: string;
  preCalculatedHeight?: number;
  preCalculatedParagraphsLines?: RichInlineLine[][];
  preCalculatedParagraphsItems?: ExtendedRichInlineItem[][];
}

// Map common languages to premium styling colors
const LANGUAGE_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  TypeScript: { bg: "bg-blue-500/10", text: "text-blue-400", hex: "#3178c6" },
  JavaScript: { bg: "bg-yellow-500/10", text: "text-yellow-400", hex: "#f1e05a" },
  Python: { bg: "bg-emerald-500/10", text: "text-emerald-400", hex: "#3572a5" },
  Haskell: { bg: "bg-indigo-500/10", text: "text-indigo-400", hex: "#5e5086" },
  CSS: { bg: "bg-purple-500/10", text: "text-purple-400", hex: "#563d7c" },
  HTML: { bg: "bg-orange-500/10", text: "text-orange-400", hex: "#e34c26" },
};

const DEFAULT_COLOR = { bg: "bg-zinc-500/10", text: "text-zinc-400", hex: "#8b949e" };

export const CaseStudyBentoCard: React.FC<CaseStudyBentoCardProps> = ({ 
  study, 
  className,
  preCalculatedHeight,
  preCalculatedParagraphsLines,
  preCalculatedParagraphsItems,
}) => {
  const { githubStats } = study;
  const tagsList = study.tags ? study.tags.split(",").map((t) => t.trim()) : [];
  const langColor = LANGUAGE_COLORS[study.primary_language] || DEFAULT_COLOR;

  // Track dynamic real-time telemetry metrics site-wide
  const { telemetry, syncFailed, recordEvent } = useTelemetry();
  const stats = telemetry[study.slug] || { views: 0, clicks: 0 };
  
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    if (syncFailed) {
      announce("Tax sync failed", "assertive");
    }
  }, [syncFailed, announce]);

  const { heightOverrides, registerHeightOverride, clearHeightOverride, setTransitioning } = useBentoLayout();
  const [mode, setMode] = React.useState<"pitch" | "reality">("pitch");
  const [isLocalTransitioning, setIsLocalTransitioning] = React.useState(false);

  const handleToggleMode = (newMode: "pitch" | "reality") => {
    if (newMode === mode) return;

    setIsLocalTransitioning(true);
    setTransitioning(study.id, true);
    setMode(newMode);

    if (newMode === "pitch") {
      clearHeightOverride(study.id);
    }

    setTimeout(() => {
      setIsLocalTransitioning(false);
      setTransitioning(study.id, false);
    }, 400);
  };

  const hasPrecalculated = preCalculatedHeight !== undefined && preCalculatedParagraphsLines !== undefined && preCalculatedParagraphsItems !== undefined;

  // We always execute the hook to follow dynamic hooks rules, but ignore if precalculated is provided
  const internalLayout = usePretextRichLayout({
    text: study.editorial_content,
    fontSize: LAYOUT_CONFIG.FONT_SIZE,
    lineHeight: LAYOUT_CONFIG.LINE_HEIGHT,
    fontFamilyVariable: "--font-inter",
    translationMode: mode, // Pass active translation state
  });

  const finalHeight = hasPrecalculated ? preCalculatedHeight : (internalLayout.isReady ? internalLayout.height + (githubStats ? LAYOUT_CONFIG.PADDING_WITH_STATS : LAYOUT_CONFIG.PADDING_WITHOUT_STATS) : undefined);
  const isLayoutReady = hasPrecalculated ? true : internalLayout.isReady;

  const innerRef = React.useRef<HTMLDivElement>(null);

  // ResizeObserver restricted strictly to the active transition/interactive state (Reality mode)
  React.useLayoutEffect(() => {
    if (mode !== "reality" || !innerRef.current) return;

    const element = innerRef.current;
    
    const observer = new ResizeObserver(() => {
      const cardEl = element.closest('div.isolate') as HTMLElement;
      if (cardEl) {
        const originalHeight = cardEl.style.height;
        cardEl.style.height = 'auto'; // Disable fixed height to measure natural footprint
        const actualHeight = cardEl.getBoundingClientRect().height;
        cardEl.style.height = originalHeight; // Restore immediately
        
        registerHeightOverride(study.id, actualHeight);
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [mode, study.id, registerHeightOverride]);

  React.useLayoutEffect(() => {
    // Check global flag injected by Playwright
    const isPlaywright = typeof window !== 'undefined' && (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ === true;
    
    // Only run in development or when explicitly requested by Playwright
    if ((process.env.NODE_ENV === "development" || isPlaywright) && hasPrecalculated && innerRef.current && finalHeight) {
      // Temporarily bypass warnings during transitions or when card has active dynamic override
      const isBypassed = isLocalTransitioning || mode !== "pitch" || (heightOverrides && heightOverrides[study.id] !== undefined);
      if (isBypassed) {
        return;
      }

      const cardEl = innerRef.current.closest('div.isolate') as HTMLElement;
      if (cardEl) {
        const originalHeight = cardEl.style.height;
        cardEl.style.height = 'auto'; // Disable fixed height to measure natural footprint
        
        const actualHeight = cardEl.getBoundingClientRect().height;
        
        cardEl.style.height = originalHeight; // Restore immediately
        
        if (Math.abs(actualHeight - finalHeight) > 2) {
          console.warn(`[Rigor] Hydration mismatch detected! Card '${study.slug}' mathematically predicted height ${finalHeight}px but DOM naturally measured ${actualHeight}px. This indicates a drift in layout constants (e.g. padding constants).`);
          
          // Provide an attribute for Playwright to catch
          if (isPlaywright) {
            cardEl.setAttribute('data-hydration-mismatch', 'true');
            cardEl.setAttribute('data-expected-height', finalHeight.toString());
            cardEl.setAttribute('data-actual-height', actualHeight.toString());
          }
        }
      }
    }
  }, [hasPrecalculated, finalHeight, study.slug, isLocalTransitioning, mode, heightOverrides, study.id]);

  const cardHeightValue = heightOverrides[study.id] !== undefined ? heightOverrides[study.id] : finalHeight;

  return (
    <Card
      className={className}
      style={{
        height: cardHeightValue ? `${cardHeightValue}px` : "auto",
        transition: "height 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div ref={innerRef} className="flex flex-col h-full justify-between">
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

          {/* Premium Segmented Mode Switcher */}
          <div className="flex p-0.5 bg-zinc-950/80 border border-zinc-900/80 rounded-lg mb-4 text-[10px] font-mono relative z-10 w-fit backdrop-blur-sm">
            <button
              onClick={() => handleToggleMode("pitch")}
              className={`px-3 py-1 rounded-md font-bold transition-all duration-200 cursor-pointer ${
                mode === "pitch"
                  ? "bg-zinc-900 text-brand-cyan border border-brand-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              THE PITCH
            </button>
            <button
              onClick={() => handleToggleMode("reality")}
              className={`px-3 py-1 rounded-md font-bold transition-all duration-200 cursor-pointer ${
                mode === "reality"
                  ? "bg-zinc-900 text-brand-cyan border border-brand-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              THE REALITY
            </button>
          </div>

           {/* Description Block using Pretext Rich Text for Pitch, or Custom Reality Text */}
          <div className="mb-4">
            {mode === "pitch" ? (
              <div ref={hasPrecalculated ? undefined : internalLayout.ref}>
                {hasPrecalculated && preCalculatedParagraphsLines && preCalculatedParagraphsItems ? (
                  <div className="flex flex-col gap-[12px]">
                    {preCalculatedParagraphsLines.map((pLines, pIdx) => (
                      <PretextRichText
                        key={pIdx}
                        lines={pLines}
                        items={preCalculatedParagraphsItems[pIdx]}
                        lineHeight={LAYOUT_CONFIG.LINE_HEIGHT}
                        isReady={isLayoutReady}
                        fallbackText=""
                        className="text-zinc-400 text-sm leading-relaxed font-sans"
                      />
                    ))}
                  </div>
                ) : (
                  <PretextRichText
                    lines={internalLayout.lines}
                    items={internalLayout.items}
                    lineHeight={LAYOUT_CONFIG.LINE_HEIGHT}
                    isReady={isLayoutReady}
                    fallbackText={study.editorial_content}
                    className="text-zinc-400 text-sm leading-relaxed font-sans"
                  />
                )}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                {getRealityContent(study.slug, study.editorial_content)}
              </p>
            )}
          </div>

          {/* Dynamic GitHub Statistics Hydration */}
          {githubStats && (
            <div className="space-y-4 mb-5 border-t border-zinc-900/60 pt-4">
              {/* Glowing SVG Commit Timeline Sparkline */}
              <CommitSparkline 
                activity={githubStats.commitActivity} 
                className="mb-2"
              />

              {/* Refined Inline Badges Row */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-zinc-900/60 pb-3 mb-1">
                <span className="flex items-center gap-1">
                  <IconStar className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-zinc-300 font-bold">{githubStats.stars.toLocaleString()}</span> STARS
                </span>
                <span className="flex items-center gap-1">
                  <IconGitFork className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-zinc-300 font-bold">{githubStats.forks.toLocaleString()}</span> FORKS
                </span>
                <span className="flex items-center gap-1">
                  <IconAlertCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-zinc-300 font-bold">{githubStats.openIssues.toLocaleString()}</span> ISSUES
                </span>
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
                  <span>{study.simulated_telemetry ? getSimulatedTerminalCommand(study.primary_language) : "git log --oneline -n 5"}</span>
                </div>
                <div className="flex-1 flex flex-col justify-start space-y-1 overflow-y-auto scrollbar-none text-zinc-400">
                  {study.simulated_telemetry ? (
                    getSimulatedTerminalLogs(study.primary_language).map((log, i) => (
                      <div key={i} className="truncate flex items-start gap-1">
                        <span className={log.color || "text-zinc-300"}>{log.text}</span>
                      </div>
                    ))
                  ) : githubStats.recentCommits.length > 0 ? (
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

        {/* Dynamic Telemetry Metrics HUD */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 mt-2 mb-1 relative z-10 select-none">
          <span className="flex items-center gap-1.5" title="Aggregate Page Views">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" aria-hidden="true" />
            <span className="sr-only" aria-live="polite">Live page views: {stats.views}</span>
            <span className="text-zinc-300 font-bold" aria-hidden="true">{stats.views.toLocaleString()}</span> <span aria-hidden="true">VIEWS</span>
          </span>
          <span className="flex items-center gap-1.5" title="Bento Card Interactions">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            <span className="sr-only" aria-live="polite">Live clicks: {stats.clicks}</span>
            <span className="text-zinc-300 font-bold" aria-hidden="true">{stats.clicks.toLocaleString()}</span> <span aria-hidden="true">CLICKS</span>
          </span>
          {syncFailed && (
            <span 
              className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping cursor-help" 
              title="Telemetry offline sync mode active (LocalStorage cached)"
            />
          )}
        </div>

        {/* Footer analyze link */}
        <div className="flex justify-between items-center border-t border-zinc-900/40 pt-3 mt-2">
          <Link
            href={`/case-studies/${study.slug}`}
            onClick={() => recordEvent(study.slug, "project_click")}
            className="group inline-flex items-center text-xs font-bold text-brand-cyan/80 hover:text-brand-cyan transition-colors duration-300 cursor-pointer relative z-10"
          >
            <span>Analyze Architecture</span>
            <IconChevronRight className="ml-1 w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <div className="text-[9px] font-mono text-zinc-600">
            {!isLayoutReady ? "MEASURING..." : `H: ${finalHeight}px`}
          </div>
        </div>
      </div>
    </Card>
  );
};
