"use client";

import React from "react";
import { Card, CardTitle } from "@/components/BentoGrid";
import { type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats, getSimulatedTerminalCommand, getSimulatedTerminalLogs } from "@/lib/github";
import { IconStar, IconGitFork, IconAlertCircle, IconTerminal, IconChevronRight } from "@tabler/icons-react";
import { type RichInlineLine } from "@chenglou/pretext/rich-inline";
import Link from "next/link";
import { CommitSparkline } from "@/components/CommitSparkline";
import { useBentoLayout } from "@/components/providers/BentoLayoutContext";

const REALITY_CONTENT: Record<string, string> = {
  schemaflow: "While the drag-and-drop canvas is extremely smooth, we initially faced major rendering bottlenecks when rendering over 150 schema nodes. We had to implement node occlusion culling and state debouncing to maintain 60 FPS, and cyclical dependency detection still requires optimized Web Worker postMessage parsing.",
  "clinical-data-mapper": "Handling 2GB+ XML structures in Node.js was a memory nightmare. Even with SAX streaming, V8 garbage collection spikes caused transient API container restarts in production. We had to tune Kubernetes memory limits and implement chunked database transaction commits to stabilize the service under heavy load.",
  "imednet-python-sdk": "The platform SOAP endpoints are notoriously flaky and poorly documented. We spent over 80 hours reverse-engineering session token validation schemas. Retries are frequent, and TLS handshake timeouts on legacy endpoints require an aggressive connection pooling and cache synchronization strategy.",
  "cadence-clinical": "Building a unified eCRF orchestrator sounds elegant until clinical trial coordinators attempt to create dynamic conditional logic trees with 40 circular dependencies. We had to write a custom DAG resolution engine and aggressive client-side form debouncing to keep the UI from lagging during 50-field visits.",
  "wedding-website": "Building a bespoke event portal for your own wedding is the ultimate high-stakes deployment. Zero downtime tolerance when 150 relatives try to RSVP at once, and debugging custom Framer Motion spring physics on aunties' 7-year-old iPads at midnight before the rehearsal dinner was a character-building experience."
};

const getRealityContent = (slug: string, originalContent: string) => {
  return REALITY_CONTENT[slug] || `Reality Check: ${originalContent} (Dynamic verification and performance testing in live staging revealed minor scaling limits under concurrent loads).`;
};

