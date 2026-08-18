"use client";

import React, { useState, useEffect } from "react";
import {
  triggerHapticFeedback,
  triggerAudioFeedback,
  isolateGesture,
} from "@/lib/arcade/virtual-input-bridge";
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconSword,
  IconFlask,
} from "@tabler/icons-react";

export interface VirtualDPadProps {
  onDirectionPress?: (direction: "up" | "down" | "left" | "right") => void;
  onDirectionRelease?: (direction: "up" | "down" | "left" | "right") => void;
  className?: string;
}

export const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirectionPress,
  onDirectionRelease,
  className = "",
}) => {
  const handlePress = (
    e: React.SyntheticEvent,
    direction: "up" | "down" | "left" | "right"
  ) => {
    isolateGesture(e);
    triggerHapticFeedback(15);
    triggerAudioFeedback(880, 0.02);
    onDirectionPress?.(direction);
  };

  const handleRelease = (
    e: React.SyntheticEvent,
    direction: "up" | "down" | "left" | "right"
  ) => {
    isolateGesture(e);
    onDirectionRelease?.(direction);
  };

  return (
    <div
      role="group"
      aria-label="Virtual D-Pad"
      className={`relative w-36 h-36 grid grid-cols-3 grid-rows-3 gap-1 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md shadow-lg select-none touch-none ${className}`}
      style={{ touchAction: "none" }}
    >
      <div />
      <button
        type="button"
        aria-label="Move Up"
        onTouchStart={(e) => handlePress(e, "up")}
        onTouchEnd={(e) => handleRelease(e, "up")}
        onTouchCancel={(e) => handleRelease(e, "up")}
        onMouseDown={(e) => handlePress(e, "up")}
        onMouseUp={(e) => handleRelease(e, "up")}
        onMouseLeave={(e) => handleRelease(e, "up")}
        onPointerDown={(e) => handlePress(e, "up")}
        onPointerUp={(e) => handleRelease(e, "up")}
        onPointerLeave={(e) => handleRelease(e, "up")}
        onPointerCancel={(e) => handleRelease(e, "up")}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-800/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700 text-zinc-300 active:scale-95 transition-transform cursor-pointer"
      >
        <IconArrowUp className="w-5 h-5 pointer-events-none" />
      </button>
      <div />
      <button
        type="button"
        aria-label="Move Left"
        onTouchStart={(e) => handlePress(e, "left")}
        onTouchEnd={(e) => handleRelease(e, "left")}
        onTouchCancel={(e) => handleRelease(e, "left")}
        onMouseDown={(e) => handlePress(e, "left")}
        onMouseUp={(e) => handleRelease(e, "left")}
        onMouseLeave={(e) => handleRelease(e, "left")}
        onPointerDown={(e) => handlePress(e, "left")}
        onPointerUp={(e) => handleRelease(e, "left")}
        onPointerLeave={(e) => handleRelease(e, "left")}
        onPointerCancel={(e) => handleRelease(e, "left")}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-800/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700 text-zinc-300 active:scale-95 transition-transform cursor-pointer"
      >
        <IconArrowLeft className="w-5 h-5 pointer-events-none" />
      </button>
      <div className="flex items-center justify-center rounded-lg bg-zinc-950/60 border border-zinc-800">
        <div className="w-2 h-2 rounded-full bg-zinc-600" />
      </div>
      <button
        type="button"
        aria-label="Move Right"
        onTouchStart={(e) => handlePress(e, "right")}
        onTouchEnd={(e) => handleRelease(e, "right")}
        onTouchCancel={(e) => handleRelease(e, "right")}
        onMouseDown={(e) => handlePress(e, "right")}
        onMouseUp={(e) => handleRelease(e, "right")}
        onMouseLeave={(e) => handleRelease(e, "right")}
        onPointerDown={(e) => handlePress(e, "right")}
        onPointerUp={(e) => handleRelease(e, "right")}
        onPointerLeave={(e) => handleRelease(e, "right")}
        onPointerCancel={(e) => handleRelease(e, "right")}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-800/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700 text-zinc-300 active:scale-95 transition-transform cursor-pointer"
      >
        <IconArrowRight className="w-5 h-5 pointer-events-none" />
      </button>
      <div />
      <button
        type="button"
        aria-label="Move Down"
        onTouchStart={(e) => handlePress(e, "down")}
        onTouchEnd={(e) => handleRelease(e, "down")}
        onTouchCancel={(e) => handleRelease(e, "down")}
        onMouseDown={(e) => handlePress(e, "down")}
        onMouseUp={(e) => handleRelease(e, "down")}
        onMouseLeave={(e) => handleRelease(e, "down")}
        onPointerDown={(e) => handlePress(e, "down")}
        onPointerUp={(e) => handleRelease(e, "down")}
        onPointerLeave={(e) => handleRelease(e, "down")}
        onPointerCancel={(e) => handleRelease(e, "down")}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-800/80 active:bg-brand-cyan/40 active:text-brand-cyan border border-zinc-700 text-zinc-300 active:scale-95 transition-transform cursor-pointer"
      >
        <IconArrowDown className="w-5 h-5 pointer-events-none" />
      </button>
      <div />
    </div>
  );
};

