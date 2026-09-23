import type {
  HandEvaluation,
  QcFinding,
  QcReport,
  Scenario,
  StagedTable,
} from "../types";
import { CPU_COSTS, canAfford, cpuReducer, type CpuLedger } from "./cpu";
import { evaluateHand, ruleResultsFor } from "./scoring";
import { validate } from "./validator";

/** Where the Blind stands. */
export type DeskStatus = "REVIEWING" | "CLEARED" | "FAILED";

/** The most recent outcome, phrased for a polite live announcement. */
export interface DeskEvent {
  kind:
    "INSPECTED" | "CORRECTED" | "PLAYED" | "DISCARDED" | "REFUSED" | "RESET";
  message: string;
  /** Increments on every event so repeated messages are still announced. */
  sequence: number;
}

/** Serializable QC Desk state. Contains no derived or browser data. */
export interface DeskState {
  scenarioId: string;
  /** Position in the scenario's fixed draw pile of the staged draft. */
  drawIndex: number;
  cpu: CpuLedger;
  roundScore: number;
  handsPlayed: number;
  discards: number;
  /** Inspected cells of the staged draft as `row:col`, in inspection order. */
  inspectedCells: string[];
  resolvedFindingIds: string[];
  status: DeskStatus;
  lastEvaluation: HandEvaluation | null;
  lastEvent: DeskEvent | null;
}

/** Player intents the desk reducer accepts. */
export type DeskAction =
  | { type: "INSPECT_CELL"; row: number; col: number }
  | { type: "CORRECT_FINDING"; findingId: string }
  | { type: "PLAY_HAND" }
  | { type: "DISCARD" }
  | { type: "RESET" };

/** Review status of one displayed cell. */
export type DeskCellStatus = "UNREVIEWED" | "CLEAN" | "REDLINE" | "CORRECTED";

/** One grid cell as the HUD should render it. */
export interface DeskCellView {
  row: number;
  col: number;
  /** The corrected value once every finding on the cell is resolved. */
  display: string;
  observed: string;
  status: DeskCellStatus;
  findingIds: string[];
}

/** Everything the HUD renders, derived purely from scenario and state. */
export interface DeskView {
  table: StagedTable | null;
  cells: DeskCellView[][];
  /** Findings revealed by inspection, in validator order. */
  visibleFindings: QcFinding[];
  /** Revealed findings not yet corrected. */
  openFindings: QcFinding[];
  /** Expected hand value from what the reviewer has seen so far. */
  expected: HandEvaluation | null;
  /** The expected +Mult before redline penalties, for the slash display. */
  unpenalizedMult: number;
  reviewedCells: number;
  totalCells: number;
  quota: number;
  remainingDraws: number;
  canPlay: boolean;
  canDiscard: boolean;
}

const cellKey = (row: number, col: number) => `${row}:${col}`;

/** Fresh desk state for a scenario: first draft staged, full CPU. */
export function createDeskState(scenario: Scenario): DeskState {
  return {
    scenarioId: scenario.id,
    drawIndex: 0,
    cpu: { available: scenario.startingCpu, spent: 0 },
    roundScore: 0,
    handsPlayed: 0,
    discards: 0,
    inspectedCells: [],
    resolvedFindingIds: [],
    status: "REVIEWING",
    lastEvaluation: null,
    lastEvent: null,
  };
}

function stagedTable(scenario: Scenario, state: DeskState): StagedTable | null {
  return state.status === "REVIEWING"
    ? (scenario.drawPile[state.drawIndex] ?? null)
    : null;
}

function reportFor(scenario: Scenario, table: StagedTable): QcReport {
  return validate(table, scenario.populationSnapshot, scenario.rulebook);
}

function scoreHand(
  scenario: Scenario,
  report: QcReport,
  resolvedFindingIds: readonly string[],
  visibleFindingIds?: readonly string[]
): HandEvaluation {
  return evaluateHand({
    handType: scenario.handType,
    cards: [
      {
        id: scenario.shell.id,
        chips: scenario.shell.chips,
        mult: scenario.shell.mult,
      },
    ],
    ruleResults: ruleResultsFor(report, scenario.rulebook, {
      resolvedFindingIds,
      visibleFindingIds,
    }),
  });
}

