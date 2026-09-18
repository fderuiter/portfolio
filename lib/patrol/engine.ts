import type {
  ShiftState,
  ShiftPhase,
  ScenarioAction,
  PatrolEvent,
  ShiftEngineEvent,
  PatrolScenario,
  PatrolShiftEngineOptions,
  PatrolShiftEngine,
} from "./types";

/**
 * Creates the initial shift state.
 */
export function createInitialShiftState(
  scenarioId: string | null = null,
  initialPhase?: ShiftPhase
): ShiftState {
  const phase: ShiftPhase = initialPhase ?? (scenarioId ? "briefing" : "INTRO");
  return {
    currentScenarioId: scenarioId,
    phase,
    timeElapsedMinutes: 0,
    score: 100,
    incidentsCompleted: 0,
    activeEvents: [],
    actionHistory: [],
    vitalsHistory: [],
    isCompleted: false,
  };
}

/**
 * Legacy transition helper maintained for backward compatibility.
 */
export function transitionShiftPhase(
  currentState: ShiftState,
  nextPhase: ShiftPhase
): ShiftState {
  return {
    ...currentState,
    phase: nextPhase,
    isCompleted: nextPhase === "completed" || nextPhase === "SHIFT_COMPLETE",
  };
}

/**
 * Legacy record action helper maintained for backward compatibility.
 */
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

/**
 * Legacy event push helper.
 */
export function pushEvent(
  currentState: ShiftState,
  event: PatrolEvent
): ShiftState {
  return {
    ...currentState,
    activeEvents: [event, ...currentState.activeEvents],
  };
}

/**
 * Pure, deterministic FSM transition reducer for Patrol Shift.
 *
 * Implements the lifecycle:
 * INTRO → BRIEFING → PATROL_MAP → DISPATCH → RESPONDING → SCENE →
 * TRANSPORT_PREP → OET → HANDOFF → DEBRIEF → PATROL_MAP → SHIFT_COMPLETE
 *
 * Boundary Defense (AGENTS.md §11):
 * Invalid transitions leave the current state reference unchanged without throwing.
 */
export function reduceShiftState(
  state: ShiftState,
  event: ShiftEngineEvent
): ShiftState {
  switch (event.type) {
    case "START_SHIFT": {
      if (state.phase === "INTRO" || state.phase === "briefing") {
        return {
          ...state,
          phase: "BRIEFING",
        };
      }
      return state;
    }

    case "COMPLETE_BRIEFING": {
      if (state.phase === "BRIEFING" || state.phase === "briefing") {
        return {
          ...state,
          phase: "PATROL_MAP",
        };
      }
      return state;
    }

    case "RECEIVE_DISPATCH": {
      if (state.phase === "PATROL_MAP" || state.phase === "patrol") {
        return {
          ...state,
          phase: "DISPATCH",
          currentScenarioId: event.scenarioId ?? state.currentScenarioId,
        };
      }
      return state;
    }

    case "ACCEPT_DISPATCH": {
      if (state.phase === "DISPATCH") {
        return {
          ...state,
          phase: "RESPONDING",
        };
      }
      return state;
    }

    case "ARRIVE_ON_SCENE": {
      if (state.phase === "RESPONDING" || state.phase === "patrol") {
        return {
          ...state,
          phase: "SCENE",
        };
      }
      return state;
    }

    case "COMPLETE_SCENE": {
      if (state.phase === "SCENE" || state.phase === "incident") {
        return {
          ...state,
          phase: "TRANSPORT_PREP",
        };
      }
      return state;
    }

    case "BEGIN_TRANSPORT": {
      if (state.phase === "TRANSPORT_PREP") {
        return {
          ...state,
          phase: "OET",
        };
      }
      return state;
    }

    case "ARRIVE_AT_BASE": {
      if (state.phase === "OET") {
        return {
          ...state,
          phase: "HANDOFF",
        };
      }
      return state;
    }

    case "COMPLETE_HANDOFF": {
      if (state.phase === "HANDOFF") {
        return {
          ...state,
          phase: "DEBRIEF",
        };
      }
      return state;
    }

    case "FINISH_DEBRIEF": {
      if (state.phase === "DEBRIEF" || state.phase === "debrief") {
        return {
          ...state,
          phase: "PATROL_MAP",
          incidentsCompleted: state.incidentsCompleted + 1,
          currentScenarioId: null,
        };
      }
      return state;
    }

    case "COMPLETE_SHIFT": {
      if (state.phase === "PATROL_MAP" || state.phase === "patrol") {
        return {
          ...state,
          phase: "SHIFT_COMPLETE",
          isCompleted: true,
        };
      }
      return state;
    }

    case "RECORD_ACTION": {
      if (!event.action) return state;
      const timeIncrement = event.action.costMinutes ?? 1;
      return {
        ...state,
        timeElapsedMinutes: state.timeElapsedMinutes + timeIncrement,
        actionHistory: [...state.actionHistory, event.action],
      };
    }

    case "PUSH_EVENT": {
      if (!event.event) return state;
      return {
        ...state,
        activeEvents: [event.event, ...state.activeEvents],
      };
    }

    case "RESET": {
      return createInitialShiftState(null, "INTRO");
    }

    default:
      return state;
  }
}

