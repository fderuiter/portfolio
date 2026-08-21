"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { IconHelp, IconBook2 } from "@tabler/icons-react";
import { GAME_MANUALS } from "@/lib/game-manuals";
import { FieldManualModal } from "@/components/FieldManualModal";
import { useAudio } from "@/components/providers/AudioProvider";

interface FieldManualButtonProps {
  manualId: string;
  className?: string;
  variant?: "header" | "card" | "inline";
  label?: string;
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function FieldManualButton({
  manualId,
  className = "",
  variant = "header",
  label = "Field Manual",
}: FieldManualButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { playHover } = useAudio();

  const manual = GAME_MANUALS[manualId];

  // Client-safe localStorage read with useSyncExternalStore
  const hasSeenGuide = useSyncExternalStore(
    subscribeStorage,
    () => {
      if (typeof window === "undefined" || !manualId) return true;
      try {
        return localStorage.getItem(`seen_manual_${manualId}`) === "true";
      } catch {
        return true;
      }
    },
    () => true
  );

  // Global hotkey listener ('?' or 'h' / 'H')
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, contentEditable, or within a keyboard boundary zone
      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest?.("[data-keyboard-boundary]")
      ) {
        return;
      }

      if (e.key === "?" || (e.key === "h" && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(true);
    try {
      localStorage.setItem(`seen_manual_${manualId}`, "true");
      window.dispatchEvent(new Event("storage"));
    } catch {}
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!manual) return null;

  if (variant === "card") {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => playHover()}
          aria-label={`Open Field Manual for ${manual.title}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-zinc-400 hover:text-cyan-300 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 transition-colors cursor-pointer ${className}`}
        >
          <IconHelp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Manual</span>
        </button>

        <FieldManualModal isOpen={isOpen} onClose={handleClose} manual={manual} />
      </>
    );
  }

  if (variant === "inline") {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => playHover()}
          aria-label={`Open Field Manual for ${manual.title}`}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 border border-zinc-800 hover:border-cyan-500/30 transition-colors cursor-pointer ${className}`}
        >
          <IconBook2 className="w-4 h-4 text-cyan-400" />
          <span>{label}</span>
          <kbd className="text-[10px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
            ?
          </kbd>
        </button>

        <FieldManualModal isOpen={isOpen} onClose={handleClose} manual={manual} />
      </>
    );
  }

  // Header default variant
  return (
    <>
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => playHover()}
          aria-label={`Open Field Manual for ${manual.title}`}
          className={`group flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-colors border cursor-pointer ${
            !hasSeenGuide
              ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10 animate-pulse"
              : "bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 hover:text-cyan-300 border-zinc-800 hover:border-cyan-500/40"
          } ${className}`}
        >
          <IconHelp className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>{label}</span>
          <kbd className="hidden sm:inline-block text-[10px] text-zinc-500 group-hover:text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
            ?
          </kbd>
        </button>

        {!hasSeenGuide && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        )}
      </div>

      <FieldManualModal isOpen={isOpen} onClose={handleClose} manual={manual} />
    </>
  );
}
