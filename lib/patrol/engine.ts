import type {
  ShiftState,
  ShiftPhase,
  ScenarioAction,
  PatrolEvent,
} from "./types";

/**
 * Stub Shift FSM Engine for Patrol Shift simulation.
 */
export function createInitialShiftState(
  scenarioId: string | null = null
): ShiftState {
  return {
    currentScenarioId: scenarioId,
    phase: scenarioId ? "briefing" : "patrol",
    timeElapsedMinutes: 0,
    score: 100,
    activeEvents: [],
    actionHistory: [],
    vitalsHistory: [],
    isCompleted: false,
  };
}

export function transitionShiftPhase(
  currentState: ShiftState,
  nextPhase: ShiftPhase
): ShiftState {
  return {
    ...currentState,
    phase: nextPhase,
    isCompleted: nextPhase === "completed",
  };
}

export function recordAction(
  currentState: ShiftState,
  action: ScenarioAction
): ShiftState {
  const timeIncrement = action.costMinutes ?? 1;
  return {
    ...currentState,
    timeElapsedMinutes: currentState.timeElapsedMinutes + timeIncrement,
    actionHistory: [...currentState.actionHistory, action],
  };
}

export function pushEvent(
  currentState: ShiftState,
  event: PatrolEvent
): ShiftState {
  return {
    ...currentState,
    activeEvents: [event, ...currentState.activeEvents],
  };
}
