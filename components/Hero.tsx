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
  IconAtom
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

/**
 * Lightweight Background Beams fallback preserved for backwards compatibility.
 */
export const BackgroundBeamsWithCollision: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("min-h-[100dvh] bg-[#0d0e11] relative flex items-center w-full justify-center overflow-hidden", className)}>
      {children}
    </div>
  );
};

interface HeroHeadlineProps {
  text: string;
}

export const HeroHeadline: React.FC<HeroHeadlineProps> = ({ text }) => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = React.useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
  const { ref, height, isReady } = usePretextLayout({
    text,
    fontSize: 54,
    lineHeight: 58,
    fontFamilyVariable: "--font-inter",
    getResponsiveMetrics: (width) => {
      if (width < 640) {
        return { fontSize: 32, lineHeight: 38 };
      } else if (width < 1024) {
        return { fontSize: 44, lineHeight: 50 };
      }
      return { fontSize: 54, lineHeight: 58 };
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

  const wordVariants = shouldReduceMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } : {
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
      style={{
        height: isReady ? `${height}px` : "auto",
        transition: "height 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="relative w-full max-w-4xl mx-auto lg:mx-0 overflow-hidden min-h-[90px] sm:min-h-[110px] mb-4 sm:mb-6"
    >
      {/* 1. Custom Visual Presentation (hidden from screen readers, not selectable) */}
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        className="w-full select-none pointer-events-none"
      >
        {!isReady ? (
          <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-left opacity-0 leading-tight">
            {text}
          </p>
        ) : isMobile ? (
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center lg:text-left leading-tight text-white heading-editorial"
          >
            {text}
          </motion.p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-center lg:text-left flex flex-wrap justify-center lg:justify-start leading-tight heading-editorial"
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
        className="text-4xl md:text-6xl font-black tracking-tight text-center leading-tight md:leading-none absolute inset-0 select-text bg-transparent"
        style={{
          color: "transparent",
          WebkitTextFillColor: "transparent",
          pointerEvents: "auto",
          margin: 0,
          padding: 0,
        }}
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
  const isMobile = React.useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
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

  const wordVariants = shouldReduceMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } : {
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
      style={{
        height: isReady ? `${height}px` : "auto",
        transition: "height 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="relative w-full max-w-2xl mx-auto lg:mx-0 overflow-hidden min-h-[50px] mb-6 sm:mb-8"
    >
      {/* 1. Custom Visual Presentation (hidden from screen readers, not selectable) */}
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        className="w-full select-none pointer-events-none"
      >
        {!isReady ? (
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed text-center lg:text-left opacity-0">
            {text}
          </p>
        ) : isMobile ? (
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
            className="text-zinc-300 text-sm md:text-base leading-relaxed text-center lg:text-left"
          >
            {text}
          </motion.p>
        ) : (
          <motion.p
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-zinc-300 text-sm md:text-base leading-relaxed text-center lg:text-left flex flex-wrap justify-center lg:justify-start"
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
        className="text-neutral-400 text-sm md:text-base leading-[28px] text-center absolute inset-0 select-text bg-transparent"
        style={{
          color: "transparent",
          WebkitTextFillColor: "transparent",
          pointerEvents: "auto",
          margin: 0,
          padding: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
};

type ConsoleMode = "logic" | "cdisc" | "garmin";

/**
 * Interactive Live Engineering Console / Telemetry Spec Card
 */
export const InteractiveEngineeringConsole: React.FC = () => {
  const [mode, setMode] = useState<ConsoleMode>("logic");
  const { playSkillHover, playSuccess } = useAudio();
  const [logicDischarged, setLogicDischarged] = useState(false);
  const [fhirValidationActive, setFhirValidationActive] = useState(true);
  const [garminHeapAlloc, setGarminHeapAlloc] = useState(18.4);
  const [isGarminGcRunning, setIsGarminGcRunning] = useState(false);

  const handleDischargeStep = () => {
    setLogicDischarged((prev) => !prev);
    if (!logicDischarged) {
      playSuccess();
    } else {
      playSkillHover();
    }
  };

  const handleRunGc = () => {
    setIsGarminGcRunning(true);
    playSkillHover();
    setTimeout(() => {
      setGarminHeapAlloc((prev) => (prev > 14 ? 12.2 : 19.6));
      setIsGarminGcRunning(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-xl mx-auto lg:max-w-none bg-[#13151a]/90 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-amber-500/30">
      {/* Precision grid decorative corner cues */}
      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-wider select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>SYS.RUNTIME // ONLINE</span>
      </div>

      <div>
        {/* Header Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-4 pb-3 border-b border-white/10 overflow-x-auto scrollbar-none" role="tablist" aria-label="Engineering System Demos">
          <button
            role="tab"
            aria-selected={mode === "logic"}
            onClick={() => { setMode("logic"); playSkillHover(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              mode === "logic"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <IconAtom className="w-3.5 h-3.5" />
            <span>01. Proof AST</span>
          </button>

          <button
            role="tab"
            aria-selected={mode === "cdisc"}
            onClick={() => { setMode("cdisc"); playSkillHover(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              mode === "cdisc"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <IconShieldCheck className="w-3.5 h-3.5" />
            <span>02. 21 CFR Part 11</span>
          </button>

          <button
            role="tab"
            aria-selected={mode === "garmin"}
            onClick={() => { setMode("garmin"); playSkillHover(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              mode === "garmin"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <IconCpu className="w-3.5 h-3.5" />
            <span>03. 32KB Monkey C</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[190px] flex flex-col justify-between font-mono">
          <AnimatePresence mode="wait">
            {mode === "logic" && (
              <motion.div
                key="logic"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>DEDUCTIVE THEOREM ENGINE</span>
                  <span className="text-amber-400 font-semibold">RULE: MODUS PONENS</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">1. Premise:</span>
                    <span className="text-amber-300 font-semibold">P → Q (Valid Input → Sound System)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">2. Premise:</span>
                    <span className="text-amber-300 font-semibold">P (Input Validated)</span>
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-white/10 flex items-center justify-between">
                    <span className="text-zinc-400">3. Resolution:</span>
                    <span className={logicDischarged ? "text-emerald-400 font-bold" : "text-zinc-500 italic"}>
                      {logicDischarged ? "Q ⊢ Sound System State (Q.E.D.)" : "[Pending Discharge...]"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={handleDischargeStep}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <IconRefresh className={`w-3.5 h-3.5 ${logicDischarged ? "rotate-180" : ""} transition-transform duration-300`} />
                    <span>{logicDischarged ? "Reset Inference" : "Discharge Invariant"}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${logicDischarged ? "bg-emerald-400" : "bg-amber-400"} transition-colors`} />
                    <span className="text-zinc-400">{logicDischarged ? "STATUS: 100% SOUND" : "STATUS: READY"}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {mode === "cdisc" && (
              <motion.div
                key="cdisc"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>STUDY: MAYO-ONC-04</span>
                  <span className="text-emerald-400 font-semibold">CDASH DM / 21 CFR 11</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Variable:</span>
                    <span className="text-white font-mono">AGE (Demographics)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">NCI Concept:</span>
                    <span className="text-amber-300">C66742 [Controlled Term]</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Audit Digest:</span>
                    <span className="text-zinc-400 truncate max-w-[200px]">SHA256: 8f9b...3c12 (Signed)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => { setFhirValidationActive(!fhirValidationActive); playSkillHover(); }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>{fhirValidationActive ? "FDA / PMDA Conformance: ACTIVE" : "Toggle Conformance"}</span>
                  </button>

                  <span className="text-[10px] text-zinc-400">ZERO DATA LOSS</span>
                </div>
              </motion.div>
            )}

            {mode === "garmin" && (
              <motion.div
                key="garmin"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>GARMIN MONKEY C RUNTIME</span>
                  <span className="text-cyan-400 font-semibold">32KB MEMORY BUDGET</span>
                </div>

                <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Heap Allocated:</span>
                    <span className="text-amber-300 font-bold">{garminHeapAlloc.toFixed(1)} KB / 32.0 KB ({Math.round((garminHeapAlloc / 32) * 100)}%)</span>
                  </div>
                  {/* Visual memory bar */}
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      style={{ width: `${(garminHeapAlloc / 32) * 100}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-cyan-400 transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                    <span>Frame Budget: 16.6ms</span>
                    <span className="text-emerald-400">60 FPS Target Locked</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={handleRunGc}
                    disabled={isGarminGcRunning}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  >
                    <IconRefresh className={`w-3.5 h-3.5 ${isGarminGcRunning ? "animate-spin" : ""}`} />
                    <span>{isGarminGcRunning ? "Sweeping Heap..." : "Trigger GC Sweep"}</span>
                  </button>

                  <span className="text-[10px] text-zinc-400">HEAP DETERMINISTIC</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Spec strip */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span className="flex items-center gap-1.5">
          <IconTerminal className="w-3 h-3 text-zinc-400" />
          <span>ZERO RUNTIME BLOCKING</span>
        </span>
        <span className="text-zinc-400">LATENCY: &lt; 0.2ms</span>
      </div>
    </div>
  );
};

interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className }) => {
  const shouldReduceMotion = useReducedMotion();
  const headline = "High-assurance systems, clinical architectures & creative engines.";
  const introText = "Clinical operations background at Mayo Clinic combined with high-assurance data systems, formal deductive logic engines, and bespoke canvas physics.";

  return (
    <section
      id="hero"
      className={cn(
        "relative min-h-[90dvh] lg:min-h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden bg-[#0d0e11] px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-16 lg:py-24",
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
      <div className="hidden lg:flex absolute top-24 left-12 items-center gap-2 text-[10px] font-mono text-zinc-600 select-none">
        <span className="text-amber-500/60">[+]</span>
        <span>SYS.SPEC // MONOGRAPH 2026</span>
      </div>
      <div className="hidden lg:flex absolute top-24 right-12 items-center gap-2 text-[10px] font-mono text-zinc-600 select-none">
        <span>LOC: ROCHESTER &amp; NYC</span>
        <span className="text-amber-500/60">[+]</span>
      </div>

      {/* 3. Hero Split Grid Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Statement & Actions */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Micro Brand Identifier */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-5 sm:mb-6 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>FREDERICK DE RUITER · SYSTEMS ARCHITECT</span>
          </motion.div>

          {/* Dynamic Staggered Pretext-powered Title */}
          <HeroHeadline text={headline} />

          {/* Dynamic Pretext-powered Description */}
          <HeroText text={introText} />

          {/* CTA Action Group */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { delay: 0.1, duration: 0.4 } : { delay: 0.5, duration: 0.6, ...designManifest.motion.springs.smooth }}
            className="w-full flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-2"
          >
            {/* Primary Action */}
            <a
              href="#case-studies"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs sm:text-sm font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <span>Inspect Systems Dossiers</span>
              <IconArrowRight className="w-4 h-4" />
            </a>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:flex-row sm:gap-3">
              <Link
                href="/arcade"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 text-xs font-mono font-semibold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <IconDeviceGamepad2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Labs Hub</span>
              </Link>

              <a
                href="https://github.com/fderuiter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 text-xs font-mono font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
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
              <span>3 FORMAL PROOF ENGINES</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>21 CFR PART 11 VALIDATED</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>100% TYPE-SAFE CONTRACTS</span>
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Live Engineering Console */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { delay: 0.1, duration: 0.4 } : { delay: 0.4, duration: 0.7, ...designManifest.motion.springs.smooth }}
          className="lg:col-span-5 w-full flex justify-center"
        >
          <InteractiveEngineeringConsole />
        </motion.div>
      </div>
    </section>
  );
};
