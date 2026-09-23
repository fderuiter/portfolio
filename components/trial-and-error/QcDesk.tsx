"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  DEMOGRAPHICS_SCENARIO,
  CPU_COSTS,
  advanceDesk,
  createDeskState,
  deriveDeskView,
  type DeskAction,
  type DeskCellView,
  type DeskState,
  type QcFinding,
  type Scenario,
} from "@/lib/trial-and-error";
import { FieldManualButton } from "@/components/FieldManualButton";

interface QcDeskProps {
  scenario?: Scenario;
}

const STATUS_STYLES: Record<DeskCellView["status"], string> = {
  UNREVIEWED: "text-zinc-200",
  CLEAN: "text-emerald-300",
  REDLINE: "text-rose-300 line-through decoration-rose-400 decoration-2",
  CORRECTED: "text-amber-300",
};

const STATUS_LABELS: Record<DeskCellView["status"], string> = {
  UNREVIEWED: "not reviewed",
  CLEAN: "clean",
  REDLINE: "redline",
  CORRECTED: "corrected",
};

const SEVERITY_STYLES: Record<QcFinding["severity"], string> = {
  FATAL: "border-rose-500/60 text-rose-300",
  MAJOR: "border-amber-500/60 text-amber-300",
  MINOR: "border-slate-400/60 text-slate-300",
};

const BUTTON_BASE =
  "min-h-[48px] px-4 py-3 border font-mono text-xs font-bold uppercase tracking-wider touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed";

