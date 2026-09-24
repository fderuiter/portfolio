/**
 * Trial & Error: Biostat Ops — public domain API.
 *
 * A poker-themed deckbuilder in which clinical outputs form scoring hands.
 * Everything exported here is pure and deterministic; React components are
 * thin adapters over it. Internals under `internal/` are private (ADR 0046).
 */
export * from "./types";
export {
  ACT_I,
  ACT_I_CRISES,
  DEMOGRAPHICS_SCENARIO,
  DOSE_ESCALATION_SCENARIO,
  SCENARIOS,
  SPONSOR_SAFETY_SCENARIO,
} from "./scenarios";
export { roundRatio, decimalPlaces } from "./internal/rounding";
export {
  HAND_BASE_SCORES,
  HAND_NAMES,
  classifyHand,
  type ClassifiableCard,
} from "./internal/hands";
export { validate } from "./internal/validator";
export {
  evaluateHand,
  ruleResultsFor,
  type RuleResultOptions,
} from "./internal/scoring";
export {
  CPU_COSTS,
  canAfford,
  costOf,
  cpuReducer,
  type CpuAction,
  type CpuEvent,
  type CpuLedger,
} from "./internal/cpu";
export {
  createDeskState,
  advanceDesk,
  deriveDeskView,
  type DeskAction,
  type DeskEvent,
  type DeskState,
  type DeskStatus,
  type DeskView,
} from "./internal/desk";
export {
  createInspectionState,
  type DeskCellStatus,
  type DeskCellView,
  type InspectionState,
  type InspectionView,
} from "./internal/inspection";
export {
  createTableState,
  advanceTable,
  deriveTableView,
  type PlayedHand,
  type TableAction,
  type TableCardView,
  type TableEvent,
  type TableInspectionView,
  type TableState,
  type TableView,
  STALE_ALERT,
  EMPTY_SHELL_ALERT,
  CONSUMABLE_SLOTS,
  cardShortName,
  carriedInventory,
  previewAllocation,
  studyHistory,
  FIREWALL_ALERT,
  FIREWALL_CELL,
  type AllocationOption,
  type Consumable,
  type CrisisChoiceView,
  type CrisisView,
  type Inventory,
  type StudyHistory,
} from "./internal/table";
export {
  applyTransition,
  membership,
  sameMembership,
  snapshotRef,
  type SnapshotInvalidation,
  type TransitionOutcome,
} from "./internal/snapshots";
export { compileDraft, compileShell } from "./internal/compile";
export { drawInt, uniformAt } from "./internal/rng";
export {
  scoreTimeline,
  type TimelineContext,
  type TimelineRunning,
  type TimelineStep,
} from "./internal/timeline";
export {
  createRunState,
  advanceRun,
  deriveRunView,
  runBlinds,
  DEFAULT_SEED,
  type RunAction,
  type RunDraw,
  type RunPhase,
  type RunState,
  type RunView,
} from "./internal/run";
