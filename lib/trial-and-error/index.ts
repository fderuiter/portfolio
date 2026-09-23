/**
 * Trial & Error: Biostat Ops — public domain API.
 *
 * A poker-themed deckbuilder in which clinical outputs form scoring hands.
 * Everything exported here is pure and deterministic; React components are
 * thin adapters over it. Internals under `internal/` are private (ADR 0046).
 */
export * from "./types";
export { DEMOGRAPHICS_SCENARIO, SCENARIOS } from "./scenarios";
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
} from "./internal/table";
export {
  scoreTimeline,
  type TimelineContext,
  type TimelineRunning,
  type TimelineStep,
} from "./internal/timeline";