export const FormattedMarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const paragraphs = React.useMemo(() => {
    return text.split(/\r?\n+/).map((p) => p.trim()).filter(Boolean);
  }, [text]);

  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((para, pIdx) => {
        const tokens: { type: "text" | "bold" | "italic" | "code"; content: string }[] = [];
        const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*|[^*`\n]+|\n)/g;
        let match;
        while ((match = regex.exec(para)) !== null) {
          const raw = match[0];
          if (raw.startsWith("**") && raw.endsWith("**") && raw.length > 4) {
            tokens.push({ type: "bold", content: raw.slice(2, -2) });
          } else if (raw.startsWith("`") && raw.endsWith("`") && raw.length > 2) {
            tokens.push({ type: "code", content: raw.slice(1, -1) });
          } else if (raw.startsWith("*") && raw.endsWith("*") && raw.length > 2) {
            tokens.push({ type: "italic", content: raw.slice(1, -1) });
          } else {
            tokens.push({ type: "text", content: raw });
          }
        }

        return (
          <p key={pIdx} className={className}>
            {tokens.map((token, idx) => {
              if (token.type === "bold") {
                return (
                  <strong key={idx} className="font-bold text-neutral-100">
                    {token.content}
                  </strong>
                );
              }
              if (token.type === "code") {
                return (
                  <code
                    key={idx}
                    className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono font-bold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-md inline-block shadow-[0_0_10px_rgba(6,182,212,0.05)] align-baseline leading-none"
                  >
                    {token.content}
                  </code>
                );
              }
              if (token.type === "italic") {
                return (
                  <em key={idx} className="italic text-zinc-300">
                    {token.content}
                  </em>
                );
              }
              return <span key={idx}>{token.content}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
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
  React: { bg: "bg-cyan-500/10", text: "text-cyan-400", hex: "#06b6d4" },
};

const DEFAULT_COLOR = { bg: "bg-zinc-500/10", text: "text-zinc-400", hex: "#8b949e" };

export const CaseStudyBentoCard: React.FC<CaseStudyBentoCardProps> = ({ 
  study, 
  className,
  preCalculatedHeight,
}) => {
  const { githubStats } = study;
  const tagsList = study.tags ? study.tags.split(",").map((t) => t.trim()) : [];
  const langColor = LANGUAGE_COLORS[study.primary_language] || DEFAULT_COLOR;

  const { heightOverrides, registerHeightOverride, clearHeightOverride, setTransitioning } = useBentoLayout();
  const [mode, setMode] = React.useState<"pitch" | "reality">("pitch");

  const handleToggleMode = (newMode: "pitch" | "reality") => {
    if (newMode === mode) return;

    setTransitioning(study.id, true);
    setMode(newMode);

    if (newMode === "pitch") {
      clearHeightOverride(study.id);
    }

    setTimeout(() => {
      setTransitioning(study.id, false);
    }, 400);
  };

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

  const cardHeightValue = heightOverrides[study.id] !== undefined 
    ? heightOverrides[study.id] 
    : preCalculatedHeight;

  return (
    <Card
      className={className}
      style={{
        minHeight: cardHeightValue ? `${cardHeightValue}px` : "auto",
        height: cardHeightValue ? `${cardHeightValue}px` : "auto",
        transition: "height 250ms cubic-bezier(0.16, 1, 0.3, 1), min-height 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div ref={innerRef} className="flex flex-col h-full justify-between gap-3 flex-1 min-h-0">
        <div>
          {/* Card Top Pill & Header */}
          <div className="flex justify-between items-center mb-2.5">
            <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold border border-current/10 rounded-md ${langColor.bg} ${langColor.text}`}>
              {study.primary_language}
            </span>
            <span 
              className="text-[10px] font-mono text-zinc-400 truncate max-w-[160px] text-right"
              title={study.slug.toUpperCase()}
            >
              {study.slug.toUpperCase()}
            </span>
          </div>

          <CardTitle className="text-base md:text-lg font-extrabold tracking-tight leading-snug mb-2.5">
            {study.title}
          </CardTitle>

          {/* Premium Segmented Mode Switcher */}
          <div className="flex p-0.5 bg-zinc-950/80 border border-zinc-900/80 rounded-lg mb-3 text-xs font-mono relative z-10 w-fit backdrop-blur-sm">
            <button
              onClick={() => handleToggleMode("pitch")}
              className={`min-h-9 px-3.5 py-1.5 rounded-md border text-[11px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                mode === "pitch"
                  ? "bg-zinc-900 text-brand-cyan border-brand-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              THE PITCH
            </button>
            <button
              onClick={() => handleToggleMode("reality")}
              className={`min-h-9 px-3.5 py-1.5 rounded-md border text-[11px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                mode === "reality"
                  ? "bg-zinc-900 text-brand-cyan border-brand-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              THE REALITY
            </button>
          </div>

          {/* Description Block using Semantic Formatted Markdown */}
          <div className="mb-3">
            {mode === "pitch" ? (
              <FormattedMarkdownText
                text={study.editorial_content}
                className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans"
              />
            ) : (
              <FormattedMarkdownText
                text={getRealityContent(study.slug, study.editorial_content)}
                className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans"
              />
            )}
          </div>

          {/* Dynamic GitHub Statistics Hydration */}
          {githubStats && (
            <div className="space-y-3 mb-3 border-t border-zinc-900/60 pt-3">
              {/* Glowing SVG Commit Timeline Sparkline */}
              <CommitSparkline 
                activity={githubStats.commitActivity} 
                className="mb-1"
              />

              {/* Refined Inline Badges Row */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-900/60 pb-2.5 mb-1">
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
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>LANGUAGE STACK</span>
                    <span className="text-zinc-400">
                      {githubStats.languages[0]?.name} {githubStats.languages[0]?.percentage}%
                    </span>
                  </div>
                  {/* Aggregated distribution bar */}
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex">
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
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-mono text-zinc-400">
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
              <div className="bg-black/60 border border-zinc-900/60 rounded-xl p-2.5 font-mono text-[9.5px] leading-tight space-y-1 h-[115px] flex flex-col justify-start overflow-hidden">
                <div className="flex items-center text-zinc-400 border-b border-zinc-900/60 pb-1 mb-1">
                  <IconTerminal className="w-3.5 h-3.5 mr-1 text-zinc-400 shrink-0" />
                  <span className="truncate">{study.simulated_telemetry ? getSimulatedTerminalCommand(study.primary_language) : "git log --oneline -n 5"}</span>
                </div>
                <div className="flex-1 flex flex-col justify-start space-y-1 overflow-y-auto overscroll-contain scrollbar-none text-zinc-400">
                  {study.simulated_telemetry ? (
                    getSimulatedTerminalLogs(study.primary_language).map((log, i) => (
                      <div key={i} className="truncate flex items-start gap-1">
                        <span className={log.color || "text-zinc-300"}>{log.text}</span>
                      </div>
                    ))
                  ) : githubStats.recentCommits.length > 0 ? (
                    githubStats.recentCommits.map((c, i) => (
                      <div key={i} className="truncate flex items-start gap-1">
                        <span className="text-brand-cyan select-none shrink-0">{c.sha}</span>
                        <span className="text-zinc-500 select-none shrink-0">|</span>
                        <span className="text-zinc-300 truncate" title={c.message}>{c.message}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-400 italic">No recent commits located.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tags list (only when no stats are rendered to save visual space, or inline) */}
          {!githubStats && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
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

        {/* Footer analyze link with 44px+ tap target */}
        <div className="flex justify-between items-center border-t border-zinc-900/40 pt-1.5 mt-1">
          <Link
            href={`/case-studies/${study.slug}`}
            className="group inline-flex items-center min-h-[44px] py-2 text-xs font-bold text-brand-cyan/80 hover:text-brand-cyan transition-colors duration-300 cursor-pointer relative z-10"
          >
            <span>Analyze Architecture</span>
            <IconChevronRight className="ml-1 w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
