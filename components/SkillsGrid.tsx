"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTerminology } from "@/components/providers/TerminologyProvider";
import { dictionary } from "@/lib/i18n-dictionary";

interface SkillLanguage {
  name: string;
  percentage: number;
}

interface SkillsGridProps {
  languages: SkillLanguage[];
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({ languages }) => {
  const { playSkillHover } = useAudio();
  const { simplified } = useTerminology();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Default to full batch level on server for SEO crawler pre-rendering, or level 1 on client
  const [batchLevel, setBatchLevel] = useState<number>(() => {
    return typeof window === "undefined" ? 3 : 1;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame1: number | null = null;

    const runBatchPasses = () => {
      startTransition(() => {
        setBatchLevel(2);
      });
      frame1 = requestAnimationFrame(() => {
        startTransition(() => {
          setBatchLevel(3);
        });
      });
    };

    // Prioritize initial paint with batch level 1, then queue progressive batches off the critical path
    const timerId = setTimeout(() => {
      runBatchPasses();
    }, 0);

    return () => {
      clearTimeout(timerId);
      if (frame1 !== null) cancelAnimationFrame(frame1);
    };
  }, []);

  const dict = simplified ? dictionary.simplified : dictionary.detailed;

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto select-none">
      {/* 1. Professional Bio Card (Batch Pass 1) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onMouseEnter={playSkillHover}
        className="md:col-span-2 p-5 sm:p-6 md:p-8 bg-[#13151a]/80 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[250px] hover:border-amber-500/30 transition-all duration-300 backdrop-blur-md shadow-xl"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3.5 sm:gap-4 mb-4 sm:mb-5">
            {/* FDR Initials Badge */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs sm:text-sm tracking-wider text-amber-300 shadow-sm shrink-0">
              FDR
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-amber-300 uppercase truncate">
                {dict.bio.title}
              </h3>
              <p className="text-[10px] font-mono text-zinc-400 truncate">
                {dict.bio.subtitle}
              </p>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-medium">
            {dict.bio.description}
          </p>
        </div>
      </motion.div>

      {/* 2. Dynamic Telemetry Languages Card (Batch Pass 1) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        onMouseEnter={playSkillHover}
        className="p-5 sm:p-6 bg-[#13151a]/80 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[250px] hover:border-amber-500/30 transition-all duration-300 backdrop-blur-md shadow-xl"
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none" />
        
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase mb-3 sm:mb-4">
            Codebase Distribution
          </h3>
          <p className="text-[10px] font-mono text-zinc-400 mb-4 sm:mb-6 leading-relaxed">
            Primary languages and technologies aggregated across active repositories.
          </p>
          
          <div className="space-y-3.5 sm:space-y-4">
            {languages.map((lang, idx) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-semibold text-zinc-200">{lang.name}</span>
                  <span className="text-amber-300">{lang.percentage}%</span>
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay: idx * 0.08 }}
                    style={{
                      "--skill-width": `${lang.percentage}%`,
                    } as React.CSSProperties}
                    className="h-full w-[var(--skill-width)] bg-gradient-to-r from-amber-400 to-amber-200 rounded-full origin-left transform-gpu will-change-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* 3. Core Architectural Pillars Card (Progressive Batch Pass 2) */}
      {batchLevel >= 2 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-3 p-5 sm:p-6 md:p-8 bg-[#13151a]/80 border border-white/10 rounded-2xl relative overflow-hidden hover:border-white/20 transition-all duration-300 backdrop-blur-md shadow-xl"
        >
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase mb-5 sm:mb-6 text-center md:text-left">
            {dict.domains.title}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {dict.domains.items.map((item, idx) => {
              const colors = [
                { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-300" },
                { bg: "bg-amber-500/10", border: "border-amber-500/25", text: "text-amber-300" },
                { bg: "bg-cyan-500/10", border: "border-cyan-500/25", text: "text-cyan-300" },
                { bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-300" }
              ];
              const color = colors[idx] || colors[0];
              return (
                <div key={item.id} className="space-y-2 p-3.5 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent border border-white/5 sm:border-transparent transition-colors" onMouseEnter={playSkillHover}>
                  <div className="flex items-center gap-2.5 sm:block sm:space-y-2">
                    <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.border} border flex items-center justify-center font-mono font-bold text-xs ${color.text} shrink-0`}>
                      {item.id}
                    </div>
                    <h4 className="text-xs font-mono font-bold text-zinc-200">
                      <Tooltip text={item.tooltip}>
                        {item.title}
                      </Tooltip>
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="md:col-span-3 p-5 sm:p-6 md:p-8 bg-[#13151a]/40 border border-white/5 rounded-2xl shadow-xl animate-pulse min-h-[140px]">
          <div className="h-4 w-40 bg-zinc-800/60 rounded mb-5 sm:mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50" />
                <div className="h-3.5 w-28 bg-zinc-800/50 rounded" />
                <div className="h-3 w-full bg-zinc-800/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
