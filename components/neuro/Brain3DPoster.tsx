"use client";

import React from "react";
import { Icon3dCubeSphere, IconClick, IconSparkles, IconWifiOff } from "@tabler/icons-react";

interface Brain3DPosterProps {
  onActivate: () => void;
  surfaceMode?: string;
  isCellular?: boolean;
}

export const Brain3DPoster: React.FC<Brain3DPosterProps> = ({
  onActivate,
  surfaceMode = "pial",
  isCellular = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      className="relative w-full h-[460px] bg-zinc-950 rounded-2xl border border-zinc-800/90 overflow-hidden flex flex-col justify-between p-5 select-none shadow-xl"
      data-testid="brain-3d-poster"
    >
      {/* Background Graphic Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Header Badge & Connection Status */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-zinc-300 uppercase tracking-wider">
            2D Preview Poster
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-amber-400/90 font-mono text-[11px]">
            {isCellular ? "Cellular Bandwidth Guard" : "Mobile Viewport Mode"}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/70 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <IconWifiOff className="w-3.5 h-3.5 text-zinc-500" />
          <span>3D Deferred (LCP &lt; 2500ms)</span>
        </div>
      </div>

      {/* Center 2D Brain Visual Preview & Activation CTA */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center p-4 space-y-4">
        {/* SVG Cortical Preview Graphic */}
        <div className="relative group cursor-pointer" onClick={onActivate}>
          <div className="absolute -inset-4 rounded-full bg-brand-cyan/10 blur-2xl group-hover:bg-brand-cyan/20 transition-all duration-300" />
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-brand-cyan group-hover:scale-105 transition-all shadow-2xl">
            <Icon3dCubeSphere className="w-14 h-14 text-brand-cyan/90 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 z-20 bg-brand-cyan text-zinc-950 p-1.5 rounded-full shadow-lg">
            <IconClick className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base sm:text-lg font-mono font-bold text-white flex items-center justify-center gap-2">
            <span>Interactive 3D Cortical Model</span>
            <IconSparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Heavy WebGL 3D meshes and Three.js canvas engine are deferred on mobile viewports to ensure instant startup speed.
          </p>
        </div>

        {/* Prominent On-Demand Activation Target */}
        <button
          onClick={onActivate}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          data-testid="activate-3d-button"
          aria-label="Tap to activate full WebGL 3D brain model"
          className="group relative flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-cyan via-cyan-400 to-teal-400 text-zinc-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-brand-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Icon3dCubeSphere className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
          <span>Tap to Load 3D WebGL Scene</span>
        </button>
      </div>

      {/* Footer Details */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-500 bg-zinc-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800/80 w-full">
        <span>SURFACE MODE: {surfaceMode.toUpperCase()}</span>
        <span className="text-[11px] text-zinc-400 font-mono">ON-DEMAND DELIVERY</span>
      </div>
    </div>
  );
};
