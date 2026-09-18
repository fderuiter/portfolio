"use client";

import React, { useMemo, useEffect, useRef, useSyncExternalStore } from "react";
import {
  PATROL_SCENARIOS,
  ALL_PATROL_SCENARIOS,
  createPatrolShiftEngine,
  collectIncidentEvents,
  evaluateIncidentDebrief,
  type PatrolShiftEngine,
} from "@/lib/patrol";
import { useAnnouncer } from "@/hooks/useAnnouncer";
import {
  IconShieldCheck,
  IconClock,
  IconRefresh,
  IconRoute,
  IconCheck,
} from "@tabler/icons-react";
import { IntroScreen } from "./IntroScreen";
import { BriefingScreen } from "./BriefingScreen";
import { MountainMap } from "./MountainMap";
import { DispatchOverlay } from "./DispatchOverlay";
import { SceneInteraction } from "./SceneInteraction";
import { OetCanvas } from "./OetCanvas";
import { HandoffPanel } from "./HandoffPanel";
import { DebriefScreen } from "./DebriefScreen";
import { ShiftSummary } from "./ShiftSummary";
import { MedicalDisclaimerBanner } from "./MedicalDisclaimerBanner";

/**
 * Props for the PatrolShiftContainer component.
 */
interface PatrolShiftContainerProps {
  /** Optional scenario ID to load upon mounting. */
  initialScenarioId?: string;
  /** Optional custom engine instance for integration testing or dependency injection. */
  engine?: PatrolShiftEngine;
}

/**
 * Top-level container component for the Patrol Shift simulation studio.
 * Manages headless engine lifecycle, React 19 hydration-safe subscriptions via
 * `useSyncExternalStore`, and deterministic view routing across all shift phases.
 */
