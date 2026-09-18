"use client";

import React from "react";
import type { PatrolScenario, ScenarioAction } from "@/lib/patrol";
import {
  IconAmbulance,
  IconStethoscope,
  IconNotes,
  IconCheck,
  IconChevronRight,
  IconBuildingHospital,
} from "@tabler/icons-react";

/**
 * Props for the HandoffScreen component.
 */
interface HandoffScreenProps {
  /** The active patrol scenario. */
  scenario: PatrolScenario | null;
  /** History of actions executed on scene and during transport. */
  actionHistory: ScenarioAction[];
  /** Total elapsed minutes spent on this incident call. */
  timeElapsedMinutes: number;
  /** Callback triggered to transfer care to EMS/clinic staff and advance to debrief. */
  onCompleteHandoff: () => void;
}

/**
 * Medical handoff report to municipal EMS or clinic staff:
 * presents mechanism of injury, vital signs, interventions applied,
 * and verbal handoff confirmation.
 */
export const HandoffScreen: React.FC<HandoffScreenProps> = ({
  scenario,
  actionHistory,
  timeElapsedMinutes,
  onCompleteHandoff,
}) => {
  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-handoff-screen"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              Base First Aid Room &bull; Handoff Bay
            </span>
            <span className="text-zinc-400 text-xs font-mono">
              Incident Duration: {timeElapsedMinutes} min
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            Transfer of Care: {scenario?.title ?? "Patient Hand-off"}
          </h2>
          <p className="text-xs font-sans text-zinc-300 max-w-2xl">
            Toboggan arrived at Base First Aid Room handoff bay. Delivering
            standardized MIST / SBAR verbal handoff report to municipal
            ambulance crew and clinic staff.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5 text-zinc-300 text-xs font-mono">
          <IconAmbulance className="w-5 h-5 text-emerald-400" />
          <span>EMS Unit 54 On Scene</span>
        </div>
      </div>

      {/* Standardized MIST Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mechanism & Injury */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-brand-cyan">
            <IconNotes className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Mechanism &amp; Injury Profile
            </h3>
          </div>
          <div className="space-y-1.5 text-xs font-sans text-zinc-300">
            <div>
              <strong className="text-zinc-400 font-mono text-[11px] block">
                Location &amp; Terrain:
              </strong>
              <span>
                {scenario?.location ?? "Upper Ridge - Tower 6"} (Packed powder /
                firm hardpack)
              </span>
            </div>
            <div>
              <strong className="text-zinc-400 font-mono text-[11px] block">
                Mechanism of Injury:
              </strong>
              <span>
                Caught outside ski edge on hard snow, tumbling fall with binding
                non-release.
              </span>
            </div>
            <div>
              <strong className="text-zinc-400 font-mono text-[11px] block">
                Suspected Pathology:
              </strong>
              <span>
                Closed extremity injury, point tenderness, guarded range of
                motion.
              </span>
            </div>
          </div>
        </div>

        {/* Vitals & Interventions */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <IconStethoscope className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Signs, Vitals &amp; Interventions
            </h3>
          </div>
          <div className="space-y-1.5 text-xs font-sans text-zinc-300">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Mental Status:</span>
              <span className="text-white font-bold">
                Alert &amp; Oriented x4 (GCS 15)
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Baseline Vitals:</span>
              <span className="text-white font-bold">
                HR 76, RR 16, Warm &amp; Dry
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Interventions:</span>
              <span className="text-emerald-400 font-bold">
                Splint applied, PMS verified intact
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Insulation:</span>
              <span className="text-white font-bold">
                Wool blanket &amp; toboggan tarp wrapped
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interventions History Summary */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          Completed Patrol Care Documentation ({actionHistory.length} actions
          logged):
        </h4>
        {actionHistory.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actionHistory.map((act, idx) => (
              <span
                key={`${act.id}-${idx}`}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5"
              >
                <IconCheck className="w-3 h-3 text-emerald-400" />
                {act.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-zinc-500 italic">
            Standard visual assessment and calm verbal coaching provided during
            transport.
          </p>
        )}
      </div>

      {/* Receiving Clinician Sign-off */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
        <IconBuildingHospital className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-mono font-bold text-emerald-300 uppercase tracking-wider">
            Verbal Handoff Acknowledged by Paramedic Unit 54
          </span>
          <p className="text-emerald-200/90 font-sans leading-relaxed">
            &ldquo;Report received. Neurovascular exam confirmed intact. We will
            take over patient care, initiate secondary survey in ambulance, and
            transport to Valley Regional Medical Center.&rdquo;
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onCompleteHandoff}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Transfer Care &amp; Complete Log</span>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