interface VirtualGamepadProps {
  onDirectionPress?: (direction: "up" | "down" | "left" | "right") => void;
  onDirectionRelease?: (direction: "up" | "down" | "left" | "right") => void;
  onActionAPress?: () => void;
  onActionARelease?: () => void;
  onActionBPress?: () => void;
  onActionBRelease?: () => void;
  onWeaponSelect?: (index: number) => void;
  selectedWeapon?: number;
  weaponLabels?: string[];
  actionALabel?: string;
  actionBLabel?: string;
  forceVisible?: boolean;
  className?: string;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({
  onDirectionPress,
  onDirectionRelease,
  onActionAPress,
  onActionARelease,
  onActionBPress,
  onActionBRelease,
  onWeaponSelect,
  selectedWeapon,
  weaponLabels,
  actionALabel = "Attack",
  actionBLabel = "Potion",
  forceVisible = false,
  className = "",
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    const handleTouchStart = () => setIsTouchDevice(true);
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
    window.addEventListener("touchstart", handleTouchStart, { once: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  if (!isTouchDevice && !forceVisible) {
    return null;
  }

  const handleAction = (
    e: React.SyntheticEvent,
    callback?: () => void
  ) => {
    isolateGesture(e);
    triggerHapticFeedback(15);
    triggerAudioFeedback(950, 0.02);
    callback?.();
  };

  return (
    <div
      role="group"
      aria-label="Virtual Gamepad Touch Controls"
      className={`select-none touch-none pointer-events-auto flex items-end justify-between gap-4 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* 4-Way D-Pad on Left */}
      <VirtualDPad
        onDirectionPress={onDirectionPress}
        onDirectionRelease={onDirectionRelease}
      />

      {/* Center Weapon Selector (if provided) */}
      {weaponLabels && weaponLabels.length > 0 && onWeaponSelect && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md">
          {weaponLabels.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={(e) => {
                isolateGesture(e);
                triggerHapticFeedback(10);
                triggerAudioFeedback(750, 0.02);
                onWeaponSelect(idx);
              }}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                selectedWeapon === idx
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/60"
              }`}
            >
              {idx + 1}: {label}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons on Right */}
      <div className="flex items-center gap-3">
        {onActionBPress && (
          <button
            type="button"
            aria-label={actionBLabel}
            onTouchStart={(e) => handleAction(e, onActionBPress)}
            onTouchEnd={(e) => handleAction(e, onActionBRelease)}
            onTouchCancel={(e) => handleAction(e, onActionBRelease)}
            onMouseDown={(e) => handleAction(e, onActionBPress)}
            onMouseUp={(e) => handleAction(e, onActionBRelease)}
            onMouseLeave={(e) => handleAction(e, onActionBRelease)}
            onPointerDown={(e) => handleAction(e, onActionBPress)}
            onPointerUp={(e) => handleAction(e, onActionBRelease)}
            onPointerLeave={(e) => handleAction(e, onActionBRelease)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] w-14 h-14 rounded-2xl bg-rose-500/20 active:bg-rose-500/40 border border-rose-500/40 text-rose-300 active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <IconFlask className="w-5 h-5 mb-0.5 pointer-events-none" />
            <span className="text-[9px] font-mono font-bold uppercase pointer-events-none">{actionBLabel}</span>
          </button>
        )}

        {onActionAPress && (
          <button
            type="button"
            aria-label={actionALabel}
            onTouchStart={(e) => handleAction(e, onActionAPress)}
            onTouchEnd={(e) => handleAction(e, onActionARelease)}
            onTouchCancel={(e) => handleAction(e, onActionARelease)}
            onMouseDown={(e) => handleAction(e, onActionAPress)}
            onMouseUp={(e) => handleAction(e, onActionARelease)}
            onMouseLeave={(e) => handleAction(e, onActionARelease)}
            onPointerDown={(e) => handleAction(e, onActionAPress)}
            onPointerUp={(e) => handleAction(e, onActionARelease)}
            onPointerLeave={(e) => handleAction(e, onActionARelease)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] w-16 h-16 rounded-2xl bg-brand-cyan/20 active:bg-brand-cyan/40 border border-brand-cyan/40 text-brand-cyan active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <IconSword className="w-6 h-6 mb-0.5 pointer-events-none" />
            <span className="text-[10px] font-mono font-bold uppercase pointer-events-none">{actionALabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
