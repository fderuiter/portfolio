import type { StagedTable, TableShellSpec } from "../types";

/** The DMC session a Blind is in. Blinded outputs are face down in OPEN. */
export type DmcSession = "OPEN" | "CLOSED";

/** The structural checks that run across the firewall without reading a value. */
export type StructuralCheck = "COLUMN_BALANCE" | "MISSING_DATA" | "FORMAT";

/** One structural check's outcome. Its detail names columns and rows only. */
export interface StructuralCheckResult {
  check: StructuralCheck;
  label: string;
  passed: boolean;
  detail: string;
}

/** Structural QC of one blinded output: shape, completeness and format. */
export interface StructuralQcReport {
  checks: StructuralCheckResult[];
  passed: boolean;
}

/** What an entry in the DMC access history records. */
export type AccessKind =
  | "STRUCTURAL_QC"
  | "UNAUTHORIZED_UNBLINDING"
  | "SESSION_CLOSED"
  | "SESSION_OPENED";

/** One entry in the Blind's DMC access history. */
export interface AccessRecord {
  /** 1-based, in the order the accesses happened. */
  seq: number;
  kind: AccessKind;
  /** The output accessed, or null for a session change. */
  cardId: string | null;
  /** The session in force when the access happened. */
  session: DmcSession;
  /** Hands played before the access, for ordering against the score log. */
  handsPlayed: number;
  /** Whether governance allowed it. An unauthorized unblinding is a violation. */
  authorized: boolean;
  text: string;
}

/** The rule id of the zero-score rule an unauthorized unblinding triggers. */
export const UNBLINDING_RULE_ID = "DMC-FIREWALL";

const STRUCTURAL_LABELS: Readonly<Record<StructuralCheck, string>> = {
  COLUMN_BALANCE: "Column balance",
  MISSING_DATA: "Missing-data indicators",
  FORMAT: "Format compliance",
};

/** A cell's format with every number replaced, so no magnitude survives. */
const shapeOf = (value: string) =>
  value.trim().replace(/\d+(\.\d+)?/g, (m) => (m.includes(".") ? "n.n" : "n"));

/**
 * Structural QC of a blinded draft, run across the DMC firewall. It checks
 * that both treatment arms have a column (and that the columns match the
 * shell's layout when it has one), that no planned row or cell is missing,
 * and that every cell in a row prints the same format. Its results name
 * columns and rows only: no cell value, and no digit of one, reaches them.
 * Deterministic and pure.
 */
export function structuralQc(
  draft: StagedTable,
  shell: TableShellSpec | undefined
): StructuralQcReport {
  const arms = new Set(draft.columns.map((c) => c.arm));
  const missingArms = (["PLACEBO", "ACTIVE"] as const).filter(
    (a) => !arms.has(a)
  );
  const layoutColumns = shell?.layout?.columns;
  const layoutMismatch =
    layoutColumns !== undefined &&
    (layoutColumns.length !== draft.columns.length ||
      layoutColumns.some((c, i) => c.arm !== draft.columns[i].arm));
  const balance: StructuralCheckResult = {
    check: "COLUMN_BALANCE",
    label: STRUCTURAL_LABELS.COLUMN_BALANCE,
    passed: missingArms.length === 0 && !layoutMismatch,
    detail:
      missingArms.length > 0
        ? `No ${missingArms.map((a) => (a === "PLACEBO" ? "Placebo" : "Active")).join(" or ")} column.`
        : layoutMismatch
          ? `Columns ${draft.columns.map((c) => c.label).join(", ")} do not match the shell's ${layoutColumns?.map((c) => c.label).join(", ")}.`
          : `${draft.columns.map((c) => c.label).join(", ")}: one column per arm.`,
  };

  const labels = new Set(draft.rows.map((r) => r.label));
  const missingRows = (shell?.layout?.rows ?? [])
    .map((r) => r.label)
    .filter((l) => !labels.has(l));
  const emptyRows = draft.rows
    .filter((_, r) => draft.cells[r].some((v) => v.trim() === ""))
    .map((row) => row.label);
  const missing: StructuralCheckResult = {
    check: "MISSING_DATA",
    label: STRUCTURAL_LABELS.MISSING_DATA,
    passed: missingRows.length === 0 && emptyRows.length === 0,
    detail:
      missingRows.length > 0
        ? `Planned rows missing: ${missingRows.join(", ")}.`
        : emptyRows.length > 0
          ? `Empty cells in: ${emptyRows.join(", ")}.`
          : `All ${draft.rows.length} rows populated in every column.`,
  };

  const mixed = draft.rows
    .filter((_, r) => {
      const shapes = new Set(
        draft.cells[r].filter((v) => v.trim() !== "").map(shapeOf)
      );
      return shapes.size > 1;
    })
    .map((row) => row.label);
  const format: StructuralCheckResult = {
    check: "FORMAT",
    label: STRUCTURAL_LABELS.FORMAT,
    passed: mixed.length === 0,
    detail:
      mixed.length > 0
        ? `Mixed formats across arms in: ${mixed.join(", ")}.`
        : "Every row prints one format across its columns.",
  };

  const checks = [balance, missing, format];
  return { checks, passed: checks.every((c) => c.passed) };
}
