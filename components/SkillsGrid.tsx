"use client";

import React from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAudio } from "@/components/providers/AudioProvider";
import { skillsData } from "@/components/skillsData";

export interface SkillLanguage {
  name: string;
  percentage: number;
}

interface SkillsGridProps {
  languages: SkillLanguage[];
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({ languages }) => {
  const { playSkillHover } = useAudio();

  const handleHover = (key: string) => {
    const skill = skillsData[key];
    if (!skill) return;

    // Log to standard console
    // eslint-disable-next-line no-console
    console.log(`[SkillsGrid Hover] ${skill.name}: ${skill.tooltipText}`);

    // Dispatch terminal logs via window CustomEvent
    skill.terminalLogs.forEach((log) => {
      window.dispatchEvent(
        new CustomEvent("terminal:add-log", {
          detail: { text: log },
        })
      );
    });
  };

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
          <div className="flex items-center gap-4 mb-6">
            {/* FDR Initials Badge */}
            <div style={{ "--skill-glow": `0 0 15px ${hexToRgba(designManifest.colors["brand-cyan"], 0.05)}` } as React.CSSProperties}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-cyan/15 to-brand-blue/15 border border-brand-cyan/20 flex items-center justify-center font-mono font-black text-sm tracking-wider text-brand-cyan shadow-[var(--skill-glow)]">
              FDR
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold tracking-widest text-brand-cyan uppercase">
                System Architect
              </h3>
              <p className="text-[10px] font-mono text-zinc-500">
                Principal Design Engineer
              </p>
            </div>
          </div>
          
          <p className="text-sm text-neutral-300 leading-relaxed font-sans font-medium">
            I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
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
            Live Telemetry API
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 mb-6 leading-relaxed">
            Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
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
          Core Technical Specializations
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
              01
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip
                text={skillsData["clinical-integrations"].tooltipText}
                onHover={() => handleHover("clinical-integrations")}
              >
                Clinical Integrations
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            </p>
          </div>
          
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-900/30 flex items-center justify-center font-mono font-bold text-xs text-brand-cyan">
              02
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip
                text={skillsData["layout-physics"].tooltipText}
                onHover={() => handleHover("layout-physics")}
              >
                Layout Physics
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            </p>
          </div>
          
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-blue-950/20 border border-blue-900/30 flex items-center justify-center font-mono font-bold text-xs text-brand-blue">
              03
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip
                text={skillsData["serverless-scaling"].tooltipText}
                onHover={() => handleHover("serverless-scaling")}
              >
                Serverless Scaling
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            </p>
          </div>
          
          <div className="space-y-2" onMouseEnter={playSkillHover}>
            <div className="w-8 h-8 rounded-lg bg-purple-950/20 border border-purple-900/30 flex items-center justify-center font-mono font-bold text-xs text-purple-400">
              04
            </div>
            <h4 className="text-xs font-mono font-bold text-neutral-200">
              <Tooltip
                text={skillsData["full-stack-security"].tooltipText}
                onHover={() => handleHover("full-stack-security")}
              >
                Full-Stack Security
              </Tooltip>
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
