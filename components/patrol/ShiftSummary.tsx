"use client";

import React from "react";
import type { ShiftState, PatrolEvent } from "@/lib/patrol";
import {
  IconChecklist,
  IconClock,
  IconAward,
  IconCheck,
  IconRefresh,
  IconLogout,
  IconHistory,
  IconMountain,
} from "@tabler/icons-react";

/**
 * Props for the ShiftSummary component.
 */
interface ShiftSummaryProps {
  /** The final completed shift state. */
  shiftState: ShiftState;
  /** Complete chronological audit log of all events dispatched during the shift. */
  eventHistory: PatrolEvent[];
  /** Callback triggered to reset the simulation and begin a new patrol shift. */
  onResetShift: () => void;
}

/**
 * Final shift summary screen displaying total incidents resolved, shift duration,
 * composite protocol score, chronological event history log, and shift completion actions.
 */
export const ShiftSummary: React.FC<ShiftSummaryProps> = ({
  shiftState,
  eventHistory,
  onResetShift,
}) => {
  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-shift-summary"
    >
      {/* Shift Complete Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              Mountain Closed &bull; Final Sweep Complete
            </span>
            <span className="text-zinc-400 text-xs font-mono">
              Shift 08:00 - 16:30
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            Patrol Shift Complete: Daily Operational Summary
          </h2>
          <p className="text-xs font-sans text-zinc-300 max-w-2xl">
            All chairs powered down, final trail sweep cleared, and patient
            handoff logs archived. Review your composite shift record below.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono">
          <IconMountain className="w-4 h-4 text-emerald-400" />
          <span>Status: 10-7 Off Duty</span>
        </div>
      </div>

      {/* High-Level Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Calls Answered */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
            <IconChecklist className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Calls Answered
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {shiftState.incidentsCompleted}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              All transports successful
            </div>
          </div>
        </div>

        {/* Elapsed Shift Time */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <IconClock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Incident Time
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {shiftState.timeElapsedMinutes} min
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Active response time
            </div>
          </div>
        </div>

        {/* Composite Protocol Score */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <IconAward className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              Protocol Score
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400">
              {shiftState.score}%
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Standard protocol adhered
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Event History Log */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            <IconHistory className="w-4 h-4 text-brand-cyan" />
            <span>Chronological Operational Event Log</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {eventHistory.length} events logged
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 select-text">
          {eventHistory.length > 0 ? (
            eventHistory.map((evt, idx) => (
              <div
                key={`${evt.action ?? "event"}-${idx}`}
                className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between text-xs font-mono gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconCheck className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                  <span className="text-zinc-200 font-bold truncate">
                    {evt.action ?? evt.type ?? "Operational Event"}
                  </span>
                  {evt.scenarioId && (
                    <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 hidden sm:inline">
                      {evt.scenarioId}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">
                  #{idx + 1}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs font-mono text-zinc-500 italic p-3">
              No individual event telemetry logged during this session.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onResetShift}
          className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        >
          <IconLogout className="w-4 h-4" />
          <span>Clock Out &amp; Log Off</span>
        </button>

        <button
          type="button"
          onClick={onResetShift}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <IconRefresh className="w-4 h-4" />
          <span>Start New Shift</span>
        </button>
      </div>
    </div>
  );
};