export const PatrolShiftContainer: React.FC<PatrolShiftContainerProps> = ({
  initialScenarioId,
  engine: customEngine,
}) => {
  const defaultEngine = useMemo(
    () => createPatrolShiftEngine(ALL_PATROL_SCENARIOS),
    []
  );
  const activeEngine = customEngine ?? defaultEngine;

  const shiftState = useSyncExternalStore(
    activeEngine.subscribe,
    activeEngine.getState,
    activeEngine.getState
  );

  const { announce } = useAnnouncer();
  const prevPhaseRef = useRef<string>(shiftState.phase);

  useEffect(() => {
    if (prevPhaseRef.current !== shiftState.phase) {
      prevPhaseRef.current = shiftState.phase;
      announce(
        `Patrol shift phase changed to ${shiftState.phase.replace(/_/g, " ")}`
      );
    }
  }, [shiftState.phase, announce]);

  const availableScenarios = useMemo(() => {
    const fromEngine = activeEngine.getScenarios?.();
    return fromEngine && fromEngine.length > 0
      ? fromEngine
      : ALL_PATROL_SCENARIOS;
  }, [activeEngine]);

  useEffect(() => {
    if (initialScenarioId) {
      const target =
        availableScenarios.find((s) => s.id === initialScenarioId) ??
        ALL_PATROL_SCENARIOS.find((s) => s.id === initialScenarioId);
      if (target) {
        activeEngine.loadScenario(target);
      }
    }
  }, [initialScenarioId, activeEngine, availableScenarios]);

  const currentScenario = useMemo(() => {
    if (shiftState.currentScenarioId) {
      const match = availableScenarios.find(
        (s) => s.id === shiftState.currentScenarioId
      );
      if (match) return match;
    }
    const loaded = activeEngine.getLoadedScenario();
    if (
      loaded &&
      (!shiftState.currentScenarioId ||
        loaded.id === shiftState.currentScenarioId)
    ) {
      return loaded;
    }
    return (
      availableScenarios[
        shiftState.incidentsCompleted % availableScenarios.length
      ] ??
      availableScenarios[0] ??
      PATROL_SCENARIOS[0]
    );
  }, [
    availableScenarios,
    activeEngine,
    shiftState.currentScenarioId,
    shiftState.incidentsCompleted,
  ]);

  const incidentEvents = useMemo(
    () =>
      collectIncidentEvents(
        activeEngine.getEventHistory(),
        shiftState.activeEvents,
        currentScenario?.id
      ),
    [activeEngine, shiftState.activeEvents, currentScenario]
  );

  const incidentDebriefResult = useMemo(
    () => evaluateIncidentDebrief(currentScenario?.id ?? "", incidentEvents),
    [currentScenario, incidentEvents]
  );

  const handleReset = () => {
    activeEngine.dispatch({ type: "RESET" });
  };

  return (
    <div
      className="w-full bg-zinc-950 rounded-3xl border border-zinc-800/80 p-4 sm:p-6 shadow-2xl flex flex-col gap-6"
      data-testid="patrol-shift-container"
    >
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
            <IconShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-mono font-bold text-white tracking-tight">
                Patrol Shift Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                M1 Foundation Scaffold &bull; M3 Map Hub &bull; M4 OET Mini-Game
                &bull; M5 OEC Interaction &bull; M6 Multi-Scenario &bull; M7
                Contextual Debrief
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Welch Village Ski Patrol Judgment Simulation — Vertical Slice
              (Issue #749)
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <IconClock className="w-4 h-4 text-brand-cyan" />
            <span>Shift: {shiftState.timeElapsedMinutes} min</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span>
              Phase:{" "}
              <strong className="text-brand-cyan uppercase">
                {shiftState.phase}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <IconRefresh className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Dynamic Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Current shift phase: {shiftState.phase.replace(/_/g, " ")}. Time
        elapsed: {shiftState.timeElapsedMinutes} minutes. Incidents completed:{" "}
        {shiftState.incidentsCompleted}.
      </div>

      {/* Prominent Medical & Clinical Disclaimer */}
      {shiftState.phase !== "SCENE" &&
        shiftState.phase !== "HANDOFF" &&
        shiftState.phase !== "incident" &&
        shiftState.phase !== "RESPONDING" && <MedicalDisclaimerBanner />}

      {/* Dynamic Phase Router */}
      <div className="w-full">
        {shiftState.phase === "INTRO" && (
          <IntroScreen
            onStartShift={() => activeEngine.dispatch({ type: "START_SHIFT" })}
            onSkipIntro={() => {
              activeEngine.dispatch({ type: "START_SHIFT" });
              activeEngine.dispatch({ type: "COMPLETE_BRIEFING" });
            }}
          />
        )}

        {(shiftState.phase === "BRIEFING" ||
          shiftState.phase === "briefing") && (
          <BriefingScreen
            onCompleteBriefing={() =>
              activeEngine.dispatch({ type: "COMPLETE_BRIEFING" })
            }
          />
        )}

        {(shiftState.phase === "PATROL_MAP" ||
          shiftState.phase === "patrol") && (
          <MountainMap
            incidentsCompleted={shiftState.incidentsCompleted}
            activeAmbientEvent={shiftState.activeAmbientEvent}
            operationalState={shiftState.operationalState}
            onTriggerAmbientEvent={() => {
              activeEngine.dispatch({ type: "TRIGGER_AMBIENT_EVENT" });
            }}
            onResolveAmbientOption={(selectedOptionId) => {
              activeEngine.dispatch({
                type: "RESOLVE_AMBIENT_EVENT",
                selectedOptionId,
              });
            }}
            onDismissAmbientEvent={() => {
              activeEngine.dispatch({ type: "DISMISS_AMBIENT_EVENT" });
            }}
            onAwaitDispatch={() => {
              const nextScenario =
                availableScenarios[
                  shiftState.incidentsCompleted % availableScenarios.length
                ] ?? availableScenarios[0];
              activeEngine.dispatch({
                type: "RECEIVE_DISPATCH",
                scenarioId: nextScenario.id,
              });
            }}
            onCompleteShift={() =>
              activeEngine.dispatch({ type: "COMPLETE_SHIFT" })
            }
          />
        )}

        {shiftState.phase === "DISPATCH" && (
          <DispatchOverlay
            scenario={currentScenario}
            onAcknowledge={() => {
              activeEngine.dispatch({ type: "ACCEPT_DISPATCH" });
              activeEngine.dispatch({ type: "ARRIVE_ON_SCENE" });
            }}
          />
        )}

        {(shiftState.phase === "RESPONDING" ||
          shiftState.phase === "SCENE" ||
          shiftState.phase === "incident") && (
          <SceneInteraction
            scenario={currentScenario}
            actionHistory={shiftState.actionHistory}
            vitalsHistory={shiftState.vitalsHistory}
            currentVitals={shiftState.currentVitals}
            revealedPatient={shiftState.revealedPatient}
            revealedEnvironment={shiftState.revealedEnvironment}
            revealedActors={shiftState.revealedActors}
            sceneSafetyStatus={shiftState.sceneSafetyStatus}
            patientCondition={shiftState.patientCondition}
            activeEvents={shiftState.activeEvents}
            onExecuteAction={(action) =>
              activeEngine.dispatch({ type: "RECORD_ACTION", action })
            }
            onPrepareTransport={() => {
              activeEngine.dispatch({ type: "COMPLETE_SCENE" });
              activeEngine.dispatch({ type: "BEGIN_TRANSPORT" });
            }}
            onCheckVitals={() => {
              activeEngine.dispatch({
                type: "CHECK_VITALS",
                vitals:
                  currentScenario?.patient?.vitals ??
                  currentScenario?.initialVitals,
              });
            }}
            onAssessSceneSafety={() => {
              activeEngine.dispatch({ type: "ASSESS_SCENE_SAFETY" });
            }}
            onDialogueChoice={(event) => {
              activeEngine.dispatch({ type: "PUSH_EVENT", event });
            }}
          />
        )}

        {(shiftState.phase === "TRANSPORT_PREP" ||
          shiftState.phase === "OET") && (
          <OetCanvas
            scenario={currentScenario}
            onRecordEvent={(event) =>
              activeEngine.dispatch({ type: "PUSH_EVENT", event })
            }
            onArriveAtBase={() =>
              activeEngine.dispatch({ type: "ARRIVE_AT_BASE" })
            }
          />
        )}

        {shiftState.phase === "HANDOFF" && (
          <HandoffPanel
            scenario={currentScenario}
            actionHistory={shiftState.actionHistory}
            vitalsHistory={shiftState.vitalsHistory}
            revealedPatient={shiftState.revealedPatient}
            revealedEnvironment={shiftState.revealedEnvironment}
            timeElapsedMinutes={shiftState.timeElapsedMinutes}
            patientCondition={shiftState.patientCondition}
            onCompleteHandoff={() =>
              activeEngine.dispatch({ type: "COMPLETE_HANDOFF" })
            }
          />
        )}

        {(shiftState.phase === "DEBRIEF" || shiftState.phase === "debrief") && (
          <DebriefScreen
            scenario={currentScenario}
            result={incidentDebriefResult}
            onReturnToHub={() =>
              activeEngine.dispatch({
                type: "FINISH_DEBRIEF",
              })
            }
            onReplayIncident={() =>
              activeEngine.dispatch({ type: "REPLAY_INCIDENT" })
            }
          />
        )}

        {(shiftState.phase === "SHIFT_COMPLETE" ||
          shiftState.phase === "completed") && (
          <ShiftSummary
            shiftState={shiftState}
            eventHistory={activeEngine.getEventHistory()}
            onResetShift={handleReset}
          />
        )}
      </div>

      {/* Milestone Roadmap Box */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300">
          <IconRoute className="w-4 h-4 text-brand-cyan" />
          <span>Milestone Roadmap (Epic #744)</span>
        </div>
        <ul className="text-[11px] font-mono text-zinc-400 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <li className="text-brand-cyan flex items-center gap-1.5">
            <IconCheck className="w-3 h-3" /> M1: Route Scaffold &amp;
            lib/patrol
          </li>
          <li className="text-brand-cyan flex items-center gap-1.5">
            <IconCheck className="w-3 h-3" /> M2: Shift State Machine (#748)
          </li>
          <li className="text-brand-cyan flex items-center gap-1.5">
            <IconCheck className="w-3 h-3" /> M3: Mountain Map Hub (#749)
          </li>
          <li className="text-brand-cyan flex items-center gap-1.5">
            <IconCheck className="w-3 h-3" /> M4: OET Mini-Game (#750)
          </li>
          <li className="text-brand-cyan flex items-center gap-1.5">
            <IconCheck className="w-3 h-3" /> M5: OEC Clinical (#751)
          </li>
          <li className="text-brand-cyan flex items-center gap-1.5">
            <IconCheck className="w-3 h-3" /> M6: Multi-Scenario (#752)
          </li>
          <li className="text-white font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            M7: Contextual Debrief (#753)
          </li>
        </ul>
      </div>
    </div>
  );
};
