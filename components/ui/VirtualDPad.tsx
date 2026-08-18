"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/components/providers/AudioProvider";
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  sharedInputBridge,
  VirtualInputDirection,
  isolateTouchGestures,
} from "@/lib/virtual-input-bridge";

export interface VirtualDPadProps {
  onDirectionPress?: (direction: VirtualInputDirection) => void;
  onDirectionRelease?: (direction: VirtualInputDirection) => void;
  onActionAPress?: () => void;
  onActionARelease?: () => void;
  onActionBPress?: () => void;
  onActionBRelease?: () => void;
  actionALabel?: string;
  actionBLabel?: string;
  actionASubtitle?: string;
  actionBSubtitle?: string;
  className?: string;
}

export const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirectionPress,
  onDirectionRelease,
  onActionAPress,
  onActionARelease,
  onActionBPress,
  onActionBRelease,
  actionALabel = "ACTION",
  actionBLabel = "SWAP",
  actionASubtitle = "SPACE",
  actionBSubtitle = "E",
  className,
}) => {
  const { playNote } = useAudio();
  const activeTouchesRef = useRef<Map<string, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = isolateTouchGestures(containerRef.current);
    return () => cleanup();
  }, []);

  const handlePressDir = useCallback(
    (dir: VirtualInputDirection, e: React.SyntheticEvent) => {
      if (e.cancelable) e.preventDefault();
      sharedInputBridge.emitDirectionPress(dir);
      onDirectionPress?.(dir);
      activeTouchesRef.current.set(dir, Date.now());
    },
    [onDirectionPress]
  );

  const handleReleaseDir = useCallback(
    (dir: VirtualInputDirection, e: React.SyntheticEvent) => {
      if (e.cancelable) e.preventDefault();
      sharedInputBridge.emitDirectionRelease(dir);
      onDirectionRelease?.(dir);
      activeTouchesRef.current.delete(dir);
    },
    [onDirectionRelease]
  );

  const handlePressAct = useCallback(
    (actionId: string, actionCb: (() => void) | undefined, e: React.SyntheticEvent) => {
      if (e.cancelable) e.preventDefault();
      sharedInputBridge.emitActionPress(actionId);
      playNote(880, 0.02);
      actionCb?.();
      activeTouchesRef.current.set(actionId, Date.now());
    },
    [playNote]
  );

  const handleReleaseAct = useCallback(
    (actionId: string, releaseCb: (() => void) | undefined, e: React.SyntheticEvent) => {
      if (e.cancelable) e.preventDefault();
      sharedInputBridge.emitActionRelease(actionId);
      releaseCb?.();
      activeTouchesRef.current.delete(actionId);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Virtual Game Controller"
      className={cn(
        "w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl select-none touch-none",
        className
      )}
      style={{ touchAction: "none" }}
    >
      {/* 4-Way Directional Pad */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Cross center backing */}
        <div className="absolute w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800/60 pointer-events-none" />

        {/* Up Button */}
        <button
          type="button"
          aria-label="Move Up"
          onTouchStart={(e) => handlePressDir("up", e)}
          onTouchEnd={(e) => handleReleaseDir("up", e)}
          onTouchCancel={(e) => handleReleaseDir("up", e)}
          onMouseDown={(e) => handlePressDir("up", e)}
          onMouseUp={(e) => handleReleaseDir("up", e)}
          onPointerDown={(e) => handlePressDir("up", e)}
          onPointerUp={(e) => handleReleaseDir("up", e)}
          onPointerCancel={(e) => handleReleaseDir("up", e)}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 min-w-[44px] min-h-[44px] rounded-t-xl bg-zinc-900/90 border-t border-x border-zinc-700/80 active:bg-brand-cyan/20 active:border-brand-cyan active:text-brand-cyan text-zinc-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
        >
          <IconChevronUp className="w-6 h-6 pointer-events-none" />
        </button>

        {/* Down Button */}
        <button
          type="button"
          aria-label="Move Down"
          onTouchStart={(e) => handlePressDir("down", e)}
          onTouchEnd={(e) => handleReleaseDir("down", e)}
          onTouchCancel={(e) => handleReleaseDir("down", e)}
          onMouseDown={(e) => handlePressDir("down", e)}
          onMouseUp={(e) => handleReleaseDir("down", e)}
          onPointerDown={(e) => handlePressDir("down", e)}
          onPointerUp={(e) => handleReleaseDir("down", e)}
          onPointerCancel={(e) => handleReleaseDir("down", e)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 min-w-[44px] min-h-[44px] rounded-b-xl bg-zinc-900/90 border-b border-x border-zinc-700/80 active:bg-brand-cyan/20 active:border-brand-cyan active:text-brand-cyan text-zinc-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
        >
          <IconChevronDown className="w-6 h-6 pointer-events-none" />
        </button>

        {/* Left Button */}
        <button
          type="button"
          aria-label="Move Left"
          onTouchStart={(e) => handlePressDir("left", e)}
          onTouchEnd={(e) => handleReleaseDir("left", e)}
          onTouchCancel={(e) => handleReleaseDir("left", e)}
          onMouseDown={(e) => handlePressDir("left", e)}
          onMouseUp={(e) => handleReleaseDir("left", e)}
          onPointerDown={(e) => handlePressDir("left", e)}
          onPointerUp={(e) => handleReleaseDir("left", e)}
          onPointerCancel={(e) => handleReleaseDir("left", e)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 min-w-[44px] min-h-[44px] rounded-l-xl bg-zinc-900/90 border-l border-y border-zinc-700/80 active:bg-brand-cyan/20 active:border-brand-cyan active:text-brand-cyan text-zinc-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
        >
          <IconChevronLeft className="w-6 h-6 pointer-events-none" />
        </button>

        {/* Right Button */}
        <button
          type="button"
          aria-label="Move Right"
          onTouchStart={(e) => handlePressDir("right", e)}
          onTouchEnd={(e) => handleReleaseDir("right", e)}
          onTouchCancel={(e) => handleReleaseDir("right", e)}
          onMouseDown={(e) => handlePressDir("right", e)}
          onMouseUp={(e) => handleReleaseDir("right", e)}
          onPointerDown={(e) => handlePressDir("right", e)}
          onPointerUp={(e) => handleReleaseDir("right", e)}
          onPointerCancel={(e) => handleReleaseDir("right", e)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 min-w-[44px] min-h-[44px] rounded-r-xl bg-zinc-900/90 border-r border-y border-zinc-700/80 active:bg-brand-cyan/20 active:border-brand-cyan active:text-brand-cyan text-zinc-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
        >
          <IconChevronRight className="w-6 h-6 pointer-events-none" />
        </button>
      </div>

      {/* Action Buttons Cluster */}
      <div className="flex items-center gap-3">
        {onActionBPress && (
          <button
            type="button"
            aria-label={actionBLabel}
            onTouchStart={(e) => handlePressAct("actionB", onActionBPress, e)}
            onTouchEnd={(e) => handleReleaseAct("actionB", onActionBRelease, e)}
            onTouchCancel={(e) => handleReleaseAct("actionB", onActionBRelease, e)}
            onMouseDown={(e) => handlePressAct("actionB", onActionBPress, e)}
            onMouseUp={(e) => handleReleaseAct("actionB", onActionBRelease, e)}
            onPointerDown={(e) => handlePressAct("actionB", onActionBPress, e)}
            onPointerUp={(e) => handleReleaseAct("actionB", onActionBRelease, e)}
            onPointerCancel={(e) => handleReleaseAct("actionB", onActionBRelease, e)}
            className="w-16 h-16 min-w-[44px] min-h-[44px] rounded-2xl bg-zinc-900/90 border border-zinc-700/80 active:bg-purple-500/20 active:border-purple-400 active:text-purple-300 text-zinc-300 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span className="text-[11px] font-mono font-black tracking-wider pointer-events-none">
              {actionBLabel}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 pointer-events-none">
              {actionBSubtitle}
            </span>
          </button>
        )}

        {onActionAPress && (
          <button
            type="button"
            aria-label={actionALabel}
            onTouchStart={(e) => handlePressAct("actionA", onActionAPress, e)}
            onTouchEnd={(e) => handleReleaseAct("actionA", onActionARelease, e)}
            onTouchCancel={(e) => handleReleaseAct("actionA", onActionARelease, e)}
            onMouseDown={(e) => handlePressAct("actionA", onActionAPress, e)}
            onMouseUp={(e) => handleReleaseAct("actionA", onActionARelease, e)}
            onPointerDown={(e) => handlePressAct("actionA", onActionAPress, e)}
            onPointerUp={(e) => handleReleaseAct("actionA", onActionARelease, e)}
            onPointerCancel={(e) => handleReleaseAct("actionA", onActionARelease, e)}
            className="w-18 h-18 min-w-[44px] min-h-[44px] rounded-2xl bg-brand-cyan/15 border-2 border-brand-cyan/60 active:bg-brand-cyan/30 active:border-brand-cyan active:scale-95 text-brand-cyan flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <span className="text-xs font-mono font-black tracking-wider pointer-events-none">
              {actionALabel}
            </span>
            <span className="text-[9px] font-mono text-brand-cyan/70 pointer-events-none">
              {actionASubtitle}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
