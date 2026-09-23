"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  CPU_COSTS,
  DEMOGRAPHICS_SCENARIO,
  HAND_NAMES,
  advanceTable,
  createTableState,
  deriveTableView,
  type PopulationType,
  type Scenario,
  type TableAction,
  type TableCardView,
  type TableState,
} from "@/lib/trial-and-error";
import { useAnnouncer } from "@/hooks/useAnnouncer";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { FieldManualButton } from "@/components/FieldManualButton";
import { QcDesk } from "@/components/trial-and-error/QcDesk";
import {
  ScoreBreakdown,
  ScorePlayer,
  useScorePlayback,
} from "@/components/trial-and-error/ScorePlayer";
import { useTeMotion } from "@/components/trial-and-error/useTeMotion";

interface CardTableProps {
  scenario?: Scenario;
}

type PendingFocus =
  { kind: "card"; cardId: string } | { kind: "hand"; index: number } | null;

const RELIC_SLOTS = 5;
const SPEEDS = [1, 2, 4] as const;
const FIGURE_SPACE = "\u2007";

const SUIT_BORDER: Record<PopulationType, string> = {
  ITT: "border-l-[color:var(--te-suit-itt)]",
  SAFETY: "border-l-[color:var(--te-suit-safety)]",
  PER_PROTOCOL: "border-l-[color:var(--te-suit-pp)]",
  FAS: "border-l-[color:var(--te-suit-fas)]",
  SCREENED: "border-l-[color:var(--te-suit-screened)]",
};

const SUIT_TEXT: Record<PopulationType, string> = {
  ITT: "text-[color:var(--te-suit-itt)]",
  SAFETY: "text-[color:var(--te-suit-safety)]",
  PER_PROTOCOL: "text-[color:var(--te-suit-pp)]",
  FAS: "text-[color:var(--te-suit-fas)]",
  SCREENED: "text-[color:var(--te-suit-screened)]",
};

const POPULATION_LABEL: Record<PopulationType, string> = {
  ITT: "ITT",
  SAFETY: "Safety",
  PER_PROTOCOL: "PP",
  FAS: "FAS",
  SCREENED: "Screened",
};

const BUTTON_BASE =
  "min-h-[48px] px-4 py-3 border font-mono text-xs font-bold uppercase tracking-wider touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-transparent disabled:text-zinc-400";

function cardLabel(view: TableCardView): string {
  const { card } = view;
  const parts = [
    `${card.number}, ${card.title}`,
    `${card.cardType.toLowerCase()}`,
    `${POPULATION_LABEL[card.population]} population`,
    `${card.chips} Chips`,
  ];
  if (view.unverified) parts.push("unverified");
  if (view.inspected) {
    parts.push(
      view.openRedlines > 0
        ? `${view.openRedlines} open redline${view.openRedlines === 1 ? "" : "s"}`
        : "inspected"
    );
  }
  if (view.selected) parts.push("selected");
  return parts.join(", ");
}

/**
 * The Card Table: the game's main screen (T&E-UX-01). A thin adapter over
 * the pure table reducer in `@/lib/trial-and-error`; it renders the derived
 * view, dispatches intents, and never computes a score.
 */
