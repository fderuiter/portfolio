"use client";

import React from "react";
import type { PatrolScenario, DebriefReport } from "@/lib/patrol";
import {
  IconShieldCheck,
  IconCircleCheck,
  IconCircleX,
  IconArrowBackUp,
  IconAward,
  IconChartBar,
} from "@tabler/icons-react";

/**
 * Props for the DebriefPlaceholder component.
 */
interface DebriefPlaceholderProps {
  /** The patrol scenario evaluated. */
  scenario: PatrolScenario | null;
  /** The computed debrief report containing score and protocol evaluations. */
  report: DebriefReport;
  /** Callback triggered to return to the mountain map hub and increment completed incidents. */
  onReturnToHub: () => void;
}

/**
 * Post-incident debrief screen evaluating protocol rules, displaying performance score,
 * debrief feedback, and returning to the mountain map hub.
 */
export const DebriefPlaceholder: React.FC<DebriefPlaceholderProps> = ({
  scenario,
  report,
  onReturnToHub,
}) => {
  // Merge rules: scenario defaults first, then strictly override with actual evaluation results
  const ruleMap = new Map<
    string,
    NonNullable<typeof scenario>["debriefRules"][0]
  >();
  for (const rule of scenario?.debriefRules || []) {
    ruleMap.set(rule.id, rule);
  }
  for (const rule of report.passedRules || []) {
    ruleMap.set(rule.id, { ...rule, passed: true });
  }
  for (const rule of report.failedRules || []) {
    ruleMap.set(rule.id, { ...rule, passed: false });
  }
  const uniqueRules = Array.from(ruleMap.values());

  return (
    <div
      className="flex flex-col gap-6 p-4 sm:p-8 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-debrief-placeholder"
    >
      {/* Debrief Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
              Shift Incident Debrief
            </span>
            <span className="text-zinc-400 text-xs font-mono">
              Protocol Evaluation &bull; {scenario?.title ?? "Routine Incident"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            Incident Performance Review
          </h2>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-brand-cyan/40 shadow-sm text-xs font-mono">
          <IconAward className="w-5 h-5 text-brand-cyan" />
          <span className="text-zinc-400">Score:</span>
          <span className="text-base font-bold text-white">
            {report.score} / {report.maxPossibleScore}
          </span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
        <div className="flex items-center gap-2 text-brand-cyan text-xs font-mono font-bold uppercase tracking-wider">
          <IconChartBar className="w-4 h-4" />
          <span>Operational Quality Summary</span>
        </div>
        <p className="text-xs sm:text-sm font-sans text-zinc-200 leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Debrief Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <IconShieldCheck className="w-4 h-4 text-brand-cyan" />
            Clinical &amp; Transportation Rules Evaluated
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            {report.passedRules.length} passed &bull;{" "}
            {report.failedRules.length} flagged
          </span>
        </div>

        {uniqueRules.length > 0 ? (
          <div className="space-y-2.5">
            {uniqueRules.map((rule) => {
              const isFailed =
                report.failedRules.some((f) => f.id === rule.id) ||
                rule.passed === false;
              const isPassed =
                !isFailed &&
                (rule.passed === true ||
                  report.passedRules.some((p) => p.id === rule.id));

              return (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <IconCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <IconCircleX className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="font-bold text-zinc-200 truncate">
                        {rule.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-zinc-400 pl-6 leading-relaxed">
                      {rule.feedback}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-mono shrink-0 ${
                      isPassed ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {isPassed ? `+${rule.score} pts` : "0 pts (flagged)"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 flex items-center gap-2">
            <IconCircleCheck className="w-4 h-4 text-emerald-400" />
            <span>
              All foundational patrol safety and scene communication checks
              passed cleanly.
            </span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onReturnToHub}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <IconArrowBackUp className="w-4 h-4" />
          <span>Return to Mountain Patrol Hub</span>
        </button>
      </div>
    </div>
  );
};