/**
 * Headless Patrol Shift Engine instance.
 * Decouples presentation from FSM state machine and scenario state.
 */
class PatrolShiftEngineImpl implements PatrolShiftEngine {
  private state: ShiftState;
  private loadedScenario: PatrolScenario | null = null;
  private readonly scenarios: Map<string, PatrolScenario> = new Map();
  private readonly eventHistory: PatrolEvent[] = [];
  private readonly listeners: Set<() => void> = new Set();

  constructor(
    scenarios: PatrolScenario[] = [],
    options: PatrolShiftEngineOptions = {}
  ) {
    for (const s of scenarios) {
      this.scenarios.set(s.id, s);
    }

    const firstScenario = scenarios[0] ?? null;
    this.loadedScenario = firstScenario;

    this.state = createInitialShiftState(
      firstScenario?.id ?? null,
      options.initialPhase ?? "INTRO"
    );

    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.getLoadedScenario = this.getLoadedScenario.bind(this);
    this.loadScenario = this.loadScenario.bind(this);
    this.getEventHistory = this.getEventHistory.bind(this);
  }

  getState(): ShiftState {
    return this.state;
  }

  getLoadedScenario(): PatrolScenario | null {
    return this.loadedScenario;
  }

  loadScenario(scenario: PatrolScenario): void {
    this.loadedScenario = scenario;
    this.scenarios.set(scenario.id, scenario);
    if (this.state.currentScenarioId !== scenario.id) {
      this.state = {
        ...this.state,
        currentScenarioId: scenario.id,
      };
      this.notify();
    }
  }

  getEventHistory(): PatrolEvent[] {
    return [...this.eventHistory];
  }

  dispatch(event: ShiftEngineEvent): void {
    const prevPhase = this.state.phase;
    const nextState = reduceShiftState(this.state, event);

    if (event.scenarioId && event.scenarioId !== this.state.currentScenarioId) {
      const targetScenario = this.scenarios.get(event.scenarioId);
      if (targetScenario) {
        this.loadedScenario = targetScenario;
      }
    }

    if (nextState.phase !== prevPhase) {
      this.recordEvent({
        timestamp: event.timestamp ?? Date.now(),
        scenarioId: nextState.currentScenarioId ?? "hub",
        action: `PHASE_TRANSITION:${prevPhase}->${nextState.phase}`,
        context: { from: prevPhase, to: nextState.phase, ...event.payload },
      });
    }

    if (event.type === "RECORD_ACTION" && event.action) {
      this.recordEvent({
        timestamp: event.timestamp ?? Date.now(),
        scenarioId: nextState.currentScenarioId ?? "unknown",
        action: event.action.id,
        context: {
          label: event.action.label,
          category: event.action.category,
          costMinutes: event.action.costMinutes,
          ...event.payload,
        },
      });
    }

    if (event.type === "PUSH_EVENT" && event.event) {
      this.recordEvent(event.event);
    }

    if (nextState !== this.state) {
      this.state = nextState;
      this.notify();
    }
  }

  private recordEvent(event: PatrolEvent): void {
    this.eventHistory.push(event);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("Error in PatrolShiftEngine listener:", err);
      }
    }
  }
}

/**
 * Factory creating a headless Patrol Shift simulation engine instance.
 */
export function createPatrolShiftEngine(
  scenarios: PatrolScenario[] = [],
  options: PatrolShiftEngineOptions = {}
): PatrolShiftEngine {
  return new PatrolShiftEngineImpl(scenarios, options);
}
