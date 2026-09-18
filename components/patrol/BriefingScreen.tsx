"use client";

import React, { useState } from "react";
import {
  IconTemperature,
  IconWind,
  IconSnowflake,
  IconChecklist,
  IconSquareCheck,
  IconSquare,
  IconChevronRight,
  IconMountain,
  IconAntennaBars5,
} from "@tabler/icons-react";

/**
 * Props for the BriefingScreen component.
 */
interface BriefingScreenProps {
  /** Callback triggered to finish the briefing and open the mountain map hub. */
  onCompleteBriefing: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "radio",
    label: "Radio Communications Check",
    detail:
      "Confirmed signal on 154.570 MHz CH 1. Spare battery in chest pack.",
  },
  {
    id: "pack",
    label: "First Aid Trauma Pack",
    detail:
      "SAM splints, triangular bandages, sterile dressings, shears, and PPE verified.",
  },
  {
    id: "sled",
    label: "Toboggan Cache Inspection",
    detail:
      "Summit Shack Cascade rescue sled handles, chain brake, and tail rope secured.",
  },
  {
    id: "aed",
    label: "Base Aid Room Readiness",
    detail:
      "AED operational, oxygen tank pressure checked, EMS transfer staging ready.",
  },
];

/**
 * Morning operational briefing screen displaying snow/weather conditions,
 * lift status, pre-shift equipment checklist, and mountain opening action.
 */
export const BriefingScreen: React.FC<BriefingScreenProps> = ({
  onCompleteBriefing,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    radio: true,
    pack: true,
    sled: true,
    aed: true,
  });

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-briefing-screen"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
            Morning Sweep
          </span>
          <span className="text-zinc-400 text-xs font-mono">
            Shift 08:00 - 16:30
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
          Operational Shift Briefing
        </h2>
        <p className="text-xs font-sans text-zinc-300">
          Review opening hill observations, weather conditions, and complete
          your equipment checklist before departing base for morning sweep.
        </p>
      </div>

      {/* Conditions Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Temp */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <IconTemperature className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Temperature
            </div>
            <div className="text-sm font-mono font-bold text-white truncate">
              18°F (-8°C)
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Wind chill 4°F
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <IconWind className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Wind / Ridge
            </div>
            <div className="text-sm font-mono font-bold text-white truncate">
              NW 14 mph
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Gusts to 22 mph
            </div>
          </div>
        </div>

        {/* Snow Surface */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <IconSnowflake className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Surface Conditions
            </div>
            <div className="text-sm font-mono font-bold text-white truncate">
              Hardpack / Groomed
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Upper Ridge icy
            </div>
          </div>
        </div>

        {/* Lift & Hill Status */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
            <IconMountain className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Terrain Status
            </div>
            <div className="text-sm font-mono font-bold text-white truncate">
              18 / 20 Open
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Chair 1 &amp; 2 open
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Shift Inspection Checklist */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconChecklist className="w-4 h-4 text-brand-cyan" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Pre-Shift Readiness Checklist
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {Object.values(checkedItems).filter(Boolean).length} of{" "}
            {DEFAULT_CHECKLIST.length} verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {DEFAULT_CHECKLIST.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleItem(item.id)}
                className={`min-h-[44px] min-w-[44px] text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
                  isChecked
                    ? "bg-zinc-900/90 border-zinc-700/80 text-zinc-200"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="mt-0.5 shrink-0 text-brand-cyan">
                  {isChecked ? (
                    <IconSquareCheck className="w-4 h-4 text-brand-cyan" />
                  ) : (
                    <IconSquare className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-mono font-bold text-zinc-200">
                    {item.label}
                  </div>
                  <div className="text-[11px] font-sans text-zinc-400 leading-snug">
                    {item.detail}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radio Frequency Banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
        <IconAntennaBars5 className="w-4 h-4 text-brand-cyan shrink-0" />
        <span>
          Radio Call Sign: <strong className="text-white">Patrol 4</strong> •
          Frequency:{" "}
          <strong className="text-brand-cyan">154.570 MHz CH 1</strong>
        </span>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onCompleteBriefing}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Depart Base / Open Mountain</span>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
