"use client";

import React, { useEffect, useState } from "react";
import { HAND_NAMES, type LevelUp } from "@/lib/trial-and-error";
import { LOUD_PRESETS } from "@/components/trial-and-error/LoudLayer";

interface LevelUpPlateProps {
  levelUp: LevelUp;
  /** Numbers land at once instead of ticking. */
  reducedMotion: boolean;
  /** The cabinet allows loud effects (≥768px, no reduced motion). */
  loud: boolean;
}

const TICK_MS = 600;

/**
 * The level-up moment (T&E-UX-05): the hand's plate steps up a level while
 * its base Chips and +Mult tick from the old values to the new. The values
 * come from the domain's `LevelUp`; the plate only animates between them.
 * Remount it (key on the event) to replay.
 */
export function LevelUpPlate({
  levelUp,
  reducedMotion,
  loud,
}: LevelUpPlateProps) {
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TICK_MS);
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const shown = reducedMotion ? 1 : progress;
  const tween = (from: number, to: number) =>
    Math.round(from + (to - from) * shown);

  return (
    <div
      className={`border border-amber-400/70 bg-amber-500/10 px-3 py-2 ${loud ? LOUD_PRESETS.levelUp : ""}`}
      data-testid="level-up"
    >
      <p className="text-[10px] uppercase tracking-wider text-amber-300 break-words">
        {levelUp.guidanceName} · level up
      </p>
      <p className="mt-1 font-bold uppercase tracking-wider break-words">
        {HAND_NAMES[levelUp.handType]}{" "}
        <span className="text-zinc-400">Lv.{levelUp.from.level}</span> →{" "}
        <span className="text-amber-300">Lv.{levelUp.to.level}</span>
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums" aria-hidden="true">
        <span className="text-[color:var(--te-chips)]">
          [{tween(levelUp.from.chips, levelUp.to.chips)}]
        </span>{" "}
        ×{" "}
        <span className="text-[color:var(--te-plus-mult)]">
          [{tween(levelUp.from.mult, levelUp.to.mult)}]
        </span>
      </p>
    </div>
  );
}
