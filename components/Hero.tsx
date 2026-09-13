"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePretextLayout } from "@/hooks/usePretextLayout";
import { AnimatedGridPattern } from "@/components/AnimatedGridPattern";
import { designManifest } from "@/lib/design-manifest";
import { useAudio } from "@/components/providers/AudioProvider";
import {
  IconDeviceGamepad2,
  IconShieldCheck,
  IconTerminal,
  IconCpu,
  IconCheck,
  IconRefresh,
  IconArrowRight,
  IconBrandGithub,
  IconAtom,
} from "@tabler/icons-react";

function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

interface HeroHeadlineProps {
  text: string;
}

export const HeroHeadline: React.FC<HeroHeadlineProps> = ({ text }) => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = React.useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );
  const { ref, height, isReady } = usePretextLayout({
    text,
    fontSize: 54,
    lineHeight: 60,
    fontFamilyVariable: "--font-inter",
    getResponsiveMetrics: (width) => {
      if (width < 450) {
        return { fontSize: 32, lineHeight: 36 };
      } else if (width < 768) {
        return { fontSize: 40, lineHeight: 46 };
      }
      return { fontSize: 54, lineHeight: 60 };
    },
  });

  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0.02 : 0.04,
      },
    },
  };

  const wordVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
      }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { ...designManifest.motion.springs.hero, mass: 0.35 },
        },
      };

  return (
    <div
      style={{ minHeight: isReady && height ? `${height}px` : undefined }}
      className="relative w-full max-w-4xl mx-auto lg:mx-0 min-h-[72px] sm:min-h-[90px] lg:min-h-[110px] mb-4 sm:mb-6 transition-[min-height] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      {/* 1. Custom Visual Presentation (hidden from screen readers, not selectable) */}
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        data-pretext-layer="visual"
        className="w-full select-none pointer-events-none"
      >
        {!isReady ? (
          <p className="fluid-heading-hero font-extrabold tracking-tight text-center lg:text-left text-white leading-tight heading-editorial">
            {text}
          </p>
        ) : isMobile ? (
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fluid-heading-hero font-extrabold tracking-tight text-center lg:text-left text-white heading-editorial"
          >
            {text}
          </motion.p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="fluid-heading-hero font-extrabold tracking-tight text-center lg:text-left flex flex-wrap justify-center lg:justify-start heading-editorial"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-[0.22em] will-change-transform text-white font-extrabold"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* 2. Transparent Standard Semantic Overlay (selectable, readable by screen readers) */}
      <h1
        className="fluid-heading-hero font-black tracking-tight text-center absolute inset-0 select-text bg-transparent"
        data-pretext-layer="semantic"
      >
        {text}
      </h1>
    </div>
  );
};

interface HeroTextProps {
  text: string;
}

export const HeroText: React.FC<HeroTextProps> = ({ text }) => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = React.useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );
  const { ref, height, isReady } = usePretextLayout({
    text,
    fontSize: 16,
    lineHeight: 28,
    fontFamilyVariable: "--font-inter",
    getResponsiveMetrics: (width) => {
      if (width < 640) {
        return { fontSize: 14, lineHeight: 22 };
      }
      return { fontSize: 16, lineHeight: 26 };
    },
  });

  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0.01 : 0.015,
        delayChildren: shouldReduceMotion ? 0.1 : 0.3,
      },
    },
  };

  const wordVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
      }
    : {
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { ...designManifest.motion.springs.heroBeam, mass: 0.25 },
        },
      };

  return (
    <div
      style={{ minHeight: isReady && height ? `${height}px` : undefined }}
      className="relative w-full max-w-2xl mx-auto lg:mx-0 min-h-[48px] sm:min-h-[54px] mb-6 sm:mb-8 transition-[min-height] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      {/* 1. Custom Visual Presentation (hidden from screen readers, not selectable) */}
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        data-pretext-layer="visual"
        className="w-full select-none pointer-events-none"
      >
        {!isReady ? (
          <p className="text-zinc-300 fluid-body leading-relaxed text-center lg:text-left">
            {text}
          </p>
        ) : isMobile ? (
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
            className="text-zinc-300 fluid-body leading-relaxed text-center lg:text-left"
          >
            {text}
          </motion.p>
        ) : (
          <motion.p
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-zinc-300 fluid-body leading-relaxed text-center lg:text-left flex flex-wrap justify-center lg:justify-start"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-[0.3em] will-change-transform"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        )}
      </div>

      {/* 2. Transparent Standard Semantic Overlay (selectable, readable by screen readers) */}
      <p
        className="text-neutral-400 fluid-body text-center absolute inset-0 select-text bg-transparent"
        data-pretext-layer="semantic"
      >
        {text}
      </p>
    </div>
  );
};

