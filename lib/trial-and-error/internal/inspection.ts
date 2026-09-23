import type {
  HandEvaluation,
  QcFinding,
  QcReport,
  StagedTable,
} from "../types";

/** Review progress on one staged output. Serializable. */
export interface InspectionState {
  /** Inspected cells as `row:col`, in inspection order. */
  inspectedCells: string[];
  resolvedFindingIds: string[];
}

/** Review status of one displayed cell. */
export type DeskCellStatus = "UNREVIEWED" | "CLEAN" | "REDLINE" | "CORRECTED";

/** One grid cell as the review surface should render it. */
export interface DeskCellView {
  row: number;
  col: number;
  /** The corrected value once every finding on the cell is resolved. */
  display: string;
  observed: string;
  status: DeskCellStatus;
  findingIds: string[];
}

/** What the review surface renders for one staged output. */
export interface InspectionView {
  cells: DeskCellView[][];
  /** Findings revealed by inspection, in validator order. */
  visibleFindings: QcFinding[];
  /** Revealed findings not yet corrected. */
  openFindings: QcFinding[];
  reviewedCells: number;
  totalCells: number;
}

/** The result of a review action: the next state, or a refusal. */
export type InspectionOutcome =
  | { ok: true; inspection: InspectionState; message: string }
  | { ok: false; message: string };

const cellKey = (row: number, col: number) => `${row}:${col}`;

/** A fresh, unreviewed inspection. */
export function createInspectionState(): InspectionState {
  return { inspectedCells: [], resolvedFindingIds: [] };
}

/** Reveals the findings on one cell. Re-inspecting a cell is a no-op. */
export function inspectCell(
  table: StagedTable,
  report: QcReport,
  inspection: InspectionState,
  row: number,
  col: number
): InspectionOutcome {
  const rowLabel = table.rows[row]?.label;
  const colLabel = table.columns[col]?.label;
  if (rowLabel === undefined || colLabel === undefined) {
    return { ok: false, message: "That cell is outside the table." };
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
    ok: true,
    message,
    inspection: {
      ...inspection,
      inspectedCells: inspection.inspectedCells.includes(key)
        ? inspection.inspectedCells
        : [...inspection.inspectedCells, key],
    },
  };
}

/** Corrects a revealed, still-open finding. */
export function correctFinding(
  report: QcReport,
  inspection: InspectionState,
  findingId: string
): InspectionOutcome {
  const target = report.findings.find((f) => f.id === findingId);
  const revealed =
    target !== undefined &&
    inspection.inspectedCells.includes(
      cellKey(target.cell.row, target.cell.col)
    );
  if (
    !target ||
    !revealed ||
    inspection.resolvedFindingIds.includes(target.id)
  ) {
    return {
      ok: false,
      message:
        "Inspect the cell to reveal an open finding before correcting it.",
    };
  }
  return {
    ok: true,
    message: `Corrected ${target.observed} to ${target.expected} under ${target.ruleId}.`,
    inspection: {
      ...inspection,
      resolvedFindingIds: [...inspection.resolvedFindingIds, target.id],
    },
  };
}

/** Findings the reviewer has revealed on this output. */
export function visibleFindingIds(
  report: QcReport,
  inspection: InspectionState
): string[] {
  const inspected = new Set(inspection.inspectedCells);
  return report.findings
    .filter((f) => inspected.has(cellKey(f.cell.row, f.cell.col)))
    .map((f) => f.id);
}

/** Cell statuses and revealed findings for the review surface. */
export function deriveInspectionView(
  table: StagedTable,
  report: QcReport,
  inspection: InspectionState
): InspectionView {
  const inspected = new Set(inspection.inspectedCells);
  const resolved = new Set(inspection.resolvedFindingIds);
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

  return {
    cells,
    visibleFindings,
    openFindings,
    reviewedCells: inspected.size,
    totalCells: table.rows.length * table.columns.length,
  };
}

/** The +Mult a hand would carry before redline penalties: the slash display. */
export function unpenalizedMult(evaluation: HandEvaluation): number {
  const redlinePenalty = evaluation.ruleResults
    .filter((r) => r.multDelta < 0)
    .reduce((total, r) => total - r.multDelta, 0);
  return Math.max(
    0,
    evaluation.mult.base +
      evaluation.mult.cardsAndRules +
      evaluation.mult.relics +
      redlinePenalty
  );
}
