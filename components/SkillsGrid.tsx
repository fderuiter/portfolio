"use client";

import React from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAudio } from "@/components/providers/AudioProvider";

export interface SkillLanguage {
  name: string;
  percentage: number;
}

interface SkillsGridProps {
  languages: SkillLanguage[];
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({ languages }) => {
  const { playSkillHover } = useAudio();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto select-none">
      {/* 1. Professional Bio Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onMouseEnter={playSkillHover}
        className="md:col-span-2 p-6 md:p-8 bg-zinc-900/10 border border-zinc-900/50 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[250px] hover:border-zinc-800 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-4 mb-5">
            {/* FDR Initials Badge */}
            <div
              style={{ "--skill-glow": `0 0 15px ${hexToRgba(designManifest.colors["brand-cyan"], 0.05)}` } as React.CSSProperties}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-cyan/15 to-brand-blue/15 border border-brand-cyan/20 flex items-center justify-center font-mono font-black text-sm tracking-wider text-brand-cyan shadow-[var(--skill-glow)]"
            >
              FDR
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold tracking-widest text-brand-cyan uppercase">
                Systems Engineer &amp; Clinical Data Architect
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">
                Clinical Data Architecture • Interactive Graphics • Open Source
              </p>
            </div>
          </div>
          
          <p className="text-sm text-neutral-300 leading-relaxed font-sans font-medium">
            I engineer software that bridges high-compliance healthcare data architecture (GxP eCRF systems, CDISC data pipelines, neuroinformatics tooling) with high-performance frontend engineering, native canvas physics engines, and open-source civic initiatives. I focus on building resilient, maintainable software with high craft and thoughtful interface design.
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
        className="p-6 bg-zinc-900/10 border border-zinc-900/50 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[250px] hover:border-zinc-800 transition-all duration-300"
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-[50px] pointer-events-none" />
        
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase mb-4">
            Codebase Distribution
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 mb-6 leading-relaxed">
            Primary languages and technologies aggregated across active repositories.
          </p>
          
          <div className="space-y-4">
            {languages.map((lang, idx) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="font-semibold text-neutral-300">{lang.name}</span>
                  <span className="text-brand-cyan">{lang.percentage}%</span>
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${lang.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full"
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
        className="md:col-span-3 p-6 md:p-8 bg-zinc-900/5 border border-zinc-900/40 rounded-3xl relative overflow-hidden hover:border-zinc-900 transition-all duration-300"
      >
        <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase mb-6 text-center md:text-left">
          Technical Domains
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
              01
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip text="Translating complex 150-page protocols into validated eCRFs, automated edit checks, and FDA-compliant SDTM datasets.">
                Clinical Data Architecture
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Translating FDA regulations and complex clinical trial protocols into resilient, type-safe data schemas.
            </p>
          </div>
          
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-900/30 flex items-center justify-center font-mono font-bold text-xs text-brand-cyan">
              02
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip text="Crafting 60FPS canvas simulations, raycasting engines, and interactive formal verification tools.">
                Interactive Graphics &amp; Canvas Physics
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Building 60FPS browser physics, laser raycasting engines, and retro roguelikes with zero framework overhead.
            </p>
          </div>
          
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-blue-950/20 border border-blue-900/30 flex items-center justify-center font-mono font-bold text-xs text-brand-blue">
              03
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip text="Laser Loon CC0 viral campaign ($13.5k library fundraiser, NYT/WaPo coverage) and grassroots tech advocacy.">
                Civic Technology &amp; Public Projects
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Authoring open-source CC0 design assets raising $13.5k+ for community libraries, alongside civic software advocacy.
            </p>
          </div>
          
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-purple-950/20 border border-purple-900/30 flex items-center justify-center font-mono font-bold text-xs text-purple-400">
              04
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip text="Credentialed Alpine Ski Patroller (OEC/OET certified) performing rapid triage in high-stakes environments.">
                Emergency Triage &amp; Reliability
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Applying rapid triage decision models from alpine emergency medicine to build bulletproof, fault-tolerant architectures.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