type ConsoleMode = "logic" | "cdisc" | "garmin";

const CONSOLE_MODES: readonly ConsoleMode[] = ["logic", "cdisc", "garmin"];

const CONSOLE_MODE_LABELS: Record<ConsoleMode, string> = {
  logic: "Logic demo",
  cdisc: "Clinical demo",
  garmin: "Memory demo",
};

/**
 * Interactive Live Engineering Console / Telemetry Spec Card
 */
const InteractiveEngineeringConsole: React.FC = () => {
  const [mode, setMode] = useState<ConsoleMode>("logic");
  const shouldReduceMotion = useReducedMotion();
  const { playSkillHover, playSuccess } = useAudio();
  const [logicDischarged, setLogicDischarged] = useState(false);
  const [fhirValidationActive, setFhirValidationActive] = useState(true);
  const [garminHeapAlloc, setGarminHeapAlloc] = useState(18.4);
  const [isGarminGcRunning, setIsGarminGcRunning] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const tabRefs = React.useRef<Record<ConsoleMode, HTMLButtonElement | null>>({
    logic: null,
    cdisc: null,
    garmin: null,
  });
  const gcTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectMode = (nextMode: ConsoleMode) => {
    setMode(nextMode);
    setAnnouncement(`${CONSOLE_MODE_LABELS[nextMode]} selected.`);
    playSkillHover();
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentMode: ConsoleMode
  ) => {
    const currentIndex = CONSOLE_MODES.indexOf(currentMode);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % CONSOLE_MODES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + CONSOLE_MODES.length) % CONSOLE_MODES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = CONSOLE_MODES.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextMode = CONSOLE_MODES[nextIndex];
    selectMode(nextMode);
    tabRefs.current[nextMode]?.focus();
  };

  const handleDischargeStep = () => {
    setLogicDischarged((prev) => !prev);
    setAnnouncement(
      logicDischarged
        ? "Illustrative logic step returned to its starting state."
        : "Illustrative logic step applied. Q follows from the sample premises."
    );
    if (!logicDischarged) {
      playSuccess();
    } else {
      playSkillHover();
    }
  };

  const handleRunGc = () => {
    if (gcTimerRef.current) clearTimeout(gcTimerRef.current);
    setIsGarminGcRunning(true);
    setAnnouncement("Illustrative memory cleanup is running.");
    playSkillHover();
    gcTimerRef.current = setTimeout(() => {
      setGarminHeapAlloc((prev) => (prev > 14 ? 12.2 : 19.6));
      setIsGarminGcRunning(false);
      setAnnouncement("Illustrative memory cleanup complete.");
      gcTimerRef.current = null;
    }, 400);
  };

  const resetLogicDemo = () => {
    setLogicDischarged(false);
    setAnnouncement("Logic demo reset.");
    playSkillHover();
  };

  const resetClinicalDemo = () => {
    setFhirValidationActive(true);
    setAnnouncement("Clinical demo reset.");
    playSkillHover();
  };

  const resetMemoryDemo = () => {
    if (gcTimerRef.current) clearTimeout(gcTimerRef.current);
    gcTimerRef.current = null;
    setGarminHeapAlloc(18.4);
    setIsGarminGcRunning(false);
    setAnnouncement("Memory demo reset.");
    playSkillHover();
  };

  React.useEffect(() => {
    return () => {
      if (gcTimerRef.current) clearTimeout(gcTimerRef.current);
    };
  }, []);

  return (
    <div className="@container min-w-0 w-full max-w-xl mx-auto lg:max-w-none break-words bg-[#13151a] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 motion-reduce:transition-none hover:border-amber-500/30">
      {/* Precision grid decorative corner cues */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-[9px] text-zinc-400 uppercase tracking-wider select-none">
        <span
          className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${
            shouldReduceMotion ? "" : "animate-pulse"
          }`}
        />
        <span>A FEW THINGS TO TRY</span>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-zinc-400">
        Try a logic rule, a form check, or a memory cleanup. These use sample
        data, not live systems.
      </p>

      <div>
        {/* Header Tabs */}
        <div
          className="grid grid-cols-3 gap-1 mb-5 pb-4 border-b border-white/10"
          role="tablist"
          aria-label="Interactive Systems Demos"
        >
          <button
            ref={(node) => {
              tabRefs.current.logic = node;
            }}
            id="hero-demo-tab-logic"
            role="tab"
            aria-selected={mode === "logic"}
            aria-controls="hero-demo-panel-logic"
            tabIndex={mode === "logic" ? 0 : -1}
            onClick={() => {
              selectMode("logic");
            }}
            onKeyDown={(event) => handleTabKeyDown(event, "logic")}
            className={`min-w-0 min-h-11 justify-center px-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a] ${
              mode === "logic"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <IconAtom className="w-3.5 h-3.5" />
            <span className="min-w-0 break-words">Logic</span>
          </button>

          <button
            ref={(node) => {
              tabRefs.current.cdisc = node;
            }}
            id="hero-demo-tab-cdisc"
            role="tab"
            aria-selected={mode === "cdisc"}
            aria-controls="hero-demo-panel-cdisc"
            tabIndex={mode === "cdisc" ? 0 : -1}
            onClick={() => {
              selectMode("cdisc");
            }}
            onKeyDown={(event) => handleTabKeyDown(event, "cdisc")}
            className={`min-w-0 min-h-11 justify-center px-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a] ${
              mode === "cdisc"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <IconShieldCheck className="w-3.5 h-3.5" />
            <span className="min-w-0 break-words">Clinical</span>
          </button>

          <button
            ref={(node) => {
              tabRefs.current.garmin = node;
            }}
            id="hero-demo-tab-garmin"
            role="tab"
            aria-selected={mode === "garmin"}
            aria-controls="hero-demo-panel-garmin"
            tabIndex={mode === "garmin" ? 0 : -1}
            onClick={() => {
              selectMode("garmin");
            }}
            onKeyDown={(event) => handleTabKeyDown(event, "garmin")}
            className={`min-w-0 min-h-11 justify-center px-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a] ${
              mode === "garmin"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <IconCpu className="w-3.5 h-3.5" />
            <span className="min-w-0 break-words">Memory</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div
          id={`hero-demo-panel-${mode}`}
          role="tabpanel"
          aria-labelledby={`hero-demo-tab-${mode}`}
          className="min-h-[270px] sm:min-h-[246px] flex flex-col justify-between font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#13151a]"
        >
          <AnimatePresence mode="wait">
            {mode === "logic" && (
              <motion.div
                key="logic"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] text-zinc-400">
                  <span>ONE SMALL LOGIC PROOF</span>
                  <span className="text-amber-400 font-semibold">
                    ILLUSTRATIVE RULE: MODUS PONENS
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-xs text-zinc-300">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="text-zinc-400">1. Rule</span>
                    <span className="text-amber-300 font-semibold">P → Q</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="text-zinc-400">2. Fact</span>
                    <span className="text-amber-300 font-semibold">
                      P is true
                    </span>
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-white/10 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="text-zinc-400">3. Result</span>
                    <span
                      className={
                        logicDischarged
                          ? "text-emerald-400 font-bold"
                          : "text-zinc-400 italic"
                      }
                    >
                      {logicDischarged
                        ? "Illustrative result: Q follows"
                        : "Awaiting inference"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 gap-3 pt-1">
                  <button
                    onClick={handleDischargeStep}
                    className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a]"
                  >
                    <IconRefresh
                      className={`w-3.5 h-3.5 ${logicDischarged ? "rotate-180" : ""} transition-transform duration-300`}
                    />
                    <span>
                      {logicDischarged ? "Undo the Step" : "Apply the Rule"}
                    </span>
                  </button>

                  <button
                    onClick={resetLogicDemo}
                    className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-200 border border-white/15 rounded-xl transition-colors hover:bg-white/5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a]"
                  >
                    <IconRefresh className="w-3.5 h-3.5" />
                    <span>Reset Logic Demo</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className={`w-2 h-2 rounded-full ${logicDischarged ? "bg-emerald-400" : "bg-amber-400"} transition-colors`}
                    />
                    <span className="text-zinc-400">
                      {logicDischarged
                        ? "ILLUSTRATIVE STATE: RESULT DERIVED"
                        : "ILLUSTRATIVE STATE: READY"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {mode === "cdisc" && (
              <motion.div
                key="cdisc"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] text-zinc-400">
                  <span>A CLINICAL FORM CHECK</span>
                  <span className="text-emerald-400 font-semibold">
                    ILLUSTRATIVE VALIDATION
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-xs text-zinc-300">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="text-zinc-400">Field:</span>
                    <span className="text-white font-mono">
                      Patient Age (Demographics)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="text-zinc-400">Validation:</span>
                    <span className="text-amber-300">
                      Range &amp; Type Safety Check
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <span className="text-zinc-400">Audit Security:</span>
                    <span className="text-zinc-400 truncate max-w-[200px]">
                      Example audit record
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setFhirValidationActive(!fhirValidationActive);
                      setAnnouncement(
                        fhirValidationActive
                          ? "Illustrative validation rule paused."
                          : "Illustrative validation rule activated."
                      );
                      playSkillHover();
                    }}
                    className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a]"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>
                      {fhirValidationActive
                        ? "Illustrative Integrity Rule: Active"
                        : "Illustrative Integrity Rule: Paused"}
                    </span>
                  </button>

                  <button
                    onClick={resetClinicalDemo}
                    className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-200 border border-white/15 rounded-xl transition-colors hover:bg-white/5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a]"
                  >
                    <IconRefresh className="w-3.5 h-3.5" />
                    <span>Reset Clinical Demo</span>
                  </button>

                  <span className="text-[10px] text-zinc-400">
                    ILLUSTRATIVE DEMO RULE
                  </span>
                </div>
              </motion.div>
            )}

            {mode === "garmin" && (
              <motion.div
                key="garmin"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] text-zinc-400">
                  <span>SMARTWATCH RUNTIME</span>
                  <span className="text-cyan-400 font-semibold">
                    ILLUSTRATIVE 32KB MEMORY BUDGET
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 text-xs text-zinc-300">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px]">
                    <span className="text-zinc-400">Simulated RAM Used:</span>
                    <span className="text-amber-300 font-bold">
                      {garminHeapAlloc.toFixed(1)} KB / 32.0 KB (
                      {Math.round((garminHeapAlloc / 32) * 100)}%)
                    </span>
                  </div>
                  {/* Visual memory bar */}
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      style={
                        {
                          "--heap-scale-x": garminHeapAlloc / 32,
                        } as React.CSSProperties
                      }
                      className="h-full w-full bg-amber-400 origin-left transform-gpu scale-x-[var(--heap-scale-x)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[10px] text-zinc-400 pt-0.5">
                    <span>Illustrative frame reference: 16.6ms</span>
                    <span className="text-emerald-400">
                      Simulated allocation (heap)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 gap-3 pt-1">
                  <button
                    onClick={handleRunGc}
                    disabled={isGarminGcRunning}
                    className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a]"
                  >
                    <IconRefresh
                      className={`w-3.5 h-3.5 ${isGarminGcRunning ? "animate-spin" : ""}`}
                    />
                    <span>
                      {isGarminGcRunning
                        ? "Freeing RAM..."
                        : "Clean Memory (GC)"}
                    </span>
                  </button>

                  <button
                    onClick={resetMemoryDemo}
                    className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-200 border border-white/15 rounded-xl transition-colors hover:bg-white/5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#13151a]"
                  >
                    <IconRefresh className="w-3.5 h-3.5" />
                    <span>Reset Memory Demo</span>
                  </button>

                  <span className="text-[10px] text-zinc-400">
                    ILLUSTRATIVE STATE
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {CONSOLE_MODES.filter((consoleMode) => consoleMode !== mode).map(
          (consoleMode) => (
            <div
              key={consoleMode}
              id={`hero-demo-panel-${consoleMode}`}
              role="tabpanel"
              aria-labelledby={`hero-demo-tab-${consoleMode}`}
              hidden
            />
          )
        )}
      </div>

      {/* Footer Spec strip */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5">
          <IconTerminal className="w-3 h-3 text-zinc-400" />
          <span>ILLUSTRATIVE DEMO</span>
        </span>
        <span className="text-zinc-400">TRY THE CONTROLS · NO LIVE DATA</span>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
};

interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className }) => {
  const shouldReduceMotion = useReducedMotion();
  const headline = "Hi, I’m Fred. I make complicated things usable.";
  const introText =
    "My background is in clinical research. I build software for the fiddly parts: messy data, complicated forms, and rules that need to hold up. I also made a loon shoot lasers. There’s room for both.";

  return (
    <section
      id="hero"
      className={cn(
        "section-isolate relative min-h-[90dvh] lg:min-h-[90dvh] w-full flex flex-col justify-center items-center overflow-hidden bg-[#0d0e11] px-4 sm:px-6 md:px-8 lg:px-12 pt-32 pb-16 sm:pt-36 lg:pt-44 lg:pb-24",
        className
      )}
    >
      {/* 1. Precision Grid Background with Radial Mask */}
      <div className="absolute inset-0 z-0 opacity-25 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_65%,transparent_100%)] pointer-events-none">
        <AnimatedGridPattern
          numSquares={35}
          maxOpacity={0.12}
          duration={5}
          repeatDelay={1}
          className="fill-amber-500/15 stroke-white/10"
        />
      </div>

      {/* 2. Architectural Blueprint Corner Cues (desktop) */}
      <div className="hidden lg:flex absolute top-28 left-12 items-center gap-2 text-[10px] font-mono text-zinc-600 select-none">
        <span className="text-amber-500/60">[+]</span>
        <span>CLINICAL DATA / SOFTWARE / SIDE QUESTS</span>
      </div>
      <div className="hidden lg:flex absolute top-28 right-12 items-center gap-2 text-[10px] font-mono text-zinc-600 select-none">
        <span>LOC: ROCHESTER &amp; NYC</span>
        <span className="text-amber-500/60">[+]</span>
      </div>

      {/* 3. Hero Split Grid Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
        {/* Left Column: Editorial Statement & Actions */}
        <div className="lg:col-span-7 min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Micro Brand Identifier */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-5 sm:mb-6 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>FREDERICK DE RUITER / SOFTWARE &amp; SYSTEMS</span>
          </motion.div>

          {/* Dynamic Staggered Pretext-powered Title */}
          <HeroHeadline text={headline} />

          {/* Dynamic Pretext-powered Description */}
          <HeroText text={introText} />

          {/* CTA Action Group */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion
                ? { delay: 0.1, duration: 0.4 }
                : {
                    delay: 0.5,
                    duration: 0.6,
                    ...designManifest.motion.springs.smooth,
                  }
            }
            className="w-full flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-2"
          >
            {/* Primary Action */}
            <a
              href="#case-studies"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e11]"
            >
              <span>Explore My Work</span>
              <IconArrowRight className="w-4 h-4" />
            </a>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:flex-row sm:gap-3">
              <Link
                href="/arcade"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 text-xs font-mono font-semibold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e11]"
              >
                <IconDeviceGamepad2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Arcade &amp; Labs</span>
              </Link>
              <a
                href="https://github.com/fderuiter"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 text-xs font-mono font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e11]"
              >
                <IconBrandGithub className="w-4 h-4 shrink-0" />
                <span className="truncate">GitHub</span>
              </a>
            </div>
          </motion.div>

          {/* Micro Invariant Telemetry Badges */}
          <div className="mt-8 pt-6 border-t border-white/5 w-full flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[10px] font-mono text-zinc-400 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>TRY THE DEMOS</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>CLINICAL OPERATIONS EXPERIENCE</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SOURCE ON GITHUB</span>
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Live Engineering Console */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { delay: 0.1, duration: 0.4 }
              : {
                  delay: 0.4,
                  duration: 0.7,
                  ...designManifest.motion.springs.smooth,
                }
          }
          className="lg:col-span-5 min-w-0 w-full flex justify-center"
        >
          <InteractiveEngineeringConsole />
        </motion.div>
      </div>
    </section>
  );
};
