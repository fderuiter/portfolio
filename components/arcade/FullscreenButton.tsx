"use client";

import React from "react";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";

export interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
  variant?: "header" | "floating";
  className?: string;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  isFullscreen,
  onToggle,
  variant = "header",
  className = "",
}) => {
  if (variant === "floating") {
    if (!isFullscreen) return null;
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Exit Fullscreen (Esc or F)"
        title="Exit Fullscreen (Esc or F)"
        className={`absolute top-3 right-3 z-50 p-2.5 rounded-xl bg-black/80 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <IconMinimize className="w-5 h-5 text-amber-400" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
      title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
        isFullscreen
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
          : "bg-neutral-900 hover:bg-neutral-800 text-zinc-300 hover:text-white border border-neutral-800 hover:border-zinc-700"
      } ${className}`}
    >
      {isFullscreen ? (
        <>
          <IconMinimize className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Exit Fullscreen</span>
        </>
      ) : (
        <>
          <IconMaximize className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Fullscreen</span>
        </>
      )}
    </button>
  );
};
