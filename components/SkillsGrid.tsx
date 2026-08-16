"use client";

import React from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { motion, useReducedMotion } from "framer-motion";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTerminology } from "@/components/providers/TerminologyProvider";
import { dictionary } from "@/lib/i18n-dictionary";

export interface SkillLanguage {
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

  const dict = simplified ? dictionary.simplified : dictionary.detailed;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto select-none">
      {/* 1. Professional Bio Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onMouseEnter={playSkillHover}
        className="md:col-span-2 p-5 sm:p-6 md:p-8 bg-zinc-900/10 border border-zinc-900/50 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[250px] hover:border-zinc-800 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3.5 sm:gap-4 mb-4 sm:mb-5">
            {/* FDR Initials Badge */}
            <div
              style={{ "--skill-glow": `0 0 15px ${hexToRgba(designManifest.colors["brand-cyan"], 0.05)}` } as React.CSSProperties}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-cyan/15 to-brand-blue/15 border border-brand-cyan/20 flex items-center justify-center font-mono font-black text-xs sm:text-sm tracking-wider text-brand-cyan shadow-[var(--skill-glow)] shrink-0"
            >
              FDR
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-brand-cyan uppercase truncate">
                {dict.bio.title}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 truncate">
                {dict.bio.subtitle}
              </p>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans font-medium">
            {dict.bio.description}
          </p>
        </div>
      </motion.div>

      {/* 2. Dynamic Telemetry Languages Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        onMouseEnter={playSkillHover}
        className="p-5 sm:p-6 bg-zinc-900/10 border border-zinc-900/50 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[250px] hover:border-zinc-800 transition-all duration-300"
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-[50px] pointer-events-none" />
        
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase mb-3 sm:mb-4">
            Codebase Distribution
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 mb-4 sm:mb-6 leading-relaxed">
            Primary languages and technologies aggregated across active repositories.
          </p>
          
          <div className="space-y-3.5 sm:space-y-4">
            {languages.map((lang, idx) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-semibold text-neutral-300">{lang.name}</span>
                  <span className="text-brand-cyan">{lang.percentage}%</span>
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 1, delay: idx * 0.1 }}
                    style={{
                      width: `${lang.percentage}%`,
                      originX: 0,
                    }}
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full transform-gpu will-change-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* 3. Core Architectural Pillars Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onMouseEnter={playSkillHover}
        className="md:col-span-3 p-5 sm:p-6 md:p-8 bg-zinc-900/5 border border-zinc-900/40 rounded-3xl relative overflow-hidden hover:border-zinc-900 transition-all duration-300"
      >
        <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase mb-5 sm:mb-6 text-center md:text-left">
          {dict.domains.title}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {dict.domains.items.map((item, idx) => {
            const colors = [
              { bg: "bg-emerald-950/20", border: "border-emerald-900/30", text: "text-emerald-400" },
              { bg: "bg-cyan-950/20", border: "border-cyan-900/30", text: "text-brand-cyan" },
              { bg: "bg-blue-950/20", border: "border-blue-900/30", text: "text-brand-blue" },
              { bg: "bg-purple-950/20", border: "border-purple-900/30", text: "text-purple-400" }
            ];
            const color = colors[idx] || colors[0];
            return (
              <div key={item.id} className="space-y-2 p-3.5 sm:p-0 rounded-2xl bg-zinc-900/30 sm:bg-transparent border border-zinc-800/40 sm:border-transparent transition-colors" onMouseEnter={playSkillHover}>
                <div className="flex items-center gap-2.5 sm:block sm:space-y-2">
                  <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.border} flex items-center justify-center font-mono font-bold text-xs ${color.text} shrink-0`}>
                    {item.id}
                  </div>
                  <h4 className="text-xs font-mono font-bold text-neutral-200">
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
    </div>
  );
};
