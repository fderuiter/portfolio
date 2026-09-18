"use client";

import React, { useState } from "react";
import {
  PATROL_SCENARIOS,
  createInitialShiftState,
  transitionShiftPhase,
  recordAction,
  generateDebriefReport,
  type ShiftState,
  type PatrolScenario,
  type ScenarioAction,
} from "@/lib/patrol";
import {
  IconShieldCheck,
  IconClock,
  IconChecklist,
  IconChevronRight,
  IconRefresh,
  IconAlertTriangle,
  IconMapPin,
  IconCheck,
  IconRoute,
} from "@tabler/icons-react";

interface PatrolShiftContainerProps {
  initialScenarioId?: string;
}

export const PatrolShiftContainer: React.FC<PatrolShiftContainerProps> = ({
  initialScenarioId,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<PatrolScenario>(
    () => {
      const found = PATROL_SCENARIOS.find((s) => s.id === initialScenarioId);
      return found ?? PATROL_SCENARIOS[0];
    }
  );

  const [shiftState, setShiftState] = useState<ShiftState>(() =>
    createInitialShiftState(selectedScenario?.id ?? null)
  );

  const handleSelectScenario = (scenario: PatrolScenario) => {
    setSelectedScenario(scenario);
    setShiftState(createInitialShiftState(scenario.id));
  };

  const handleStartShift = () => {
    setShiftState((prev) => transitionShiftPhase(prev, "patrol"));
  };

  const handleExecuteAction = (action: ScenarioAction) => {
    setShiftState((prev) => {
      const updated = recordAction(prev, action);
      if (prev.phase === "patrol" || prev.phase === "briefing") {
        return transitionShiftPhase(updated, "incident");
      }
      return updated;
    });
  };

  const handleFinishIncident = () => {
    setShiftState((prev) => transitionShiftPhase(prev, "debrief"));
  };

  const handleResetShift = () => {
    setShiftState(createInitialShiftState(selectedScenario.id));
  };

  const debriefReport = generateDebriefReport(selectedScenario, shiftState);

  return (
    <div
      className="w-full bg-zinc-950 rounded-3xl border border-zinc-800/80 p-4 sm:p-6 shadow-2xl flex flex-col gap-6"
      data-testid="patrol-shift-container"
    >
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
            <IconShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-mono font-bold text-white tracking-tight">
                Patrol Shift Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                M1 Foundation Scaffold
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Midwest Ski Patrol Judgment Simulation — Foundation Milestone
              (Issue #747)
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <IconClock className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Shift Time: {shiftState.timeElapsedMinutes} min</span>
          </div>
          <button
            type="button"
            onClick={handleResetShift}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <IconRefresh className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Prominent Medical & Clinical Disclaimer */}
      <div
        role="note"
        aria-label="Medical & Clinical Disclaimer"
        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1.5"
      >
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400">
          <IconAlertTriangle className="w-4 h-4 shrink-0" />
          <span>Simulation Notice &amp; Medical Disclaimer</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-200/90 font-sans">
          Patrol Shift is an architectural simulation prototype under active
          development (Issues #744 / #747). It models operational dispatch and
          deterministic state machines for educational purposes. It does{" "}
          <strong>not</strong> provide certified clinical guidance, Outdoor
          Emergency Care (OEC) treatment protocols, or real-world emergency
          decision support. Real emergencies require certified emergency
          responders.
        </p>
      </div>

      {/* Main Grid: Scenario Selector & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Selection Panel (Left) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <IconChecklist className="w-4 h-4 text-brand-cyan" />
            Operational Routines
          </h2>

          <div className="flex flex-col gap-3">
            {PATROL_SCENARIOS.map((scenario) => {
              const isSelected = scenario.id === selectedScenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleSelectScenario(scenario)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? "bg-brand-cyan/10 border-brand-cyan/40 text-white shadow-lg"
                      : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-zinc-200">
                      {scenario.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-zinc-800/60 border-zinc-700 text-zinc-400">
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-zinc-400 line-clamp-2">
                    {scenario.subtitle}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 pt-1">
                    <span>Est: {scenario.estimatedMinutes}m</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IconMapPin className="w-3 h-3" />
                      {scenario.location}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Milestone Roadmap Box */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300">
              <IconRoute className="w-4 h-4 text-brand-cyan" />
              <span>Milestone Roadmap (Epic #744)</span>
            </div>
            <ul className="text-[11px] font-mono text-zinc-400 space-y-1">
              <li className="text-brand-cyan flex items-center gap-1.5">
                <IconCheck className="w-3 h-3" /> M1: Route Scaffold &amp;
                lib/patrol
              </li>
              <li className="text-zinc-500">
                • M2: Headless Shift State Machine (#748)
              </li>
              <li className="text-zinc-500">• M3: Mountain Map Hub (#749)</li>
              <li className="text-zinc-500">• M4: OET Mini-Game (#750)</li>
              <li className="text-zinc-500">
                • M5: OEC Interaction &amp; Disclaimer (#751)
              </li>
              <li className="text-zinc-500">• M6: Scenario Packages (#752)</li>
              <li className="text-zinc-500">• M7: Debrief Engine (#753)</li>
            </ul>
          </div>
        </div>

        {/* Incident Interactive Workspace (Right) */}
        <div className="lg:col-span-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 p-5 flex flex-col gap-6">
          {/* Phase Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 uppercase">Current Phase:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan font-bold uppercase">
                {shiftState.phase}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              FSM Invariant: Deterministic Pure Transitions
            </span>
          </div>

          {/* Scenario Overview */}
          <div className="space-y-2">
            <h3 className="text-base font-mono font-bold text-white">
              {selectedScenario.title}
            </h3>
            <p className="text-xs font-sans text-zinc-300 leading-relaxed">
              {selectedScenario.description}
            </p>
          </div>

          {/* Action History / Phase Specific View */}
          {shiftState.phase === "briefing" && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                Operational Briefing
              </h4>
              <p className="text-xs font-sans text-zinc-400">
                Review morning sweep route and weather observations before
                departing base. Verify communication channels and inspection
                checklist.
              </p>
              <button
                type="button"
                onClick={handleStartShift}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cyan text-zinc-950 font-mono text-xs font-bold hover:bg-brand-cyan/90 transition-colors cursor-pointer"
              >
                <span>Initiate Shift</span>
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {(shiftState.phase === "patrol" ||
            shiftState.phase === "incident") && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Available Operational Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedScenario.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleExecuteAction(action)}
                    className="text-left p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-brand-cyan/40 hover:bg-zinc-800/80 transition-all cursor-pointer flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {action.label}
                      </span>
                      {action.costMinutes && (
                        <span className="text-[10px] font-mono text-brand-cyan">
                          +{action.costMinutes}m
                        </span>
                      )}
                    </div>
                    {action.description && (
                      <p className="text-[11px] font-sans text-zinc-400">
                        {action.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {shiftState.actionHistory.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/60 space-y-2">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    Executed Actions ({shiftState.actionHistory.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {shiftState.actionHistory.map((act, idx) => (
                      <span
                        key={`${act.id}-${idx}`}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300"
                      >
                        {act.label}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleFinishIncident}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-mono text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>Complete Shift &amp; Review</span>
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {shiftState.phase === "debrief" && (
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <IconShieldCheck className="w-4 h-4 text-brand-cyan" />
                  Shift Review &amp; Evaluation
                </h4>
                <span className="text-sm font-mono font-bold text-brand-cyan">
                  Completion Score: {debriefReport.score}%
                </span>
              </div>

              <p className="text-xs font-sans text-zinc-300">
                {debriefReport.summary}
              </p>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-zinc-400">
                  Protocol Evaluation Rules:
                </span>
                <div className="space-y-2">
                  {selectedScenario.debriefRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              rule.passed ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span className="font-bold text-zinc-200">
                            {rule.title}
                          </span>
                        </div>
                        <p className="text-[11px] font-sans text-zinc-400 pl-4">
                          {rule.feedback}
                        </p>
                      </div>
                      <span className="text-zinc-500 text-[10px]">
                        +{rule.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetShift}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  Start New Shift Routine
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