function Stat({
  label,
  children,
  testId,
}: {
  label: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className="min-w-0 border border-zinc-800 bg-[#13151a] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-zinc-400">
        {label}
      </div>
      <div
        className="mt-1 text-lg font-bold tabular-nums text-zinc-100 break-words"
        data-testid={testId}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The QC Desk: a spreadsheet-brutalist review grid over the pure desk
 * reducer in `@/lib/trial-and-error`. All game rules live in the library;
 * this component only renders the derived view and dispatches intents.
 */
export function QcDesk({ scenario = DEMOGRAPHICS_SCENARIO }: QcDeskProps) {
  const [state, dispatch] = useReducer(
    (s: DeskState, a: DeskAction) => advanceDesk(scenario, s, a),
    scenario,
    createDeskState
  );
  const view = deriveDeskView(scenario, state);
  const [cursor, setCursor] = useState({ drawIndex: 0, row: 0, col: 0 });
  // The cursor belongs to one draft; a new draft starts at the top-left cell.
  const active =
    cursor.drawIndex === state.drawIndex
      ? cursor
      : { drawIndex: state.drawIndex, row: 0, col: 0 };

  const cellRefs = useRef(new Map<string, HTMLTableCellElement>());
  const restartRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"grid" | null>(null);

  const rows = view.table?.rows.length ?? 0;
  const cols = view.table?.columns.length ?? 0;
  const activeCell = view.cells[active.row]?.[active.col];
  const activeFindings = view.visibleFindings.filter(
    (f) => f.cell.row === active.row && f.cell.col === active.col
  );
  const activeOpen = view.openFindings.find(
    (f) => f.cell.row === active.row && f.cell.col === active.col
  );

  const send = (action: DeskAction, focusAfter: "grid" | null = null) => {
    pendingFocus.current = focusAfter;
    dispatch(action);
  };

  const moveTo = (row: number, col: number) => {
    setCursor({ drawIndex: state.drawIndex, row, col });
    cellRefs.current.get(`${row}:${col}`)?.focus();
  };

  const play = () => send({ type: "PLAY_HAND" }, "grid");
  const discard = () => send({ type: "DISCARD" }, "grid");
  const correct = () => {
    if (activeOpen)
      send({ type: "CORRECT_FINDING", findingId: activeOpen.id }, "grid");
  };

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target && state.status === "REVIEWING") return;
    pendingFocus.current = null;
    if (state.status !== "REVIEWING") {
      restartRef.current?.focus();
    } else if (target === "grid") {
      cellRefs.current.get(`${active.row}:${active.col}`)?.focus();
    }
  }, [state.lastEvent?.sequence, state.status, active.row, active.col]);

  const onCellKeyDown = (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    row: number,
    col: number
  ) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [Math.max(0, row - 1), col],
      ArrowDown: [Math.min(rows - 1, row + 1), col],
      ArrowLeft: [row, Math.max(0, col - 1)],
      ArrowRight: [row, Math.min(cols - 1, col + 1)],
      Home: [row, 0],
      End: [row, cols - 1],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      moveTo(move[0], move[1]);
      return;
    }
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === event.currentTarget
    ) {
      event.preventDefault();
      send({ type: "INSPECT_CELL", row, col });
    }
  };

  const onBoardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      state.status !== "REVIEWING"
    )
      return;
    const key = event.key.toLowerCase();
    if (key === "d") {
      event.preventDefault();
      discard();
    } else if (key === "p") {
      event.preventDefault();
      play();
    } else if (key === "c") {
      event.preventDefault();
      correct();
    }
  };

  const expected = view.expected;
  const slashed =
    expected !== null && expected.finalMult < view.unpenalizedMult;
  const cpuCells = Array.from(
    { length: scenario.startingCpu },
    (_, i) => i < state.cpu.available
  );

  return (
    <section
      aria-labelledby="qc-desk-heading"
      className="w-full min-w-0 bg-[#0d0e11] font-mono text-zinc-200 border border-zinc-800 section-isolate"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <h2
            id="qc-desk-heading"
            className="text-sm font-bold uppercase tracking-wider text-zinc-100 break-words"
          >
            QC Desk · {scenario.shell.tableNumber}
          </h2>
          <p className="text-xs text-zinc-400 break-words">
            {scenario.blind.name} · SAP {scenario.rulebook.id}:{" "}
            {scenario.rulebook.populationSuit} population,{" "}
            {scenario.rulebook.percentPrecision} dp,{" "}
            {scenario.rulebook.roundingMode.replaceAll("_", " ").toLowerCase()}
          </p>
        </div>
        <FieldManualButton manualId="trial-and-error" label="Manual" />
      </header>

      <div className="grid grid-cols-2 gap-px bg-zinc-800 border-b border-zinc-800 md:grid-cols-4">
        <Stat label="Round target" testId="round-target">
          <span className="text-amber-400">{view.quota}</span>
        </Stat>
        <Stat label="Round score" testId="round-score">
          {state.roundScore}
        </Stat>
        <Stat label="Expected value" testId="expected-value">
          {expected ? (
            <span
              aria-label={`${expected.chips.total} Chips times ${expected.finalMult} Mult equals ${expected.score}`}
            >
              [{expected.chips.total}] × [
              {slashed && (
                <s
                  className="text-zinc-400 decoration-rose-400 decoration-2"
                  data-testid="slashed-mult"
                >
                  {view.unpenalizedMult}
                </s>
              )}
              {slashed && " "}
              <span className={slashed ? "text-rose-300" : "text-emerald-300"}>
                {expected.finalMult}
              </span>
              ] = {expected.score}
            </span>
          ) : (
            "—"
          )}
        </Stat>
        <Stat label="CPU" testId="cpu-counter">
          <span className="flex items-center gap-2">
            <span>
              {state.cpu.available}/{scenario.startingCpu}
            </span>
            <span className="flex gap-0.5" aria-hidden="true">
              {cpuCells.map((on, i) => (
                <span
                  key={i}
                  className={`h-3 w-2 border ${on ? "border-emerald-400 bg-emerald-400" : "border-zinc-700"}`}
                />
              ))}
            </span>
          </span>
        </Stat>
      </div>

      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="desk-announcer"
      >
        {state.lastEvent?.message ?? ""}
      </p>

      {view.table ? (
        <div
          className="grid gap-px bg-zinc-800 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
          onKeyDown={onBoardKeyDown}
          data-testid="qc-board"
        >
          <div className="min-w-0 bg-[#0d0e11] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 text-xs text-zinc-400">
              <span className="text-zinc-200">{view.table.draftLabel}</span>
              <span>
                Reviewed {view.reviewedCells}/{view.totalCells} · Draws left{" "}
                {view.remainingDraws}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table
                role="grid"
                aria-label={`${scenario.shell.tableNumber} ${view.table.draftLabel}. Arrow keys move, Enter or Space inspects.`}
                className="w-full border-collapse text-xs"
              >
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border border-zinc-800 bg-[#13151a] px-2 py-2 text-left font-normal text-zinc-400"
                    >
                      Parameter
                    </th>
                    {view.table.columns.map((c) => (
                      <th
                        key={c.id}
                        scope="col"
                        className="border border-zinc-800 bg-[#13151a] px-2 py-2 text-right font-normal text-zinc-400"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {view.table.rows.map((r, row) => (
                    <tr key={r.id}>
                      <th
                        scope="row"
                        className="border border-zinc-800 px-2 py-2 text-left font-normal text-zinc-300 break-words"
                      >
                        {r.label}
                      </th>
                      {view.cells[row].map((cell) => {
                        const isActive =
                          cell.row === active.row && cell.col === active.col;
                        return (
                          <td
                            key={cell.col}
                            role="gridcell"
                            tabIndex={isActive ? 0 : -1}
                            ref={(el) => {
                              const key = `${cell.row}:${cell.col}`;
                              if (el) cellRefs.current.set(key, el);
                              else cellRefs.current.delete(key);
                            }}
                            aria-selected={isActive}
                            aria-label={`${r.label}, ${view.table?.columns[cell.col].label}: ${cell.display}, ${STATUS_LABELS[cell.status]}`}
                            data-status={cell.status}
                            onClick={() => {
                              moveTo(cell.row, cell.col);
                              send({
                                type: "INSPECT_CELL",
                                row: cell.row,
                                col: cell.col,
                              });
                            }}
                            onFocus={() => {
                              if (!isActive)
                                setCursor({
                                  drawIndex: state.drawIndex,
                                  row: cell.row,
                                  col: cell.col,
                                });
                            }}
                            onKeyDown={(e) =>
                              onCellKeyDown(e, cell.row, cell.col)
                            }
                            className={`h-12 cursor-pointer whitespace-nowrap border px-2 py-2 text-right tabular-nums outline-none ${
                              isActive
                                ? "border-amber-400 bg-amber-500/10"
                                : "border-zinc-800"
                            } focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 ${STATUS_STYLES[cell.status]}`}
                          >
                            {cell.status === "CORRECTED" ? (
                              <>
                                <s className="mr-1 text-zinc-400">
                                  {cell.observed}
                                </s>
                                {cell.display}
                              </>
                            ) : (
                              cell.display
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={play}
                disabled={!view.canPlay}
                className={`${BUTTON_BASE} border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:border-zinc-700 disabled:bg-transparent disabled:text-zinc-400`}
              >
                Approve &amp; Play Hand · {CPU_COSTS.PLAY_HAND} CPU [P]
              </button>
              <button
                type="button"
                onClick={discard}
                disabled={!view.canDiscard}
                className={`${BUTTON_BASE} border-slate-400 bg-transparent text-slate-300 hover:bg-slate-400/10 disabled:border-zinc-700 disabled:text-zinc-400`}
              >
                Reject &amp; Discard · {CPU_COSTS.DISCARD} CPU [D]
              </button>
            </div>
          </div>

          <aside
            aria-label="Inspector"
            className="min-w-0 bg-[#13151a] p-3 text-xs"
          >
            <h3 className="text-[10px] uppercase tracking-wider text-zinc-400">
              Inspector
            </h3>
            {activeCell && (
              <p
                className="mt-1 text-zinc-200 break-words"
                data-testid="inspector-cell"
              >
                {view.table.rows[active.row].label} ·{" "}
                {view.table.columns[active.col].label}:{" "}
                <span className="tabular-nums">{activeCell.display}</span> (
                {STATUS_LABELS[activeCell.status]})
              </p>
            )}
            {activeCell?.status === "UNREVIEWED" && (
              <p className="mt-2 text-zinc-400">
                Press Enter or Space to inspect this cell against the SAP.
              </p>
            )}
            <ul className="mt-2 space-y-2">
              {activeFindings.map((f) => {
                const resolved = !view.openFindings.includes(f);
                return (
                  <li
                    key={f.id}
                    className={`border-l-2 bg-[#0d0e11] p-2 ${SEVERITY_STYLES[f.severity]}`}
                    data-testid="finding"
                  >
                    <p className="font-bold break-words">
                      {f.ruleId} · {f.category} · {f.severity}
                      {resolved && (
                        <span className="ml-2 text-amber-300">Corrected</span>
                      )}
                    </p>
                    <dl className="mt-1 space-y-1 text-zinc-300">
                      <div>
                        <dt className="inline text-zinc-400">Rule: </dt>
                        <dd className="inline break-words">{f.rule}</dd>
                      </div>
                      <div>
                        <dt className="inline text-zinc-400">Evidence: </dt>
                        <dd className="inline break-words">{f.evidence}</dd>
                      </div>
                      <div>
                        <dt className="inline text-zinc-400">Consequence: </dt>
                        <dd className="inline break-words">{f.consequence}</dd>
                      </div>
                      <div>
                        <dt className="inline text-zinc-400">Fix: </dt>
                        <dd className="inline tabular-nums">
                          {f.observed} → {f.expected}
                        </dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
            {activeOpen && (
              <button
                type="button"
                onClick={correct}
                className={`${BUTTON_BASE} mt-2 w-full border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20`}
              >
                Flag &amp; Correct [C]
              </button>
            )}

            <h3 className="mt-4 text-[10px] uppercase tracking-wider text-zinc-400">
              Redline log
            </h3>
            {view.visibleFindings.length === 0 ? (
              <p className="mt-1 text-zinc-400">No findings revealed yet.</p>
            ) : (
              <ul className="mt-1 space-y-1" data-testid="redline-log">
                {view.visibleFindings.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap justify-between gap-2 tabular-nums"
                  >
                    <span
                      className={
                        view.openFindings.includes(f)
                          ? "text-rose-300"
                          : "text-amber-300"
                      }
                    >
                      {f.id}
                    </span>
                    <span className="text-zinc-400">
                      {view.openFindings.includes(f) ? "open" : "corrected"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {state.lastEvaluation && (
              <>
                <h3 className="mt-4 text-[10px] uppercase tracking-wider text-zinc-400">
                  Last hand
                </h3>
                <p
                  className="mt-1 text-zinc-300 tabular-nums"
                  data-testid="last-hand"
                >
                  {state.lastEvaluation.handType}:{" "}
                  {state.lastEvaluation.chips.total} Chips ×{" "}
                  {state.lastEvaluation.finalMult} Mult ={" "}
                  {state.lastEvaluation.score}
                  {state.lastEvaluation.zeroRule.triggered &&
                    " (zero-score rule)"}
                </p>
              </>
            )}
          </aside>
        </div>
      ) : (
        <div className="p-6 text-center" data-testid="blind-result">
          <p
            className={`text-lg font-bold uppercase ${state.status === "CLEARED" ? "text-emerald-300" : "text-rose-300"}`}
          >
            {state.status === "CLEARED" ? "Blind cleared" : "Blind failed"}
          </p>
          <p className="mt-2 text-sm text-zinc-300 tabular-nums">
            {state.roundScore} of {view.quota} · {state.handsPlayed} hand
            {state.handsPlayed === 1 ? "" : "s"} played · {state.discards}{" "}
            discard{state.discards === 1 ? "" : "s"} · {state.cpu.spent} CPU
            spent
          </p>
          <button
            ref={restartRef}
            type="button"
            onClick={() => {
              setCursor({ drawIndex: 0, row: 0, col: 0 });
              send({ type: "RESET" }, "grid");
            }}
            className={`${BUTTON_BASE} mt-4 border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20`}
          >
            Restart Blind
          </button>
        </div>
      )}
    </section>
  );
}