function withEvent(
  state: DeskState,
  kind: DeskEvent["kind"],
  message: string
): DeskEvent {
  return { kind, message, sequence: (state.lastEvent?.sequence ?? 0) + 1 };
}

/** Moves to the next draft, ending the Blind when no hand can follow. */
function drawNext(scenario: Scenario, state: DeskState): DeskState {
  const drawIndex = state.drawIndex + 1;
  const exhausted =
    drawIndex >= scenario.drawPile.length || !canAfford(state.cpu, "PLAY_HAND");
  return {
    ...state,
    drawIndex,
    inspectedCells: [],
    resolvedFindingIds: [],
    status: exhausted ? "FAILED" : "REVIEWING",
  };
}

/**
 * Pure QC Desk reducer. Validation and scoring never consult randomness, so
 * the same scenario and action sequence always yields the same state.
 */
export function advanceDesk(
  scenario: Scenario,
  state: DeskState,
  action: DeskAction
): DeskState {
  if (action.type === "RESET") {
    return {
      ...createDeskState(scenario),
      lastEvent: withEvent(state, "RESET", `${scenario.blind.name} restarted.`),
    };
  }

  const table = stagedTable(scenario, state);
  if (!table) {
    return {
      ...state,
      lastEvent: withEvent(
        state,
        "REFUSED",
        "The Blind is over. Restart to play again."
      ),
    };
  }
  const report = reportFor(scenario, table);

  switch (action.type) {
    case "INSPECT_CELL": {
      const { row, col } = action;
      const rowLabel = table.rows[row]?.label;
      const colLabel = table.columns[col]?.label;
      if (rowLabel === undefined || colLabel === undefined) {
        return {
          ...state,
          lastEvent: withEvent(
            state,
            "REFUSED",
            "That cell is outside the table."
          ),
        };
      }
      const key = cellKey(row, col);
      const found = report.findings.filter(
        (f) => f.cell.row === row && f.cell.col === col
      );
      const message =
        found.length === 0
          ? `${rowLabel}, ${colLabel}: clean.`
          : `${rowLabel}, ${colLabel}: ${found.length} redline${found.length === 1 ? "" : "s"}. ${found.map((f) => `${f.category} (${f.severity})`).join(", ")}.`;
      return {
        ...state,
        inspectedCells: state.inspectedCells.includes(key)
          ? state.inspectedCells
          : [...state.inspectedCells, key],
        lastEvent: withEvent(state, "INSPECTED", message),
      };
    }

    case "CORRECT_FINDING": {
      const target = report.findings.find((f) => f.id === action.findingId);
      const revealed =
        target !== undefined &&
        state.inspectedCells.includes(
          cellKey(target.cell.row, target.cell.col)
        );
      if (
        !target ||
        !revealed ||
        state.resolvedFindingIds.includes(target.id)
      ) {
        return {
          ...state,
          lastEvent: withEvent(
            state,
            "REFUSED",
            "Inspect the cell to reveal an open finding before correcting it."
          ),
        };
      }
      return {
        ...state,
        resolvedFindingIds: [...state.resolvedFindingIds, target.id],
        lastEvent: withEvent(
          state,
          "CORRECTED",
          `Corrected ${target.observed} to ${target.expected} under ${target.ruleId}.`
        ),
      };
    }

    case "PLAY_HAND": {
      if (!canAfford(state.cpu, "PLAY_HAND")) {
        return {
          ...state,
          lastEvent: withEvent(
            state,
            "REFUSED",
            `Approve & Play needs ${CPU_COSTS.PLAY_HAND} CPU.`
          ),
        };
      }
      const evaluation = scoreHand(scenario, report, state.resolvedFindingIds);
      const roundScore = state.roundScore + evaluation.score;
      const played: DeskState = {
        ...state,
        cpu: cpuReducer(state.cpu, { type: "SPEND", action: "PLAY_HAND" }),
        roundScore,
        handsPlayed: state.handsPlayed + 1,
        lastEvaluation: evaluation,
      };
      const cleared = roundScore >= scenario.blind.quota;
      const next: DeskState = cleared
        ? {
            ...played,
            status: "CLEARED",
            inspectedCells: [],
            resolvedFindingIds: [],
          }
        : drawNext(scenario, played);
      const outcome = cleared
        ? `${scenario.blind.name} cleared.`
        : next.status === "FAILED"
          ? `${scenario.blind.name} failed: no playable hands remain.`
          : `Next draft staged.`;
      const zero = evaluation.zeroRule.triggered
        ? " Zero-score rule triggered."
        : "";
      return {
        ...next,
        lastEvent: withEvent(
          state,
          "PLAYED",
          `Hand scored ${evaluation.score} (${evaluation.chips.total} Chips × ${evaluation.finalMult} Mult).${zero} Round ${roundScore} of ${scenario.blind.quota}. ${outcome}`
        ),
      };
    }

    case "DISCARD": {
      if (!canAfford(state.cpu, "DISCARD")) {
        return {
          ...state,
          lastEvent: withEvent(
            state,
            "REFUSED",
            `Reject & Discard needs ${CPU_COSTS.DISCARD} CPU.`
          ),
        };
      }
      const next = drawNext(scenario, {
        ...state,
        cpu: cpuReducer(state.cpu, { type: "SPEND", action: "DISCARD" }),
        discards: state.discards + 1,
      });
      const outcome =
        next.status === "FAILED"
          ? `${scenario.blind.name} failed: no playable hands remain.`
          : `${scenario.drawPile[next.drawIndex].draftLabel} staged.`;
      return {
        ...next,
        lastEvent: withEvent(
          state,
          "DISCARDED",
          `${table.draftLabel} rejected. ${outcome}`
        ),
      };
    }
  }
}