export function CardTable({
  scenario = DEMOGRAPHICS_SCENARIO,
}: CardTableProps) {
  const [state, dispatch] = useReducer(
    (s: TableState, a: TableAction) => advanceTable(scenario, s, a),
    scenario,
    createTableState
  );
  const view = deriveTableView(scenario, state);
  const { announce } = useAnnouncer();
  const { reducedMotion, speed, setSpeed, loudEffectsEnabled } = useTeMotion();
  const timeline = view.lastTimeline;
  const playback = useScorePlayback(timeline, state.lastPlay, {
    speed,
    reducedMotion,
  });
  const playing = playback.playing;
  const progressStep = timeline?.[timeline.length - 1];
  const progress =
    progressStep?.kind === "BLIND_PROGRESS" ? progressStep : undefined;
  // The Blind's round score ticks over when the TOTAL step lands.
  const displayedRound =
    playing && progress && playback.shown < (timeline?.length ?? 0) - 1
      ? progress.before
      : state.roundScore;
  const flashCleared =
    playing &&
    progress?.crossed === true &&
    playback.shown === (timeline?.length ?? 0);

  const [focusIndex, setFocusIndex] = useState(0);
  const activeIndex = Math.min(focusIndex, Math.max(0, view.hand.length - 1));
  const focusedCard = view.hand[activeIndex];

  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const restartRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const deskFocusRef = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<PendingFocus>(null);

  const closeInspect = () => {
    if (state.inspecting) {
      pendingFocus.current = { kind: "card", cardId: state.inspecting };
    }
    dispatch({ type: "CLOSE_INSPECT" });
  };

  const drawerRef = useFocusTrap<HTMLDivElement>(view.inspection !== null, {
    onEscape: closeInspect,
    initialFocusRef: deskFocusRef,
    returnFocus: false,
  });

  const send = (action: TableAction, focus: PendingFocus = null) => {
    pendingFocus.current = focus;
    dispatch(action);
  };

  // A played hand is announced once, as a summary, after its timeline
  // resolves, so screen readers are not flooded while it plays.
  useEffect(() => {
    if (state.lastEvent && !playing) announce(state.lastEvent.message);
  }, [state.lastEvent, announce, playing]);

  useEffect(() => {
    if (playing) {
      skipRef.current?.focus();
      return;
    }
    if (state.status !== "REVIEWING") {
      restartRef.current?.focus();
      return;
    }
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const cardId =
      target.kind === "card"
        ? target.cardId
        : state.hand[Math.min(target.index, state.hand.length - 1)];
    if (cardId) cardRefs.current.get(cardId)?.focus();
  }, [state.lastEvent?.sequence, state.status, state.hand, playing]);

  const play = () =>
    send({ type: "PLAY_HAND" }, { kind: "hand", index: activeIndex });
  const discard = () =>
    send({ type: "DISCARD" }, { kind: "hand", index: activeIndex });
  const inspect = (cardId: string | undefined) => {
    if (cardId) send({ type: "INSPECT_CARD", cardId });
  };

  const onCardKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    cardId: string
  ) => {
    const last = view.hand.length - 1;
    const moves: Record<string, number> = {
      ArrowLeft: Math.max(0, index - 1),
      ArrowRight: Math.min(last, index + 1),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      const next = moves[event.key];
      setFocusIndex(next);
      cardRefs.current.get(view.hand[next].card.id)?.focus();
      return;
    }
    if (event.target !== event.currentTarget || playing) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      send({ type: "TOGGLE_SELECT", cardId });
    } else if (event.key === "Enter") {
      event.preventDefault();
      play();
    } else if (key === "d") {
      event.preventDefault();
      discard();
    } else if (key === "i") {
      event.preventDefault();
      inspect(cardId);
    }
  };

  const preview = view.preview;
  const slashed =
    preview !== null && preview.finalMult < view.previewUnpenalizedMult;
  const cpuPips = Array.from(
    { length: scenario.table.startingCpu },
    (_, i) => i < state.cpu.available
  );

  return (
    <section
      aria-labelledby="card-table-heading"
      className="w-full min-w-0 bg-[color:var(--te-surface-0)] font-mono text-[color:var(--te-text)] border border-zinc-800 section-isolate"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <h2
            id="card-table-heading"
            className="text-sm font-bold uppercase tracking-wider break-words"
          >
            Card Table · {scenario.title}
          </h2>
          <p className="text-xs text-zinc-400 break-words">
            {scenario.summary}
          </p>
        </div>
        <FieldManualButton manualId="trial-and-error" label="Manual" />
      </header>

      <div className="grid gap-px bg-zinc-800 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <aside
          aria-label="Blind"
          className="min-w-0 bg-[color:var(--te-surface-1)] p-3 text-xs"
        >
          <p className="font-bold uppercase tracking-wider text-zinc-300 break-words">
            {scenario.blind.name}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 tabular-nums">
            <dt className="text-zinc-400">Target</dt>
            <dd
              className="text-right text-[color:var(--te-plus-mult)]"
              data-testid="round-target"
            >
              {view.quota}
            </dd>
            <dt className="text-zinc-400">Round</dt>
            <dd className="text-right" data-testid="round-score">
              {/* Padded with figure spaces so the right-aligned score keeps
                  its position as digits arrive (no layout shift). */}
              {String(displayedRound).padStart(
                String(view.quota).length + 1,
                FIGURE_SPACE
              )}
            </dd>
            <dt className="text-zinc-400">CPU</dt>
            <dd className="text-right" data-testid="cpu-counter">
              {state.cpu.available}/{scenario.table.startingCpu}
            </dd>
            <dt className="text-zinc-400">Hands</dt>
            <dd className="text-right" data-testid="hands-affordable">
              {view.handsAffordable}
            </dd>
            <dt className="text-zinc-400">Discards</dt>
            <dd className="text-right">{view.discardsAffordable}</dd>
            <dt className="text-zinc-400">Deck</dt>
            <dd className="text-right">{view.deckRemaining}</dd>
          </dl>
          <div className="mt-2 flex flex-wrap gap-0.5" aria-hidden="true">
            {cpuPips.map((on, i) => (
              <span
                key={i}
                className={`h-3 w-2 border ${on ? "border-emerald-400 bg-emerald-400" : "border-zinc-700"}`}
              />
            ))}
          </div>
          <p
            className={`mt-2 min-h-[1.25rem] font-bold uppercase tracking-wider text-emerald-300 ${flashCleared && loudEffectsEnabled ? "te-loud-glow" : ""}`}
            aria-hidden="true"
            data-testid="blind-cleared-flash"
          >
            {flashCleared ? "Cleared" : ""}
          </p>
          <div
            role="group"
            aria-label="Scoring speed"
            className="mt-2 grid grid-cols-3 gap-1"
          >
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={speed === s}
                onClick={() => setSpeed(s)}
                className={`min-h-[44px] border text-xs font-bold tabular-nums touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  speed === s
                    ? "border-amber-400 bg-amber-500/10 text-amber-300"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 bg-[color:var(--te-surface-0)] p-3">
          <ul
            aria-label={`Relic rack: 0 of ${RELIC_SLOTS} slots filled. Relics arrive with the Procurement Shop.`}
            tabIndex={0}
            className="flex flex-wrap gap-2 outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            data-testid="relic-rack"
          >
            {Array.from({ length: RELIC_SLOTS }, (_, i) => (
              <li
                key={i}
                className="flex h-12 w-16 items-center justify-center border border-dashed border-zinc-700 text-[10px] uppercase text-zinc-400"
              >
                Empty
              </li>
            ))}
          </ul>

          {playing && timeline ? (
            <div className="mt-3 min-h-[13rem] border border-zinc-800 bg-[color:var(--te-surface-1)] px-3 py-2">
              <ScorePlayer
                steps={timeline}
                shown={playback.shown}
                cards={(state.lastPlay?.cardIds ?? []).map((id) => ({
                  id,
                  number:
                    scenario.deck.find((card) => card.id === id)?.number ?? id,
                }))}
                loudEffectsEnabled={loudEffectsEnabled}
                onSkip={playback.skip}
                skipRef={skipRef}
              />
            </div>
          ) : (
            <div
              className="mt-3 min-h-[13rem] border border-zinc-800 bg-[color:var(--te-surface-1)] px-3 py-2"
              data-testid="hand-preview"
            >
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                {view.classification
                  ? HAND_NAMES[view.classification.handType]
                  : `Select up to ${scenario.table.maxSelection} cards`}
              </p>
              {preview && (
                <p className="mt-1 text-lg font-bold tabular-nums break-words">
                  <span className="text-[color:var(--te-chips)]">
                    [{preview.chips.total}]
                  </span>{" "}
                  × [
                  {slashed && (
                    <s className="text-zinc-400 decoration-rose-400 decoration-2">
                      {view.previewUnpenalizedMult}
                    </s>
                  )}
                  {slashed && " "}
                  <span
                    className={
                      slashed
                        ? "text-rose-300"
                        : "text-[color:var(--te-plus-mult)]"
                    }
                  >
                    {preview.finalMult}
                  </span>
                  ] = {preview.score}
                </p>
              )}
              {view.previewUnverified && (
                <p
                  className="mt-1 text-xs text-amber-300"
                  data-testid="unverified-flag"
                >
                  ? Unverified: an uninspected card may hide a fatal defect.
                </p>
              )}
            </div>
          )}

          {state.status === "REVIEWING" || playing ? (
            <div inert={playing}>
              <div
                role="group"
                aria-label={`Hand of ${view.hand.length}. Arrow keys move, Space selects, Enter plays, D discards, I inspects.`}
                className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
                data-testid="hand"
              >
                {view.hand.map((h, index) => (
                  <button
                    key={h.card.id}
                    type="button"
                    ref={(el) => {
                      if (el) cardRefs.current.set(h.card.id, el);
                      else cardRefs.current.delete(h.card.id);
                    }}
                    tabIndex={index === activeIndex ? 0 : -1}
                    aria-pressed={h.selected}
                    aria-label={cardLabel(h)}
                    data-card-id={h.card.id}
                    onClick={() => {
                      setFocusIndex(index);
                      send({ type: "TOGGLE_SELECT", cardId: h.card.id });
                    }}
                    onFocus={() => setFocusIndex(index)}
                    onKeyDown={(e) => onCardKeyDown(e, index, h.card.id)}
                    className={`relative min-h-[7.5rem] min-w-0 border border-l-4 p-2 text-left text-xs touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-safe:transition-transform ${SUIT_BORDER[h.card.population]} ${
                      h.selected
                        ? "-translate-y-1 border-amber-400 bg-amber-500/10"
                        : "border-zinc-700 bg-[color:var(--te-surface-1)]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-1 text-[10px] uppercase tracking-wider text-zinc-400">
                      <span className="flex items-center gap-1">
                        {h.card.cardType}
                        {h.unverified && (
                          <span
                            className="border border-amber-400 px-1 font-bold text-amber-300"
                            aria-hidden="true"
                          >
                            ?
                          </span>
                        )}
                      </span>
                      <span className={SUIT_TEXT[h.card.population]}>
                        {POPULATION_LABEL[h.card.population]}
                      </span>
                    </span>
                    <span className="mt-1 block font-bold break-words">
                      {h.card.number}
                    </span>
                    <span className="block text-zinc-300 break-words">
                      {h.card.title}
                    </span>
                    <span className="mt-1 block tabular-nums text-[color:var(--te-chips)]">
                      {h.card.chips} Chips
                    </span>
                    {h.inspected && (
                      <span
                        className={`mt-1 block text-[10px] ${h.openRedlines > 0 ? "text-rose-300" : "text-emerald-300"}`}
                        aria-hidden="true"
                      >
                        {h.openRedlines > 0
                          ? `${h.openRedlines} redline${h.openRedlines === 1 ? "" : "s"}`
                          : "Inspected"}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={play}
                  disabled={!view.canPlay}
                  className={`${BUTTON_BASE} border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20`}
                >
                  Play Hand · {CPU_COSTS.PLAY_HAND} CPU [Enter]
                </button>
                <button
                  type="button"
                  onClick={discard}
                  disabled={!view.canDiscard}
                  className={`${BUTTON_BASE} border-slate-400 text-slate-300 hover:bg-slate-400/10`}
                >
                  Discard · {CPU_COSTS.DISCARD} CPU [D]
                </button>
                <button
                  type="button"
                  onClick={() => inspect(focusedCard?.card.id)}
                  disabled={
                    !focusedCard?.inspectable ||
                    (!focusedCard.inspected && !view.canInspect)
                  }
                  className={`${BUTTON_BASE} border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20`}
                >
                  Inspect {focusedCard?.card.number ?? ""} ·{" "}
                  {focusedCard?.inspected ? "open" : `${CPU_COSTS.INSPECT} CPU`}{" "}
                  [I]
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-4 text-center" data-testid="blind-result">
              <p
                className={`text-lg font-bold uppercase ${state.status === "CLEARED" ? "text-emerald-300" : "text-rose-300"}`}
              >
                {state.status === "CLEARED" ? "Blind cleared" : "Blind failed"}
              </p>
              <p className="mt-2 text-sm text-zinc-300 tabular-nums">
                {state.roundScore} of {view.quota} · {state.handsPlayed} hand
                {state.handsPlayed === 1 ? "" : "s"} played · {state.discards}{" "}
                discard
                {state.discards === 1 ? "" : "s"} · {state.cpu.spent} CPU spent
              </p>
              <button
                ref={restartRef}
                type="button"
                onClick={() => {
                  setFocusIndex(0);
                  send({ type: "RESET" }, { kind: "hand", index: 0 });
                }}
                className={`${BUTTON_BASE} mt-4 border-amber-500 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20`}
              >
                Restart Blind
              </button>
            </div>
          )}

          {state.lastPlay && !playing && (
            <motion.p
              key={state.handsPlayed}
              // One opacity fade, which reduced motion also allows: under
              // it this is the only motion a played hand gets.
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-3 text-xs text-zinc-300 tabular-nums break-words"
              data-testid="last-hand"
            >
              Last hand: {HAND_NAMES[state.lastPlay.classification.handType]} ·{" "}
              {state.lastPlay.evaluation.chips.total} Chips ×{" "}
              {state.lastPlay.evaluation.finalMult} Mult ={" "}
              {state.lastPlay.evaluation.score}
              {state.lastPlay.evaluation.zeroRule.triggered &&
                " (zero-score rule)"}
            </motion.p>
          )}
          {timeline && !playing && <ScoreBreakdown steps={timeline} />}
        </div>
      </div>

      {view.inspection &&
        // Portalled out of the table's isolated stacking context so the site
        // footer and cabinet chrome cannot paint over it. In real fullscreen
        // only the fullscreen element renders, so the drawer mounts there.
        createPortal(
          <div
            data-te-cabinet=""
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          >
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="qc-desk-heading"
              className="max-h-[90dvh] w-full max-w-5xl overflow-y-auto border border-zinc-700 bg-[color:var(--te-surface-0)]"
              data-testid="inspect-drawer"
            >
              <QcDesk
                card={view.inspection.card}
                table={view.inspection.table}
                rulebook={scenario.rulebook}
                view={view.inspection}
                expected={view.inspection.expected}
                unpenalizedMult={view.inspection.unpenalizedMult}
                onInspectCell={(row, col) =>
                  send({ type: "INSPECT_CELL", row, col })
                }
                onCorrect={(findingId) =>
                  send({ type: "CORRECT_FINDING", findingId })
                }
                initialFocusRef={deskFocusRef}
              />
              <div className="border-t border-zinc-800 p-3">
                <button
                  type="button"
                  onClick={closeInspect}
                  className={`${BUTTON_BASE} w-full border-zinc-600 text-zinc-200 hover:bg-zinc-800`}
                >
                  Close Inspect [Esc]
                </button>
              </div>
            </div>
          </div>,
          document.fullscreenElement ?? document.body
        )}
    </section>
  );
}
