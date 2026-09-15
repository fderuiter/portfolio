/**
 * Public type definitions for the Patrol Shift simulation domain.
 *
 * Provides core interfaces for scenario modeling, shift FSM states,
 * events, actions, OET engine state, and debrief scoring rules.
 */

export type ShiftPhase =
  "briefing" | "patrol" | "incident" | "debrief" | "completed";

export interface VitalsData {
  heartRate?: number;
  respiration?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  temperature?: number;
  gcs?: number;
}

export type IncidentSeverity = "info" | "warning" | "critical";

export interface PatrolEvent {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  severity?: IncidentSeverity;
  payload?: Record<string, unknown>;
}

export type ActionCategory =
  "assessment" | "treatment" | "communication" | "transport" | "decision";

export interface ScenarioAction {
  id: string;
  label: string;
  description?: string;
  category?: ActionCategory;
  costMinutes?: number;
  requiredEquipment?: string[];
}

export interface DebriefRule {
  id: string;
  title: string;
  category: string;
  passed: boolean;
  score: number;
  feedback: string;
}

export interface PatrolScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  location: string;
  initialVitals?: VitalsData;
  actions: ScenarioAction[];
  debriefRules: DebriefRule[];
}

export interface ShiftState {
  currentScenarioId: string | null;
  phase: ShiftPhase;
  timeElapsedMinutes: number;
  score: number;
  activeEvents: PatrolEvent[];
  actionHistory: ScenarioAction[];
  vitalsHistory: VitalsData[];
  isCompleted: boolean;
}

export interface DebriefReport {
  scenarioId: string;
  totalTimeMinutes: number;
  score: number;
  maxPossibleScore: number;
  passedRules: DebriefRule[];
  failedRules: DebriefRule[];
  summary: string;
}

export interface OETEngineState {
  evaluatedCount: number;
  rulesPassed: number;
  rulesFailed: number;
}
