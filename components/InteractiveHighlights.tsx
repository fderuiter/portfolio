"use client";

import React from "react";
import Link from "next/link";
import { usePersona } from "@/components/providers/PersonaProvider";
import { IconCpu, IconArrowRight } from "@tabler/icons-react";

export const InteractiveHighlights: React.FC = () => {
  const { persona } = usePersona();

  if (persona === "technical") {
    return null;
  }

  return (
    <div className="w-full mb-6 sm:mb-8 p-5 sm:p-8 tool-shell relative overflow-hidden group hover:border-brand-cyan/40 transition-colors">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-brand-cyan/10 transition-colors" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-xl font-bold font-mono text-white mb-2 flex items-center gap-2.5">
            <IconCpu className="w-4 h-4 text-brand-cyan shrink-0" />
            Interactive Canvas &amp; Game Labs
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl font-sans">
            Bespoke canvas physics, weird retro simulations, and logic puzzles built without bloated game engines.
          </p>
        </div>
        <Link
          href="/arcade"
          className="w-full sm:w-auto self-start sm:self-center shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-brand-cyan text-black font-mono text-xs font-bold rounded-xl hover:bg-white transition-all shadow-sm cursor-pointer active:scale-[0.98]"
        >
          <span>Explore Labs Hub</span>
          <IconArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
};
