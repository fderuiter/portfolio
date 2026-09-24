import type { Act, Scenario } from "../types";
import {
  advanceTable,
  carriedInventory,
  createTableState,
  deriveTableView,
  studyHistory,
  type Inventory,
  type StudyHistory,
  type TableAction,
  type TableEvent,
  type TableState,
  type TableView,
} from "./table";

/**
 * Serializable run state: which Blind of the act is being played, and that
 * Blind's Card Table. Contains no derived or browser data.
 */
export interface RunState {
  actId: string;
  /** Index into the act's Blinds, Small first. */
  blindIndex: number;
  table: TableState;
}

/**
 * Player intents the run reducer accepts. Every Card Table action except
 * RESET passes through to the current Blind; a lost Blind ends the run, so
 * the only way back is RESTART_RUN.
 */
export type RunAction =
  | Exclude<TableAction, { type: "RESET" }>
  | { type: "NEXT_BLIND" }
  | { type: "RESTART_RUN" };

/** Where the run stands. */
export type RunPhase =
  "PLAYING" | "BLIND_CLEARED" | "RUN_FAILED" | "ACT_COMPLETE";

/** Everything a run renders, derived purely from act and state. */
export interface RunView {
  blind: Scenario;
  blindIndex: number;
  blindCount: number;
  isFinalBlind: boolean;
  /** The Blind that follows this one, if any. */
  nextBlind: Scenario | null;
  phase: RunPhase;
  /** The Blind has just started: nothing has been played or discarded. */
  showIntro: boolean;
  table: TableView;
}

/** A fresh table for a Blind, announcing it with a sequence that follows `after`. */
function startBlind(
  scenario: Scenario,
  history: StudyHistory | undefined,
  inventory: Inventory | undefined,
  after: TableEvent | null,
  kind: TableEvent["kind"],
  message: string
): TableState {
  return {
    ...createTableState(scenario, history, inventory),
    lastEvent: { kind, message, sequence: (after?.sequence ?? 0) + 1 },
  };
}

/** A fresh run: the act's first Blind dealt, full CPU. */
export function createRunState(act: Act): RunState {
  return {
    actId: act.id,
    blindIndex: 0,
    table: createTableState(act.blinds[0]),
  };
}

/**
 * Pure run reducer. It composes the Card Table reducer for the current Blind
 * and moves between Blinds. The draw piles are fixed, so the same act and
 * action sequence always yields the same state.
 */
export function advanceRun(
  act: Act,
  run: RunState,
  action: RunAction
): RunState {
  const blind = act.blinds[run.blindIndex];
  const refuse = (message: string): RunState => ({
    ...run,
    table: {
      ...run.table,
      lastEvent: {
        kind: "REFUSED",
        message,
        sequence: (run.table.lastEvent?.sequence ?? 0) + 1,
      },
    },
  });

  switch (action.type) {
    case "RESTART_RUN": {
      const first = act.blinds[0];
      return {
        actId: act.id,
        blindIndex: 0,
        // A new run is a new study: its population history starts over, and
        // the tray and budget are empty again.
        table: startBlind(
          first,
          undefined,
          undefined,
          run.table.lastEvent,
          "RESET",
          `Run restarted. ${first.blind.name}.`
        ),
      };
    }
    case "NEXT_BLIND": {
      if (run.table.status !== "CLEARED") {
        return refuse(`Clear ${blind.blind.name} first.`);
      }
      const index = run.blindIndex + 1;
      if (index >= act.blinds.length) {
        return refuse(`${act.title} is complete.`);
      }
      const next = act.blinds[index];
      return {
        ...run,
        blindIndex: index,
        // The study goes on: later Blinds see every snapshot change so far,
        // and the tray and budget come along.
        table: startBlind(
          next,
          studyHistory(run.table),
          carriedInventory(run.table),
          run.table.lastEvent,
          "BLIND_STARTED",
          `${next.blind.name}. Target ${next.blind.quota}.`
        ),
      };
    }
    default:
      return { ...run, table: advanceTable(blind, run.table, action) };
  }
}

/** Derives everything a run renders. Pure; safe to call on every render. */
export function deriveRunView(act: Act, run: RunState): RunView {
  const { blindIndex } = run;
  const blind = act.blinds[blindIndex];
  const isFinalBlind = blindIndex === act.blinds.length - 1;
  const phase: RunPhase =
    run.table.status === "CLEARED"
      ? isFinalBlind
        ? "ACT_COMPLETE"
        : "BLIND_CLEARED"
      : run.table.status === "FAILED"
        ? "RUN_FAILED"
        : "PLAYING";
  return {
    blind,
    blindIndex,
    blindCount: act.blinds.length,
    isFinalBlind,
    nextBlind: isFinalBlind ? null : act.blinds[blindIndex + 1],
    phase,
    showIntro:
      phase === "PLAYING" &&
      run.table.handsPlayed === 0 &&
      run.table.discards === 0,
    table: deriveTableView(blind, run.table),
  };
}
