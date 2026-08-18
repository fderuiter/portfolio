"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconSword,
  IconFlask,
  IconBolt,
} from "@tabler/icons-react";
import {
  sharedInputBridge,
  VirtualInputBridge,
  VirtualInputDirection,
  VirtualInputAction,
  isolateTouchGestures,
} from "@/lib/virtual-input-bridge";

export interface FloatingHUDOverlayProps {
  bridge?: VirtualInputBridge;
  onDirectionPress?: (direction: VirtualInputDirection) => void;
  onDirectionRelease?: (direction: VirtualInputDirection) => void;
  onActionAPress?: () => void;
  onActionARelease?: () => void;
  onActionBPress?: () => void;
  onActionBRelease?: () => void;
  onActionCPress?: () => void;
  onActionCRelease?: () => void;
  actionALabel?: string;
  actionBLabel?: string;
  actionCLabel?: string;
  actionAIcon?: React.ReactNode;
  actionBIcon?: React.ReactNode;
  actionCIcon?: React.ReactNode;
  weaponLabels?: string[];
  selectedWeapon?: number;
  onWeaponSelect?: (index: number) => void;
  forceVisible?: boolean;
  className?: string;
  showDPad?: boolean;
  showActionCluster?: boolean;
}

export const FloatingHUDOverlay: React.FC<FloatingHUDOverlayProps> = ({
  bridge = sharedInputBridge,
  onDirectionPress,
  onDirectionRelease,
  onActionAPress,
  onActionARelease,
  onActionBPress,
  onActionBRelease,
  onActionCPress,
  onActionCRelease,
  actionALabel = "Attack",
  actionBLabel = "Secondary",
  actionCLabel = "Special",
  actionAIcon,
  actionBIcon,
  actionCIcon,
  weaponLabels,
  selectedWeapon,
  onWeaponSelect,
  forceVisible = false,
  className = "",
  showDPad = true,
  showActionCluster = true,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTouch = () => {
      if (typeof window === "undefined") return;
      const hasMatchMedia = typeof window.matchMedia === "function";
      const hasTouch =
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
        (hasMatchMedia && window.matchMedia("(pointer: coarse)").matches);
      setIsTouchDevice(hasTouch);
    };

    checkTouch();
    const handleTouchStart = () => setIsTouchDevice(true);
    window.addEventListener("touchstart", handleTouchStart, { once: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Gesture isolation on container
  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = isolateTouchGestures(containerRef.current);
    return () => cleanup();
  }, []);

  if (!isTouchDevice && !forceVisible) {
    return null;
  }

  const handleDirStart = (e: React.SyntheticEvent, dir: VirtualInputDirection) => {
    if (e.cancelable) e.preventDefault();
    bridge.emitDirectionPress(dir);
    onDirectionPress?.(dir);
  };

  const handleDirEnd = (e: React.SyntheticEvent, dir: VirtualInputDirection) => {
    if (e.cancelable) e.preventDefault();
    bridge.emitDirectionRelease(dir);
    onDirectionRelease?.(dir);
  };

  const handleActStart = (
    e: React.SyntheticEvent,
    actionId: VirtualInputAction,
    cb?: () => void
  ) => {
    if (e.cancelable) e.preventDefault();
    bridge.emitActionPress(actionId);
    cb?.();
  };

  const handleActEnd = (
    e: React.SyntheticEvent,
    actionId: VirtualInputAction,
    cb?: () => void
  ) => {
    if (e.cancelable) e.preventDefault();
    bridge.emitActionRelease(actionId);
    cb?.();
  };

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Floating Touch HUD Overlay"
      className={`absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-2 sm:p-4 select-none touch-none ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* Top Bar for Weapon Selector (if provided) */}
      <div className="w-full flex items-center justify-center pointer-events-auto">
        {weaponLabels && weaponLabels.length > 0 && onWeaponSelect && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md shadow-lg">
            {weaponLabels.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  bridge.emitActionPress(`weapon_${idx}`);
                  onWeaponSelect(idx);
                }}
                className={`min-w-[44px] min-h-[44px] px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                  selectedWeapon === idx
                    ? "bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/60 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                    : "bg-zinc-900/60 text-zinc-400 border border-zinc-700/50"
                }`}
              >
                {idx + 1}: {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Panels */}
      <div className="w-full flex items-end justify-between gap-2 sm:gap-4 pointer-events-none">
        {/* Left Floating D-Pad Panel */}
        {showDPad && (
          <div className="pointer-events-auto relative w-32 h-32 sm:w-36 sm:h-36 grid grid-cols-3 grid-rows-3 gap-1 p-1 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md shadow-2xl">
            <div />
            <button
              type="button"
              aria-label="Move Up"
              onTouchStart={(e) => handleDirStart(e, "up")}
              onTouchEnd={(e) => handleDirEnd(e, "up")}
              onTouchCancel={(e) => handleDirEnd(e, "up")}
              onMouseDown={(e) => handleDirStart(e, "up")}
              onMouseUp={(e) => handleDirEnd(e, "up")}
              onPointerDown={(e) => handleDirStart(e, "up")}
              onPointerUp={(e) => handleDirEnd(e, "up")}
              onPointerCancel={(e) => handleDirEnd(e, "up")}
              onPointerLeave={(e) => handleDirEnd(e, "up")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700/80 text-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <IconChevronUp className="w-6 h-6 pointer-events-none" />
            </button>
            <div />

            <button
              type="button"
              aria-label="Move Left"
              onTouchStart={(e) => handleDirStart(e, "left")}
              onTouchEnd={(e) => handleDirEnd(e, "left")}
              onTouchCancel={(e) => handleDirEnd(e, "left")}
              onMouseDown={(e) => handleDirStart(e, "left")}
              onMouseUp={(e) => handleDirEnd(e, "left")}
              onPointerDown={(e) => handleDirStart(e, "left")}
              onPointerUp={(e) => handleDirEnd(e, "left")}
              onPointerCancel={(e) => handleDirEnd(e, "left")}
              onPointerLeave={(e) => handleDirEnd(e, "left")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700/80 text-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <IconChevronLeft className="w-6 h-6 pointer-events-none" />
            </button>

            <div className="flex items-center justify-center rounded-lg bg-zinc-950/80 border border-zinc-800/80">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan/60 animate-pulse" />
            </div>

            <button
              type="button"
              aria-label="Move Right"
              onTouchStart={(e) => handleDirStart(e, "right")}
              onTouchEnd={(e) => handleDirEnd(e, "right")}
              onTouchCancel={(e) => handleDirEnd(e, "right")}
              onMouseDown={(e) => handleDirStart(e, "right")}
              onMouseUp={(e) => handleDirEnd(e, "right")}
              onPointerDown={(e) => handleDirStart(e, "right")}
              onPointerUp={(e) => handleDirEnd(e, "right")}
              onPointerCancel={(e) => handleDirEnd(e, "right")}
              onPointerLeave={(e) => handleDirEnd(e, "right")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700/80 text-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <IconChevronRight className="w-6 h-6 pointer-events-none" />
            </button>

            <div />
            <button
              type="button"
              aria-label="Move Down"
              onTouchStart={(e) => handleDirStart(e, "down")}
              onTouchEnd={(e) => handleDirEnd(e, "down")}
              onTouchCancel={(e) => handleDirEnd(e, "down")}
              onMouseDown={(e) => handleDirStart(e, "down")}
              onMouseUp={(e) => handleDirEnd(e, "down")}
              onPointerDown={(e) => handleDirStart(e, "down")}
              onPointerUp={(e) => handleDirEnd(e, "down")}
              onPointerCancel={(e) => handleDirEnd(e, "down")}
              onPointerLeave={(e) => handleDirEnd(e, "down")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700/80 text-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <IconChevronDown className="w-6 h-6 pointer-events-none" />
            </button>
            <div />
          </div>
        )}

        {/* Right Floating Action Cluster Panel */}
        {showActionCluster && (
          <div className="pointer-events-auto flex items-end gap-2.5 sm:gap-3 p-1.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md shadow-2xl">
            {(onActionCPress || actionCLabel !== "Special") && (
              <button
                type="button"
                aria-label={actionCLabel}
                onTouchStart={(e) => handleActStart(e, "actionC", onActionCPress)}
                onTouchEnd={(e) => handleActEnd(e, "actionC", onActionCRelease)}
                onTouchCancel={(e) => handleActEnd(e, "actionC", onActionCRelease)}
                onMouseDown={(e) => handleActStart(e, "actionC", onActionCPress)}
                onMouseUp={(e) => handleActEnd(e, "actionC", onActionCRelease)}
                onPointerDown={(e) => handleActStart(e, "actionC", onActionCPress)}
                onPointerUp={(e) => handleActEnd(e, "actionC", onActionCRelease)}
                onPointerCancel={(e) => handleActEnd(e, "actionC", onActionCRelease)}
                className="min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl bg-amber-500/20 active:bg-amber-500/40 border border-amber-500/50 text-amber-300 active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg cursor-pointer"
              >
                {actionCIcon || <IconBolt className="w-5 h-5 mb-0.5" />}
                <span className="text-[9px] font-mono font-bold uppercase tracking-tight">
                  {actionCLabel}
                </span>
              </button>
            )}

            {(onActionBPress || actionBLabel !== "Secondary") && (
              <button
                type="button"
                aria-label={actionBLabel}
                onTouchStart={(e) => handleActStart(e, "actionB", onActionBPress)}
                onTouchEnd={(e) => handleActEnd(e, "actionB", onActionBRelease)}
                onTouchCancel={(e) => handleActEnd(e, "actionB", onActionBRelease)}
                onMouseDown={(e) => handleActStart(e, "actionB", onActionBPress)}
                onMouseUp={(e) => handleActEnd(e, "actionB", onActionBRelease)}
                onPointerDown={(e) => handleActStart(e, "actionB", onActionBPress)}
                onPointerUp={(e) => handleActEnd(e, "actionB", onActionBRelease)}
                onPointerCancel={(e) => handleActEnd(e, "actionB", onActionBRelease)}
                className="min-w-[52px] min-h-[52px] px-2 py-1 rounded-2xl bg-purple-500/20 active:bg-purple-500/40 border border-purple-500/50 text-purple-300 active:scale-95 transition-all flex flex-col items-center justify-center shadow-lg cursor-pointer"
              >
                {actionBIcon || <IconFlask className="w-5 h-5 mb-0.5" />}
                <span className="text-[9px] font-mono font-bold uppercase tracking-tight">
                  {actionBLabel}
                </span>
              </button>
            )}

            {(onActionAPress || actionALabel !== "Attack") && (
              <button
                type="button"
                aria-label={actionALabel}
                onTouchStart={(e) => handleActStart(e, "actionA", onActionAPress)}
                onTouchEnd={(e) => handleActEnd(e, "actionA", onActionARelease)}
                onTouchCancel={(e) => handleActEnd(e, "actionA", onActionARelease)}
                onMouseDown={(e) => handleActStart(e, "actionA", onActionAPress)}
                onMouseUp={(e) => handleActEnd(e, "actionA", onActionARelease)}
                onPointerDown={(e) => handleActStart(e, "actionA", onActionAPress)}
                onPointerUp={(e) => handleActEnd(e, "actionA", onActionARelease)}
                onPointerCancel={(e) => handleActEnd(e, "actionA", onActionARelease)}
                className="min-w-[56px] min-h-[56px] px-2.5 py-1 rounded-2xl bg-brand-cyan/25 active:bg-brand-cyan/45 border-2 border-brand-cyan/60 text-brand-cyan active:scale-95 transition-all flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
              >
                {actionAIcon || <IconSword className="w-6 h-6 mb-0.5" />}
                <span className="text-[10px] font-mono font-black uppercase tracking-tight">
                  {actionALabel}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
