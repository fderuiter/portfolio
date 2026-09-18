/**
 * Public type definitions for the Patrol Shift simulation domain.
 *
 * Provides core interfaces for scenario modeling, shift FSM states,
 * events, actions, OET engine state, and debrief scoring rules.
 * Adheres to ADR 0026 and Issue #748.
 */

export type CanonicalShiftPhase =
  | "INTRO"
  | "BRIEFING"
  | "PATROL_MAP"
  | "DISPATCH"
  | "RESPONDING"
  | "SCENE"
  | "TRANSPORT_PREP"
  | "OET"
  | "HANDOFF"
  | "DEBRIEF"
  | "SHIFT_COMPLETE";

export type LegacyShiftPhase =
  "briefing" | "patrol" | "incident" | "debrief" | "completed";

export type ShiftPhase = CanonicalShiftPhase | LegacyShiftPhase;

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
  timestamp: number | string;
  scenarioId?: string;
  action?: string;
  context?: Record<string, unknown>;

  // Legacy / optional metadata fields
  id?: string;
  type?: string;
  title?: string;
  description?: string;
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

export interface PatientState {
  complaint?: string;
  mechanism?: string;
  vitals?: VitalsData;
  findings?: string[];
  interventions?: string[];
}

export interface EnvironmentState {
  weather?: string;
  snowConditions?: string;
  temperatureFahrenheit?: number;
  visibility?: string;
  hazards?: string[];
}

export interface PatrolActor {
  id: string;
  name: string;
  role: string;
  notes?: string;
}

export interface PatrolScenario {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  category?: string;
  estimatedMinutes?: number;
  location?: string;
  dispatchPrompt?: string;
  environment?: EnvironmentState;
  patient?: PatientState;
  actors?: PatrolActor[];
  initialVitals?: VitalsData;
  actions: ScenarioAction[];
  debriefRules: DebriefRule[];
}

export interface ShiftState {
  currentScenarioId: string | null;
  phase: ShiftPhase;
  timeElapsedMinutes: number;
  score: number;
  incidentsCompleted: number;
  activeEvents: PatrolEvent[];
  actionHistory: ScenarioAction[];
  vitalsHistory: VitalsData[];
  isCompleted: boolean;
}

export type ShiftEngineEventType =
  | "START_SHIFT"
  | "COMPLETE_BRIEFING"
  | "RECEIVE_DISPATCH"
  | "ACCEPT_DISPATCH"
  | "ARRIVE_ON_SCENE"
  | "COMPLETE_SCENE"
  | "BEGIN_TRANSPORT"
  | "ARRIVE_AT_BASE"
  | "COMPLETE_HANDOFF"
  | "FINISH_DEBRIEF"
  | "COMPLETE_SHIFT"
  | "RECORD_ACTION"
  | "PUSH_EVENT"
  | "RESET";

export interface ShiftEngineEvent {
  type: ShiftEngineEventType;
  scenarioId?: string;
  action?: ScenarioAction;
  event?: PatrolEvent;
  payload?: Record<string, unknown>;
  timestamp?: number;
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

/**
 * Condition modifiers originating from the operational briefing or scenario environment.
 */
export interface BriefingState {
  /** Snow surface condition governing friction, drag, and braking response. */
  snowCondition?: "hardpack" | "fresh" | "powder" | "ice" | string;
  /** Whether the trail width is narrowed (e.g. glade or catwalk corridor). */
  narrowTrails?: boolean;
  /** Whether tree hazards and off-piste glade obstacles are active. */
  treeHazards?: boolean;
  /** Ambient temperature in Fahrenheit. */
  temperatureFahrenheit?: number;
  /** Atmospheric visibility description. */
  visibility?: string;
}

/**
 * Real-time and debrief judgment metrics evaluating operator control during toboggan descent.
 */
export interface OetMetrics {
  /** Time spent exceeding safe descent speed threshold in seconds. */
  excessiveSpeedTime: number;
  /** Count of harsh or sudden lateral direction changes. */
  abruptDirectionChanges: number;
  /** Count of times the sled crossed outside the designated trail boundaries. */
  boundaryViolations: number;
  /** Count of physical collisions with trees, rocks, or terrain obstacles. */
  collisions: number;
  /** Count of smooth, controlled complete stops performed on the fall line. */
  controlledStops: number;
  /** Route adherence and gate traversal efficiency rating (0 - 100). */
  routeEfficiency: number;
  /** Overall OET judgment score rewarding control over speed (0 - 100). */
  judgmentScore: number;
}

/**
 * Classification of physical terrain obstacles encountered along the fall line.
 */
export type OetObstacleType = "tree" | "rock" | "ice_patch" | "mogul";

/**
 * Fixed terrain obstacle along the fall line.
 */
export interface OetObstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: OetObstacleType;
  hit?: boolean;
}

/**
 * Fall line guide gate defining safe passage corridor.
 */
export interface OetGate {
  id: string;
  y: number;
  xMin: number;
  xMax: number;
  cleared?: boolean;
  missed?: boolean;
}

/**
 * Particle entity for snow spray visual feedback.
 */
export interface SnowSprayParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

/**
 * Kinematic state of the Cascade 100 rescue toboggan and patroller operators.
 */
export interface OetSledState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speedMph: number;
  steering: number;
  chainBrakeEngaged: boolean;
  tailRopeBraking: boolean;
  isStopped: boolean;
}

/**
 * Simulation lifecycle phase of the OET descent run.
 */
export type OetDescentStatus =
  "ready" | "descending" | "stopped" | "completed" | "crashed";

/**
 * Mutable internal simulation state of the OET descent engine.
 */
export interface OetDescentState {
  sled: OetSledState;
  status: OetDescentStatus;
  conditions: BriefingState;
  trailWidth: number;
  trailLeft: number;
  trailRight: number;
  totalDistance: number;
  distanceTraveled: number;
  obstacles: OetObstacle[];
  gates: OetGate[];
  metrics: OetMetrics;
  elapsedTime: number;
  activeWarnings: string[];
}

/**
 * Immutable state snapshot consumed by React components and debrief analytics.
 */
export interface OetDescentSnapshot {
  sled: Readonly<OetSledState>;
  status: OetDescentStatus;
  conditions: Readonly<BriefingState>;
  trailWidth: number;
  trailLeft: number;
  trailRight: number;
  totalDistance: number;
  distanceTraveled: number;
  metrics: Readonly<OetMetrics>;
  elapsedTime: number;
  activeWarnings: readonly string[];
  activeParticleCount: number;
  isChainBrakeEngaged: boolean;
  isTailRopeBraking: boolean;
  isStopped: boolean;
  currentSpeedMph: number;
  judgmentScore: number;
}

/**
 * Configuration options for initializing the headless OET descent engine.
 */
export interface OetDescentEngineOptions {
  conditions?: BriefingState;
  totalDistance?: number;
  trailWidth?: number;
  seedObstacles?: boolean;
  fixedDt?: number;
}

export interface PatrolShiftEngineOptions {
  initialPhase?: ShiftPhase;
  startTime?: number;
}

export interface PatrolShiftEngine {
  getState(): ShiftState;
  dispatch(event: ShiftEngineEvent): void;
  getEventHistory(): PatrolEvent[];
  getLoadedScenario(): PatrolScenario | null;
  loadScenario(scenario: PatrolScenario): void;
  subscribe(listener: () => void): () => void;
  /** Returns the list of scenarios registered with this engine instance. */
  getScenarios?(): PatrolScenario[];
}