/** Derives everything the HUD renders. Pure; safe to call on every render. */
export function deriveDeskView(scenario: Scenario, state: DeskState): DeskView {
  const table = stagedTable(scenario, state);
  const remainingDraws = Math.max(
    0,
    scenario.drawPile.length - state.drawIndex
  );
  const base = {
    quota: scenario.blind.quota,
    remainingDraws,
  };
  if (!table) {
    return {
      ...base,
      table: null,
      cells: [],
      visibleFindings: [],
      openFindings: [],
      expected: null,
      unpenalizedMult: 0,
      reviewedCells: 0,
      totalCells: 0,
      canPlay: false,
      canDiscard: false,
    };
  }

  const report = reportFor(scenario, table);
  const inspected = new Set(state.inspectedCells);
  const resolved = new Set(state.resolvedFindingIds);
  const visibleFindings = report.findings.filter((f) =>
    inspected.has(cellKey(f.cell.row, f.cell.col))
  );
  const openFindings = visibleFindings.filter((f) => !resolved.has(f.id));

  const cells = table.rows.map((_, row) =>
    table.columns.map((__, col): DeskCellView => {
      const observed = table.cells[row][col];
      const onCell = report.findings.filter(
        (f) => f.cell.row === row && f.cell.col === col
      );
      const allResolved = onCell.every((f) => resolved.has(f.id));
      let status: DeskCellStatus = "UNREVIEWED";
      if (inspected.has(cellKey(row, col))) {
        status =
          onCell.length === 0 ? "CLEAN" : allResolved ? "CORRECTED" : "REDLINE";
      }
      return {
        row,
        col,
        observed,
        display: status === "CORRECTED" ? onCell[0].expected : observed,
        status,
        findingIds: status === "UNREVIEWED" ? [] : onCell.map((f) => f.id),
      };
    })
  );

  const expected = scoreHand(
    scenario,
    report,
    state.resolvedFindingIds,
    visibleFindings.map((f) => f.id)
  );
  const redlinePenalty = expected.ruleResults
    .filter((r) => r.multDelta < 0)
    .reduce((total, r) => total - r.multDelta, 0);

  return {
    ...base,
    table,
    cells,
    visibleFindings,
    openFindings,
    expected,
    unpenalizedMult: Math.max(
      0,
      expected.mult.base +
        expected.mult.cardsAndRules +
        expected.mult.relics +
        redlinePenalty
    ),
    reviewedCells: inspected.size,
    totalCells: table.rows.length * table.columns.length,
    canPlay: canAfford(state.cpu, "PLAY_HAND"),
    canDiscard: canAfford(state.cpu, "DISCARD"),
  };
}
