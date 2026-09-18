"use client";

import React from "react";
import type { PatrolScenario } from "@/lib/patrol";
import {
  IconEmergencyBed,
  IconGauge,
  IconRoute,
  IconCheck,
  IconChevronRight,
  IconRadio,
} from "@tabler/icons-react";

/**
 * Props for the OetPlaceholder component.
 */
interface OetPlaceholderProps {
  /** The active patrol scenario. */
  scenario: PatrolScenario | null;
  /** Callback triggered when the toboggan safely reaches the base aid room. */
  onArriveAtBase: () => void;
}

/**
 * Toboggan transport view previewing the M4 2D canvas transport run down the fall line,
 * detailing operator handles, chain brake deployment, tail-rope braking, and base aid room arrival.
 */
export const OetPlaceholder: React.FC<OetPlaceholderProps> = ({
  scenario,
  onArriveAtBase,
}) => {
  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-oet-placeholder"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            OET Fall-Line Transport
          </span>
          <span className="text-zinc-400 text-xs font-mono">
            Cascade Toboggan 100
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
          Toboggan Descent: {scenario?.location ?? "Upper Ridge"} to Base
        </h2>
        <p className="text-xs font-sans text-zinc-300 max-w-2xl">
          Patient is packaged with head uphill and four-point harness secured.
          Front operator in handles utilizing snowplow and sideslip edge
          control. Tail rope operator active on steep icy pitches.
        </p>
      </div>

      {/* 2D Mini-Game Canvas Preview Card */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconEmergencyBed className="w-5 h-5 text-brand-cyan" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Transport Run Simulation Preview
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-mono font-bold uppercase">
            M4 Mini-Game Engine
          </span>
        </div>

        {/* Visual Fall Line Simulation Graphic */}
        <div className="h-32 rounded-xl bg-zinc-900/80 border border-zinc-800/60 p-4 flex items-center justify-between relative overflow-hidden">
          {/* Slope Angle Gradient */}
          <div className="space-y-1 z-10">
            <div className="text-[11px] font-mono text-zinc-400">
              DESCENT VECTOR:
            </div>
            <div className="text-base font-mono font-bold text-emerald-400">
              24° Fall Line
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Hardpack Snow • Chain Brake Engaged
            </div>
          </div>

          {/* Sled Status Badge */}
          <div className="flex flex-col items-end gap-1.5 z-10">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <IconGauge className="w-4 h-4 text-brand-cyan" />
              <span>
                Speed: <strong>10 mph (Controlled)</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <IconRoute className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Tail Rope: <strong>Tensioned</strong>
              </span>
            </div>
          </div>

          {/* Fall Line Grid Accents */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00f0ff_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff_1px,transparent_1px)] bg-[size:16px_16px]" />
        </div>

        {/* Radio Update Pill */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <IconRadio className="w-4 h-4 text-brand-cyan shrink-0" />
          <span>
            Radio Update: &ldquo;
            <strong className="text-white">Patrol 4</strong>, toboggan in motion
            down Upper Ridge, approaching Midway catwalk. Base Aid Room
            standby.&rdquo;
          </span>
        </div>
      </div>

      {/* Safety & Handling Invariants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <IconCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Head Uphill
            </div>
            <div className="text-xs font-mono font-bold text-white">
              Gravity Orientation OK
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
            <IconCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Chain Brake
            </div>
            <div className="text-xs font-mono font-bold text-white">
              Center Drag Position
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <IconCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Tail Rope
            </div>
            <div className="text-xs font-mono font-bold text-white">
              Second Patroller On Line
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onArriveAtBase}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Arrive at Base Aid Room</span>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
