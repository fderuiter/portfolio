"use client";

import React from "react";
import type { PatrolScenario, ScenarioAction } from "@/lib/patrol";
import {
  IconStethoscope,
  IconAlertCircle,
  IconEmergencyBed,
  IconBandage,
  IconCheck,
  IconChevronRight,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";

/**
 * Props for the SceneInteractionPlaceholder component.
 */
interface SceneInteractionPlaceholderProps {
  /** The active patrol scenario. */
  scenario: PatrolScenario | null;
  /** Chronological history of actions executed during this shift. */
  actionHistory: ScenarioAction[];
  /** Callback triggered when a clinical/operational action is executed on scene. */
  onExecuteAction: (action: ScenarioAction) => void;
  /** Callback triggered to finish scene stabilization and transition to toboggan transport. */
  onPrepareTransport: () => void;
}

/**
 * Scene arrival view displaying patient chief complaint, primary assessment status,
 * available operational actions, SAM splint / packaging preview, and toboggan preparation action.
 */
export const SceneInteractionPlaceholder: React.FC<
  SceneInteractionPlaceholderProps
> = ({ scenario, actionHistory, onExecuteAction, onPrepareTransport }) => {
  const executedIds = new Set(actionHistory.map((a) => a.id));

  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-scene-interaction"
    >
      {/* Scene Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              On Scene &bull; OEC Clinical Evaluation
            </span>
            <span className="text-zinc-400 text-xs font-mono flex items-center gap-1">
              <IconMapPin className="w-3 h-3" />
              {scenario?.location ?? "Upper Ridge - Tower 6"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            {scenario?.title ?? "On-Scene Incident Response"}
          </h2>
          <p className="text-xs font-sans text-zinc-300 max-w-2xl">
            {scenario?.description ??
              "Arrived on scene. Crossed skis placed 15 feet uphill to mark hazard and divert skier traffic. Initiating primary assessment."}
          </p>
        </div>

        {/* Action Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
          <IconClock className="w-3.5 h-3.5 text-brand-cyan" />
          <span>
            Actions Taken:{" "}
            <strong className="text-white">{actionHistory.length}</strong>
          </span>
        </div>
      </div>

      {/* Patient Assessment & Scene Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Clinical State */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-brand-cyan">
            <IconStethoscope className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Primary Assessment
            </h3>
          </div>
          <div className="space-y-2 text-xs font-sans text-zinc-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/60 font-mono text-[11px]">
              <span className="text-zinc-400">Level of Consciousness:</span>
              <span className="text-emerald-400 font-bold">
                Alert &amp; Oriented x4
              </span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/60 font-mono text-[11px]">
              <span className="text-zinc-400">Airway / Breathing:</span>
              <span className="text-emerald-400 font-bold">
                Patent, Unlabored
              </span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/60 font-mono text-[11px]">
              <span className="text-zinc-400">Circulation / Bleeding:</span>
              <span className="text-emerald-400 font-bold">
                Radial Pulse Strong, No Major Bleed
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Chief Complaint:</span>
              <span className="text-amber-300 font-bold">
                Pain, swelling, point tenderness
              </span>
            </div>
          </div>
        </div>

        {/* SAM Splint & Sled Packaging Preview */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <IconBandage className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Packaging &amp; Splinting Preview
            </h3>
          </div>
          <p className="text-xs font-sans text-zinc-400 leading-relaxed">
            SAM splint contoured to anatomical position of function. Distal
            pulse, motor, and sensory (PMS) checked before and after
            immobilization. Patient insulated with wool blanket and tarp wrap.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            <IconEmergencyBed className="w-4 h-4 text-brand-cyan shrink-0" />
            <span>
              Cascade Toboggan 100 on scene with chain brake configured.
            </span>
          </div>
        </div>
      </div>

      {/* Available Operational Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-brand-cyan" />
            Available Scene Actions
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            Execute actions to stabilize before transport
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(scenario?.actions ?? []).map((action) => {
            const hasExecuted = executedIds.has(action.id);
            return (
              <button
                key={action.id}
                type="button"
                aria-disabled={hasExecuted}
                onClick={() => {
                  if (!hasExecuted) {
                    onExecuteAction(action);
                  }
                }}
                className={`min-h-[44px] min-w-[44px] text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
                  hasExecuted
                    ? "bg-brand-cyan/10 border-brand-cyan/40 text-white shadow-sm cursor-default"
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold">
                    {action.label}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {action.costMinutes && (
                      <span className="text-[10px] font-mono text-brand-cyan">
                        +{action.costMinutes}m
                      </span>
                    )}
                    {hasExecuted && (
                      <IconCheck className="w-3.5 h-3.5 text-brand-cyan" />
                    )}
                  </div>
                </div>
                {action.description && (
                  <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
                    {action.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Executed Action History Badges */}
      {actionHistory.length > 0 && (
        <div className="pt-2 border-t border-zinc-800/60 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-400">
            Completed Protocol Actions ({actionHistory.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {actionHistory.map((act, idx) => (
              <span
                key={`${act.id}-${idx}`}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5"
              >
                <IconCheck className="w-3 h-3 text-brand-cyan" />
                {act.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation CTA */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onPrepareTransport}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span>Stabilize &amp; Prepare Toboggan</span>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
