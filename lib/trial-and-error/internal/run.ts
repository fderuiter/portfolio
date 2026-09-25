import type { Act, CrisisCard, Scenario } from "../types";
import { drawInt } from "./rng";
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

/** One seeded draw, as the run log records it. */
export interface RunDraw {
  /** The draw index this draw consumed. */
  drawIndex: number;
  kind: "BOSS" | "CRISIS";
  /** The boss scenario or crisis card drawn. */
  id: string;
  /** The Blind it was drawn for. */
  blindIndex: number;
}

/**
 * Serializable run state: the seed and draw log that make the run
 * replayable, which Blind of the act is being played, and that Blind's Card
 * Table. Contains no derived or browser data.
 */
export interface RunState {
  actId: string;
  /** The run seed. The same seed and the same moves replay identically. */
  seed: string;
  /** The next unused draw index. */
  drawIndex: number;
  /** Every seeded draw so far, in order. */
  draws: RunDraw[];
  /** The Boss this run faces: drawn from the act's pool, or its fixed Boss. */
  bossId: string | null;
  /** Index into the run's Blinds, Small first. */
  blindIndex: number;
  table: TableState;
}

/** The seed a run uses when none is given. */
export const DEFAULT_SEED = "fold-change";

/**
 * Player intents the run reducer accepts. Every Card Table action except
 * RESET passes through to the current Blind; a lost Blind ends the run, so
 * the only way back is RESTART_RUN.
 */
export type RunAction =
  | Exclude<TableAction, { type: "RESET" }>
  | { type: "NEXT_BLIND" }
  /** A new run: with `seed`, a new seed; without, a replay of this one. */
  | { type: "RESTART_RUN"; seed?: string };

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
  seed: string;
  draws: RunDraw[];
}

/**
 * The Blinds this run plays, in order. An act with a boss pool contributes
 * its Small and Big Blinds and the Boss the run drew.
 */
export function runBlinds(act: Act, run: Pick<RunState, "bossId">): Scenario[] {
  if (!act.bossPool) return act.blinds;
  const boss = act.bossPool.find((b) => b.id === run.bossId) ?? act.bossPool[0];
  return [...act.blinds, boss];
}

/**
 * Draws the next crisis for a Blind, without replacement across the run.
 * Returns null, consuming no draw, when the act has no crisis left.
 */
function drawCrisis(
  act: Act,
  run: Pick<RunState, "seed" | "drawIndex" | "draws">,
  blindIndex: number
): { crisis: CrisisCard | null; drawIndex: number; draws: RunDraw[] } {
  const drawn = new Set(
    run.draws.filter((d) => d.kind === "CRISIS").map((d) => d.id)
  );
  const remaining = (act.crisisDeck ?? []).filter((c) => !drawn.has(c.id));
  if (remaining.length === 0) {
    return { crisis: null, drawIndex: run.drawIndex, draws: run.draws };
  }
  const crisis = remaining[drawInt(run.seed, run.drawIndex, remaining.length)];
  return {
    crisis,
    drawIndex: run.drawIndex + 1,
    draws: [
      ...run.draws,
      { drawIndex: run.drawIndex, kind: "CRISIS", id: crisis.id, blindIndex },
    ],
  };
}

/** A fresh table for a Blind, announcing it with a sequence that follows `after`. */
function startBlind(
  scenario: Scenario,
  history: StudyHistory | undefined,
  inventory: Inventory | undefined,
  crisis: CrisisCard | null,
  after: TableEvent | null,
  kind: TableEvent["kind"],
  message: string
): TableState {
  const table = createTableState(scenario, history, inventory, crisis);
  const drawn = crisis ? ` Crisis: ${crisis.name}. ${crisis.description}` : "";
  return {
    ...table,
    lastEvent: {
      kind,
      message: `${message}${drawn}`,
      sequence: (after?.sequence ?? 0) + 1,
    },
  };
}

/**
 * A fresh run for `seed`: the Boss drawn from the act's pool (a pool of one
 * is fixed and consumes no draw), and the first Blind dealt with full CPU.
 * The first Blind draws no crisis.
 */
export function createRunState(
  act: Act,
  seed: string = DEFAULT_SEED
): RunState {
  let drawIndex = 0;
  const draws: RunDraw[] = [];
  let bossId: string | null =
    act.blinds.find((b) => b.blind.tier === "BOSS_BLIND")?.id ?? null;
  if (act.bossPool) {
    const pool = act.bossPool;
    if (pool.length === 1) {
      bossId = pool[0].id;
    } else {
      bossId = pool[drawInt(seed, drawIndex, pool.length)].id;
      draws.push({
        drawIndex,
        kind: "BOSS",
        id: bossId,
        blindIndex: act.blinds.length,
      });
      drawIndex += 1;
    }
  }
  return {
    actId: act.id,
    seed,
    drawIndex,
    draws,
    bossId,
    blindIndex: 0,
    table: createTableState(act.blinds[0]),
  };
}

/**
 * Pure run reducer. It composes the Card Table reducer for the current Blind
 * and moves between Blinds, drawing each later Blind's crisis from the
 * seeded event draw. The draw piles are fixed and every draw is a function
 * of the seed and draw index, so the same act, seed and action sequence
 * always yields the same state.
 */
export function advanceRun(
  act: Act,
  run: RunState,
  action: RunAction
): RunState {
  const blinds = runBlinds(act, run);
  const blind = blinds[run.blindIndex];
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
      // A new run is a new study: its population history starts over, and
      // the tray and budget are empty again. The same seed replays the same
      // Boss and crises.
      const fresh = createRunState(act, action.seed ?? run.seed);
      const first = act.blinds[0];
      return {
        ...fresh,
        table: startBlind(
          first,
          undefined,
          undefined,
          null,
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
      if (blind.encounter && !run.table.rewardClaimed) {
        return refuse("Choose an SOP relic first.");
      }
      const index = run.blindIndex + 1;
      if (index >= blinds.length) {
        return refuse(`${act.title} is complete.`);
      }
      const next = blinds[index];
      const { crisis, drawIndex, draws } = drawCrisis(act, run, index);
      return {
        ...run,
        drawIndex,
        draws,
        blindIndex: index,
        // The study goes on: later Blinds see every snapshot change so far,
        // and the tray and budget come along.
        table: startBlind(
          next,
          studyHistory(run.table),
          carriedInventory(run.table),
          crisis,
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
  const blinds = runBlinds(act, run);
  const blind = blinds[blindIndex];
  const isFinalBlind = blindIndex === blinds.length - 1;
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
    blindCount: blinds.length,
    isFinalBlind,
    nextBlind: isFinalBlind ? null : blinds[blindIndex + 1],
    phase,
    showIntro:
      phase === "PLAYING" &&
      run.table.handsPlayed === 0 &&
      run.table.discards === 0,
    table: deriveTableView(blind, run.table),
    seed: run.seed,
    draws: run.draws,
  };
}
