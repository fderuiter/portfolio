"use client";

import React from "react";
import Link from "next/link";
import { usePersona } from "@/components/providers/PersonaProvider";
import { IconDeviceGamepad2, IconArrowRight } from "@tabler/icons-react";

export const InteractiveHighlights: React.FC = () => {
  const { persona } = usePersona();

  if (persona === "technical") {
    return null;
  }

  return (
    <div className="w-full mb-6 sm:mb-8 p-5 sm:p-7 bg-[#13151a]/90 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 backdrop-blur-md shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2.5 rounded text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 uppercase">
            <span>LABS // ACTIVE SPEC</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 flex items-center gap-2.5">
            <IconDeviceGamepad2 className="w-5 h-5 text-amber-400 shrink-0" />
            Interactive Canvas &amp; Game Labs
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl font-sans">
            Bespoke canvas physics, weird retro simulations, and logic puzzles built without bloated game engines.
          </p>
        </div>
        <Link
          href="/arcade"
          className="w-full sm:w-auto self-start sm:self-center shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-amber-400 text-black font-mono text-xs font-bold rounded-xl hover:bg-amber-300 transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98]"
        >
          <span>Explore Labs Hub</span>
          <IconArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
};
