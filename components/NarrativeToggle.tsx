"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNarrative } from "@/components/providers/NarrativeProvider";
import { IconBriefcase, IconCode } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export const NarrativeToggle: React.FC = () => {
  const { narrativeMode, setNarrativeMode } = useNarrative();

  return (
    <div 
      className="relative flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-full p-1 text-[10px] font-mono font-bold select-none h-8"
      role="radiogroup"
      aria-label="Select narrative mode"
    >
      {/* Recruiter Button */}
      <button
        type="button"
        role="radio"
        aria-checked={narrativeMode === "recruiter"}
        onClick={() => setNarrativeMode("recruiter")}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors duration-200 cursor-pointer z-10 h-6 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400",
          narrativeMode === "recruiter" ? "text-zinc-100 font-bold" : "text-zinc-500 hover:text-zinc-400"
        )}
      >
        <IconBriefcase className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Recruiter</span>
        {/* Visual cue for screen readers if text is hidden */}
        <span className="sr-only sm:not-sr-only">Mode</span>
        {narrativeMode === "recruiter" && (
          <motion.div
            layoutId="narrativeActiveBg"
            className="absolute inset-0 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-md -z-10"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </button>

      {/* Developer Button */}
      <button
        type="button"
        role="radio"
        aria-checked={narrativeMode === "developer"}
        onClick={() => setNarrativeMode("developer")}
        className={cn(
          "relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors duration-200 cursor-pointer z-10 h-6 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400",
          narrativeMode === "developer" ? "text-brand-cyan font-bold" : "text-zinc-500 hover:text-zinc-400"
        )}
      >
        <IconCode className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Developer</span>
        {/* Visual cue for screen readers if text is hidden */}
        <span className="sr-only sm:not-sr-only">Mode</span>
        {narrativeMode === "developer" && (
          <motion.div
            layoutId="narrativeActiveBg"
            className="absolute inset-0 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-md -z-10"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
};
