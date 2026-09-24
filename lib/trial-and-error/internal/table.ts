import type {
  BossBlindModifier,
  HandClassification,
  HandEvaluation,
  PopulationSnapshot,
  QcReport,
  RuleCheckResult,
  Scenario,
  SnapshotRef,
  StagedTable,
  StudyEvent,
  TlfCard,
  CardFace,
  CardStamp,
  RedactedCard,
} from "../types";
import { POPULATION_LABELS } from "../types";
import { compileDraft } from "./compile";
import {
  CPU_COSTS,
  canAfford,
  cpuReducer,
  type CpuAction,
  type CpuLedger,
} from "./cpu";
import type { DeskStatus } from "./desk";
import { HAND_NAMES, classifyHand } from "./hands";
import {
  correctFinding,
  createInspectionState,
  deriveInspectionView,
  inspectCell,
  unpenalizedMult,
  visibleFindingIds,
  type InspectionState,
  type InspectionView,
} from "./inspection";
import { evaluateHand, ruleResultsFor } from "./scoring";
import {
  applyTransition,
  sameMembership,
  snapshotRef,
  type SnapshotInvalidation,
} from "./snapshots";
import { scoreTimeline, type TimelineStep } from "./timeline";
import { validate } from "./validator";

/** The most recent Card Table outcome, phrased for a polite announcement. */
export interface TableEvent {
  kind:
    | "SELECTED"
    | "DESELECTED"
    | "PLAYED"
    | "DISCARDED"
    | "INSPECT_OPENED"
    | "INSPECT_CLOSED"
    | "INSPECTED"
    | "CORRECTED"
    | "MOVED"
    | "REFUSED"
    | "RESET"
    | "BLIND_STARTED"
    | "RECOMPILED";
  message: string;
  /** Increments on every event so repeated messages are still announced. */
  sequence: number;
}

/** The last hand played, for the result plate. */
export interface PlayedHand {
  classification: HandClassification;
  evaluation: HandEvaluation;
  cardIds: string[];
}

/**
 * The study's population history: every snapshot version, oldest first (the
 * last is current), and the invalidation each transition produced. A run
 * carries it from one Blind into the next.
 */
export interface StudyHistory {
  snapshots: PopulationSnapshot[];
  invalidations: SnapshotInvalidation[];
}

/** The alert shown when a hand holds an output compiled on an old snapshot. */
export const STALE_ALERT = `Output compiled against obsolete population snapshot; recompile required (${CPU_COSTS.RECOMPILE} CPU).`;

/** Serializable Card Table state. Contains no derived or browser data. */
export interface TableState {
  scenarioId: string;
  /** Index of the next undealt card in the scenario deck. */
  deckIndex: number;
  /** Card ids in hand, in deal order. */
  hand: string[];
  /** Selected card ids, in selection order (at most `maxSelection`). */
  selected: string[];
  /** Review progress per card, present once the card has been paid to inspect. */
  inspections: Record<string, InspectionState>;
  /** The card whose Inspect drawer is open. */
  inspecting: string | null;
  cpu: CpuLedger;
  roundScore: number;
  handsPlayed: number;
  discards: number;
  status: DeskStatus;
  lastPlay: PlayedHand | null;
  lastEvent: TableEvent | null;
  /** Every population snapshot version so far, oldest first. The last is current. */
  snapshots: PopulationSnapshot[];
  /** One record per population transition so far this study. */
  invalidations: SnapshotInvalidation[];
  /** The snapshot each card in hand was compiled against. */
  provenance: Record<string, SnapshotRef>;
  /** Cards in hand whose draft was compiled against a later snapshot. */
  drafts: Record<string, StagedTable>;
  /** How much of `snapshots` and `invalidations` predates this Blind. */
  opening: { snapshots: number; invalidations: number };
}

/** Player intents the Card Table reducer accepts. */
export type TableAction =
  | { type: "TOGGLE_SELECT"; cardId: string }
  | { type: "PLAY_HAND" }
  | { type: "DISCARD" }
  | { type: "INSPECT_CARD"; cardId: string }
  | { type: "CLOSE_INSPECT" }
  | { type: "INSPECT_CELL"; row: number; col: number }
  | { type: "CORRECT_FINDING"; findingId: string }
  /** Cosmetic: moves a card within the hand. Costs nothing. */
  | { type: "MOVE_CARD"; cardId: string; toIndex: number }
  /** Reruns a stale output against the current snapshot. */
  | { type: "RECOMPILE"; cardId: string }
  | { type: "RESET" };

/** One card in hand as the table should render it. */
export interface TableCardView {
  card: TlfCard;
  selected: boolean;
  /** The card has reviewable cells in this slice. */
  inspectable: boolean;
  /** CPU has been spent to inspect this card. */
  inspected: boolean;
  /** Inspectable but never inspected: its true findings are unknown. */
  unverified: boolean;
  /** Revealed findings still uncorrected. */
  openRedlines: number;
  /** The live mini-output printed on the card, as currently reviewed. */
  face: CardFace;
  /** Marks stamped on the face, in display order. */
  stamps: CardStamp[];
  /** The Boss Blind's debuff cancels this card's Chips. */
  debuffed: boolean;
  /** Compiled against a snapshot whose membership of this card's suit has since changed. */
  stale: boolean;
  /** The snapshot this card was compiled against. */
  provenance: SnapshotRef;
}

/** The open Inspect drawer's content. */
export interface TableInspectionView extends InspectionView {
  card: TlfCard;
  table: StagedTable;
  /** The card's own value as a High Table, from revealed findings. */
  expected: HandEvaluation;
  unpenalizedMult: number;
  /** The snapshot the inspected output was compiled against. */
  provenance: SnapshotRef;
  stale: boolean;
}

/** Everything the Card Table renders, derived purely from scenario and state. */
export interface TableView {
  hand: TableCardView[];
  classification: HandClassification | null;
  /** Value of the selection from revealed findings only. */
  preview: HandEvaluation | null;
  previewUnpenalizedMult: number;
  /** Any selected card is inspectable but uninspected. */
  previewUnverified: boolean;
  quota: number;
  deckRemaining: number;
  /** Cards dealt and since played or discarded: the discard stack. */
  spentCount: number;
  /** The undealt deck, face down: opaque slots that carry no card data. */
  drawPile: RedactedCard[];
  handsAffordable: number;
  discardsAffordable: number;
  canPlay: boolean;
  canDiscard: boolean;
  canInspect: boolean;
  inspection: TableInspectionView | null;
  /** The last played hand as an ordered scoring timeline, for playback. */
  lastTimeline: TimelineStep[] | null;
  /** The current population snapshot. */
  snapshot: SnapshotRef;
  /** Selected cards that are stale, in selection order. */
  staleSelected: string[];
  /** Why Play Hand is refused, when a stale card is selected. */
  playBlockedReason: string | null;
  /**
   * Stale cards that alone stop the selection from being a Population Flush:
   * without them it would be one. Empty otherwise.
   */
  flushBrokenBy: string[];
  canRecompile: boolean;
  /** Every population transition so far this study, oldest first. */
  invalidations: SnapshotInvalidation[];
}

/**
 * A card's face. Draft cards print the draft table's first five rows, showing
 * corrected values once the player has fixed them.
 */
function faceFor(
  card: TlfCard,
  draft: StagedTable | undefined,
  review: InspectionView | null
): CardFace {
  if (!draft) return card.face as CardFace;
  return {
    kind: "TABLE",
    columns: draft.columns.map((c) => c.label),
    rows: draft.rows.slice(0, 5).map((row, r) => ({
      label: row.label,
      values: draft.columns.map(
        (_, c) => review?.cells[r][c].display ?? draft.cells[r][c]
      ),
    })),
  };
}

const cardById = (scenario: Scenario, id: string): TlfCard | undefined =>
  scenario.deck.find((card) => card.id === id);

/** The draft as authored in the scenario, compiled against its own snapshot. */
const authoredDraft = (
  scenario: Scenario,
  card: TlfCard
): StagedTable | undefined =>
  card.draftId === undefined
    ? undefined
    : scenario.drawPile.find((draft) => draft.id === card.draftId);

/** The card's draft as it currently stands: recompiled, or as authored. */
const draftFor = (
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): StagedTable | undefined =>
  state.drafts[card.id] ?? authoredDraft(scenario, card);

const currentSnapshot = (state: TableState): PopulationSnapshot =>
  state.snapshots[state.snapshots.length - 1];

/**
 * A snapshot version by id. Every draft and card references a version in the
 * study's history, which always starts at the scenario's own snapshot.
 */
const snapshotById = (
  scenario: Scenario,
  state: TableState,
  id: string
): PopulationSnapshot =>
  state.snapshots.find((snapshot) => snapshot.id === id) ??
  scenario.populationSnapshot;

/** Validates a draft against the snapshot it was compiled from. */
const reportFor = (
  scenario: Scenario,
  state: TableState,
  draft: StagedTable
): QcReport =>
  validate(
    draft,
    snapshotById(scenario, state, draft.populationSnapshotId),
    scenario.rulebook
  );

/** The snapshot a dealt card was compiled against. */
const provenanceOf = (state: TableState, card: TlfCard): SnapshotRef =>
  state.provenance[card.id] ?? snapshotRef(currentSnapshot(state));

/** Whether its suit's membership has changed since the card was compiled. */
function isStale(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): boolean {
  const compiled = state.provenance[card.id];
  if (!compiled) return false;
  return !sameMembership(
    snapshotById(scenario, state, compiled.id),
    currentSnapshot(state),
    card.population
  );
}

/** A card as hand detection sees it: stale cards cannot make a flush. */
const classifiable = (scenario: Scenario, state: TableState, id: string) => {
  const card = cardById(scenario, id) as TlfCard;
  return { ...card, stale: isStale(scenario, state, card) };
};

const label = (card: TlfCard) => `${card.number} ${card.title}`;

/**
 * A card's number, plus its draft letter when the title carries one, so two
 * drafts of one table stay distinguishable: "Table 14.3.1 (Draft A)".
 */
export function cardShortName(card: TlfCard): string {
  const draft = /\(([^()]+)\)$/.exec(card.title);
  return draft ? `${card.number} (${draft[1]})` : card.number;
}

function nextEvent(
  state: TableState,
  kind: TableEvent["kind"],
  message: string
): TableEvent {
  return { kind, message, sequence: (state.lastEvent?.sequence ?? 0) + 1 };
}

const refuse = (state: TableState, message: string): TableState => ({
  ...state,
  lastEvent: nextEvent(state, "REFUSED", message),
});

const handName = (handType: HandClassification["handType"]) =>
  HAND_NAMES[handType];

/** Whether the Boss Blind's debuff disables this card. */
function isDebuffed(scenario: Scenario, card: TlfCard): boolean {
  const boss = scenario.boss;
  return (
    boss?.debuffType === "DISABLE_POPULATION" &&
    (boss.disabledPopulations ?? []).includes(card.population)
  );
}

/**
 * The Boss Blind's debuff as one explained rule result: a disabled card's
 * Chips, and any subject credit its draft earned, are cancelled. Its +Mult
 * and any zero-score rule still apply.
 */
function debuffFor(
  scenario: Scenario,
  card: TlfCard,
  results: readonly RuleCheckResult[]
): RuleCheckResult | null {
  if (!isDebuffed(scenario, card)) return null;
  const boss = scenario.boss as BossBlindModifier;
  const chips = card.chips + results.reduce((sum, r) => sum + r.chipsDelta, 0);
  return {
    ruleId: boss.id,
    passed: false,
    chipsDelta: -chips,
    multDelta: 0,
    evidence: `${scenario.title} (${boss.name}): ${card.number} is built on the ${POPULATION_LABELS[card.population]} population, so it scores 0 Chips (${chips} cancelled).`,
  };
}

/**
 * Rule results for a set of scoring cards. `revealedOnly` limits each card to
 * the findings its inspection has revealed (the preview); otherwise every true
 * finding counts, so an undiscovered fatal defect still zeroes the hand.
 */
/**
 * A stale card's Chips, and any subject credit its draft earned, cancelled
 * as one explained rule result. Its +Mult still counts.
 */
function staleFor(
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  results: readonly RuleCheckResult[]
): RuleCheckResult | null {
  if (!isStale(scenario, state, card)) return null;
  const compiled = provenanceOf(state, card);
  const current = currentSnapshot(state);
  const chips = card.chips + results.reduce((sum, r) => sum + r.chipsDelta, 0);
  return {
    ruleId: "STALE-SNAPSHOT",
    passed: false,
    chipsDelta: -chips,
    multDelta: 0,
    evidence: `${card.number} was compiled against ${compiled.id}, and ${current.id} has changed the ${POPULATION_LABELS[card.population]} population, so it scores 0 Chips (${chips} cancelled). ${STALE_ALERT}`,
  };
}

function scoreCards(
  scenario: Scenario,
  state: TableState,
  cards: readonly TlfCard[],
  handType: HandClassification["handType"],
  revealedOnly: boolean
): HandEvaluation {
  const ruleResults: RuleCheckResult[] = [];
  for (const card of cards) {
    const draft = draftFor(scenario, state, card);
    const inspection = state.inspections[card.id] ?? createInspectionState();
    const results: RuleCheckResult[] = [];
    if (draft) {
      const report = reportFor(scenario, state, draft);
      results.push(
        ...ruleResultsFor(report, scenario.rulebook, {
          resolvedFindingIds: inspection.resolvedFindingIds,
          visibleFindingIds: revealedOnly
            ? visibleFindingIds(report, inspection)
            : undefined,
        })
      );
    }
    ruleResults.push(...results);
    const cancelled =
      staleFor(scenario, state, card, results) ??
      debuffFor(scenario, card, results);
    if (cancelled) ruleResults.push(cancelled);
  }
  return evaluateHand({
    handType,
    cards: cards.map((c) => ({ id: c.id, chips: c.chips, mult: c.mult })),
    ruleResults,
  });
}

/**
 * Compiles a draft against the current snapshot. Cells whose every finding
 * the reviewer corrected are recompiled correctly; see `compileDraft`.
 */
function compileAgainstCurrent(
  scenario: Scenario,
  state: TableState,
  draft: StagedTable,
  inspection: InspectionState | undefined
): StagedTable {
  const corrected = new Set<string>();
  if (inspection) {
    const resolved = new Set(inspection.resolvedFindingIds);
    const byCell = new Map<string, boolean>();
    for (const f of reportFor(scenario, state, draft).findings) {
      const key = `${f.cell.row}:${f.cell.col}`;
      byCell.set(key, (byCell.get(key) ?? true) && resolved.has(f.id));
    }
    for (const [key, allResolved] of byCell) {
      if (allResolved) corrected.add(key);
    }
  }
  return compileDraft(
    draft,
    snapshotById(scenario, state, draft.populationSnapshotId),
    currentSnapshot(state),
    scenario.rulebook,
    corrected
  );
}

/**
 * Deals from the deck until the hand is full or the deck is empty. Each card
 * is compiled against the current snapshot as it is drawn.
 */
function refill(scenario: Scenario, state: TableState): TableState {
  const hand = [...state.hand];
  const provenance = { ...state.provenance };
  const drafts = { ...state.drafts };
  const current = currentSnapshot(state);
  let index = state.deckIndex;
  while (
    hand.length < scenario.table.handSize &&
    index < scenario.deck.length
  ) {
    const card = scenario.deck[index];
    hand.push(card.id);
    provenance[card.id] = snapshotRef(current);
    const authored = authoredDraft(scenario, card);
    if (authored && authored.populationSnapshotId !== current.id) {
      drafts[card.id] = compileAgainstCurrent(
        scenario,
        state,
        authored,
        undefined
      );
    }
    index += 1;
  }
  return { ...state, hand, deckIndex: index, provenance, drafts };
}

/**
 * Fresh Card Table state: the first hand dealt against the study's current
 * snapshot, full CPU. `history` carries earlier Blinds' snapshot versions;
 * without it the study starts at the scenario's own snapshot.
 */
export function createTableState(
  scenario: Scenario,
  history: StudyHistory = {
    snapshots: [scenario.populationSnapshot],
    invalidations: [],
  }
): TableState {
  return refill(scenario, {
    scenarioId: scenario.id,
    deckIndex: 0,
    hand: [],
    selected: [],
    inspections: {},
    inspecting: null,
    cpu: { available: scenario.table.startingCpu, spent: 0 },
    roundScore: 0,
    handsPlayed: 0,
    discards: 0,
    status: "REVIEWING",
    lastPlay: null,
    lastEvent: null,
    snapshots: [...history.snapshots],
    invalidations: [...history.invalidations],
    provenance: {},
    drafts: {},
    opening: {
      snapshots: history.snapshots.length,
      invalidations: history.invalidations.length,
    },
  });
}

/** The study history this state carries, for the next Blind. */
export function studyHistory(state: TableState): StudyHistory {
  return { snapshots: state.snapshots, invalidations: state.invalidations };
}

/** Removes the selected cards and pays for the action. Does not refill. */
function spendSelection(state: TableState, action: CpuAction): TableState {
  const removed = new Set(state.selected);
  const keep = <T>(record: Record<string, T>) =>
    Object.fromEntries(
      Object.entries(record).filter(([id]) => !removed.has(id))
    );
  return {
    ...state,
    cpu: cpuReducer(state.cpu, { type: "SPEND", action }),
    hand: state.hand.filter((id) => !removed.has(id)),
    selected: [],
    inspections: keep(state.inspections),
    provenance: keep(state.provenance),
    drafts: keep(state.drafts),
    inspecting: null,
  };
}

/**
 * Applies the scenario's study events due after this many hands, and records
 * which cards in hand each transition staled. Returns the announcement.
 */
function applyStudyEvents(
  scenario: Scenario,
  state: TableState
): { state: TableState; message: string } {
  const due: StudyEvent[] = (scenario.events ?? []).filter(
    (event) => event.afterHands === state.handsPlayed
  );
  let next = state;
  const messages: string[] = [];
  for (const { transition } of due) {
    const from = currentSnapshot(next);
    const outcome = applyTransition(from, transition);
    if (!outcome.ok) continue;
    next = { ...next, snapshots: [...next.snapshots, outcome.snapshot] };
    const staleCardIds = next.hand.filter((id) => {
      const card = cardById(scenario, id) as TlfCard;
      return (
        outcome.changed.includes(card.population) &&
        isStale(scenario, next, card)
      );
    });
    next = {
      ...next,
      invalidations: [
        ...next.invalidations,
        {
          transitionId: transition.id,
          subjectId: transition.subjectId,
          reason: transition.reason,
          change: transition.change,
          populations: outcome.changed,
          from: snapshotRef(from),
          to: snapshotRef(outcome.snapshot),
          staleCardIds,
        },
      ],
    };
    const names = staleCardIds.map((id) =>
      cardShortName(cardById(scenario, id) as TlfCard)
    );
    const populations = outcome.changed
      .map((p) => POPULATION_LABELS[p])
      .join(", ");
    messages.push(
      `${transition.description} ${populations} population now ${outcome.snapshot.id}. ${
        names.length === 0
          ? "No output in hand is stale."
          : `Stale: ${names.join(", ")}.`
      }`
    );
  }
  return { state: next, message: messages.join(" ") };
}

function settle(
  scenario: Scenario,
  state: TableState
): { state: TableState; outcome: string } {
  if (state.roundScore >= scenario.blind.quota) {
    return {
      state: { ...state, status: "CLEARED" },
      outcome: `${scenario.blind.name} cleared.`,
    };
  }
  if (!canAfford(state.cpu, "PLAY_HAND") || state.hand.length === 0) {
    return {
      state: { ...state, status: "FAILED" },
      outcome: `${scenario.blind.name} failed: no playable hands remain.`,
    };
  }
  return { state, outcome: "" };
}

/**
 * Pure Card Table reducer. It composes the CPU reducer and the per-card
 * inspection logic shared with the QC Desk. Refused actions leave state
 * unchanged apart from the announced reason.
 */
export function advanceTable(
  scenario: Scenario,
  state: TableState,
  action: TableAction
): TableState {
  if (action.type === "RESET") {
    return {
      ...createTableState(scenario, {
        snapshots: state.snapshots.slice(0, state.opening.snapshots),
        invalidations: state.invalidations.slice(
          0,
          state.opening.invalidations
        ),
      }),
      lastEvent: nextEvent(state, "RESET", `${scenario.blind.name} restarted.`),
    };
  }
  if (state.status !== "REVIEWING") {
    return refuse(state, "The Blind is over. Restart to play again.");
  }

  switch (action.type) {
    case "MOVE_CARD": {
      const from = state.hand.indexOf(action.cardId);
      if (from === -1) return refuse(state, "That card is not in your hand.");
      const to = Math.max(
        0,
        Math.min(state.hand.length - 1, Math.trunc(action.toIndex) || 0)
      );
      const card = cardById(scenario, action.cardId) as TlfCard;
      if (to === from) {
        const where =
          to === 0
            ? "first"
            : to === state.hand.length - 1
              ? "last"
              : `at position ${to + 1}`;
        return refuse(state, `${card.number} is already ${where} in the hand.`);
      }
      const hand = [...state.hand];
      hand.splice(from, 1);
      hand.splice(to, 0, action.cardId);
      return {
        ...state,
        hand,
        lastEvent: nextEvent(
          state,
          "MOVED",
          `${card.number} moved to position ${to + 1} of ${hand.length}.`
        ),
      };
    }

    case "TOGGLE_SELECT": {
      const card = cardById(scenario, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      const isSelected = state.selected.includes(card.id);
      if (!isSelected && state.selected.length >= scenario.table.maxSelection) {
        return refuse(
          state,
          `You can select up to ${scenario.table.maxSelection} cards.`
        );
      }
      const selected = isSelected
        ? state.selected.filter((id) => id !== card.id)
        : [...state.selected, card.id];
      const classification = classifyHand(
        selected.map((id) => classifiable(scenario, state, id))
      );
      const summary = classification
        ? `${selected.length} selected: ${handName(classification.handType)}.`
        : "Nothing selected.";
      return {
        ...state,
        selected,
        lastEvent: nextEvent(
          state,
          isSelected ? "DESELECTED" : "SELECTED",
          `${isSelected ? "Deselected" : "Selected"} ${label(card)}. ${summary}`
        ),
      };
    }

    case "PLAY_HAND": {
      if (state.selected.length === 0) {
        return refuse(state, "Select at least one card to play.");
      }
      const stale = state.selected
        .map((id) => cardById(scenario, id) as TlfCard)
        .filter((card) => isStale(scenario, state, card));
      if (stale.length > 0) {
        return refuse(
          state,
          `${STALE_ALERT} Stale: ${stale.map(cardShortName).join(", ")}.`
        );
      }
      if (!canAfford(state.cpu, "PLAY_HAND")) {
        return refuse(state, `Play Hand needs ${CPU_COSTS.PLAY_HAND} CPU.`);
      }
      const classification = classifyHand(
        state.selected.map((id) => classifiable(scenario, state, id))
      ) as HandClassification;
      const scoring = classification.scoringCardIds.map(
        (id) => cardById(scenario, id) as TlfCard
      );
      const evaluation = scoreCards(
        scenario,
        state,
        scoring,
        classification.handType,
        false
      );
      // The study event lands between the hand being submitted and the inbox
      // refilling, so new drafts compile against the new snapshot and the
      // cards still in hand go stale.
      const { state: changed, message: news } = applyStudyEvents(
        scenario,
        spendSelection(
          {
            ...state,
            roundScore: state.roundScore + evaluation.score,
            handsPlayed: state.handsPlayed + 1,
            lastPlay: {
              classification,
              evaluation,
              cardIds: [...state.selected],
            },
          },
          "PLAY_HAND"
        )
      );
      const { state: settled, outcome } = settle(
        scenario,
        refill(scenario, changed)
      );
      const zero = evaluation.zeroRule.triggered
        ? " Zero-score rule triggered."
        : "";
      return {
        ...settled,
        lastEvent: nextEvent(
          state,
          "PLAYED",
          `${handName(classification.handType)} scored ${evaluation.score} (${evaluation.chips.total} Chips × ${evaluation.finalMult} Mult).${zero} Round ${settled.roundScore} of ${scenario.blind.quota}.${outcome ? ` ${outcome}` : ""}${news ? ` ${news}` : ""}`
        ),
      };
    }

    case "DISCARD": {
      if (state.selected.length === 0) {
        return refuse(state, "Select at least one card to discard.");
      }
      if (!canAfford(state.cpu, "DISCARD")) {
        return refuse(state, `Discard needs ${CPU_COSTS.DISCARD} CPU.`);
      }
      const count = state.selected.length;
      const { state: settled, outcome } = settle(
        scenario,
        refill(
          scenario,
          spendSelection({ ...state, discards: state.discards + 1 }, "DISCARD")
        )
      );
      return {
        ...settled,
        lastEvent: nextEvent(
          state,
          "DISCARDED",
          `Discarded ${count} card${count === 1 ? "" : "s"}.${outcome ? ` ${outcome}` : ""}`
        ),
      };
    }

    case "INSPECT_CARD": {
      const card = cardById(scenario, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      if (!draftFor(scenario, state, card)) {
        return refuse(
          state,
          `${label(card)} has no reviewable cells in this slice.`
        );
      }
      if (state.inspections[card.id]) {
        return {
          ...state,
          inspecting: card.id,
          lastEvent: nextEvent(
            state,
            "INSPECT_OPENED",
            `Inspecting ${label(card)}.`
          ),
        };
      }
      if (!canAfford(state.cpu, "INSPECT")) {
        return refuse(state, `Inspect needs ${CPU_COSTS.INSPECT} CPU.`);
      }
      return {
        ...state,
        cpu: cpuReducer(state.cpu, { type: "SPEND", action: "INSPECT" }),
        inspections: {
          ...state.inspections,
          [card.id]: createInspectionState(),
        },
        inspecting: card.id,
        lastEvent: nextEvent(
          state,
          "INSPECT_OPENED",
          `Inspecting ${label(card)} for ${CPU_COSTS.INSPECT} CPU.`
        ),
      };
    }

    case "RECOMPILE": {
      const card = cardById(scenario, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      const current = currentSnapshot(state);
      if (!isStale(scenario, state, card)) {
        return refuse(
          state,
          `${card.number} is current with ${current.id}; nothing to recompile.`
        );
      }
      if (!canAfford(state.cpu, "RECOMPILE")) {
        return refuse(state, `Recompile needs ${CPU_COSTS.RECOMPILE} CPU.`);
      }
      const draft = draftFor(scenario, state, card);
      const { [card.id]: _review, ...inspections } = state.inspections;
      return {
        ...state,
        cpu: cpuReducer(state.cpu, { type: "SPEND", action: "RECOMPILE" }),
        provenance: { ...state.provenance, [card.id]: snapshotRef(current) },
        drafts: draft
          ? {
              ...state.drafts,
              [card.id]: compileAgainstCurrent(
                scenario,
                state,
                draft,
                state.inspections[card.id]
              ),
            }
          : state.drafts,
        // A recompiled output is a new output: its review starts over.
        inspections,
        inspecting: state.inspecting === card.id ? null : state.inspecting,
        lastEvent: nextEvent(
          state,
          "RECOMPILED",
          `Recompiled ${label(card)} against ${current.id} for ${CPU_COSTS.RECOMPILE} CPU.${draft ? " Inspect it again to verify the rerun." : ""}`
        ),
      };
    }

    case "CLOSE_INSPECT": {
      if (state.inspecting === null) return state;
      return {
        ...state,
        inspecting: null,
        lastEvent: nextEvent(state, "INSPECT_CLOSED", "Inspect closed."),
      };
    }

    case "INSPECT_CELL":
    case "CORRECT_FINDING": {
      const card = state.inspecting
        ? cardById(scenario, state.inspecting)
        : undefined;
      const draft = card ? draftFor(scenario, state, card) : undefined;
      if (!card || !draft) {
        return refuse(state, "Open a card's Inspect view first.");
      }
      const report = reportFor(scenario, state, draft);
      const current = state.inspections[card.id];
      const outcome =
        action.type === "INSPECT_CELL"
          ? inspectCell(draft, report, current, action.row, action.col)
          : correctFinding(report, current, action.findingId);
      if (!outcome.ok) return refuse(state, outcome.message);
      return {
        ...state,
        inspections: { ...state.inspections, [card.id]: outcome.inspection },
        lastEvent: nextEvent(
          state,
          action.type === "INSPECT_CELL" ? "INSPECTED" : "CORRECTED",
          outcome.message
        ),
      };
    }
  }
}

/** Derives everything the Card Table renders. Pure; safe on every render. */
export function deriveTableView(
  scenario: Scenario,
  state: TableState
): TableView {
  const selected = new Set(state.selected);
  const hand = state.hand.map((id): TableCardView => {
    const card = cardById(scenario, id) as TlfCard;
    const draft = draftFor(scenario, state, card);
    const inspection = state.inspections[id];
    const review =
      draft && inspection
        ? deriveInspectionView(
            draft,
            reportFor(scenario, state, draft),
            inspection
          )
        : null;
    const openRedlines = review?.openFindings.length ?? 0;
    const stale = isStale(scenario, state, card);
    const stamps: CardStamp[] = [];
    if (stale) stamps.push("STALE");
    if (openRedlines > 0) stamps.push("REDLINE");
    // QC ✓ only once every cell is reviewed, so it never vouches for a
    // defect the player has not looked for.
    if (review && review.reviewedCells === review.totalCells && !openRedlines) {
      stamps.push("QC_PASS");
    }
    return {
      card,
      selected: selected.has(id),
      inspectable: draft !== undefined,
      inspected: inspection !== undefined,
      unverified: draft !== undefined && inspection === undefined,
      openRedlines,
      face: faceFor(card, draft, review),
      stamps,
      debuffed: isDebuffed(scenario, card),
      stale,
      provenance: provenanceOf(state, card),
    };
  });

  const selectedCards = state.selected.map((id) =>
    classifiable(scenario, state, id)
  );
  const classification = classifyHand(selectedCards);
  const preview = classification
    ? scoreCards(
        scenario,
        state,
        classification.scoringCardIds.map(
          (id) => cardById(scenario, id) as TlfCard
        ),
        classification.handType,
        true
      )
    : null;
  const staleSelected = selectedCards.filter((c) => c.stale).map((c) => c.id);
  const flushBrokenBy =
    staleSelected.length > 0 &&
    classification?.handType !== "POPULATION_FLUSH" &&
    classifyHand(selectedCards.map((c) => ({ ...c, stale: false })))
      ?.handType === "POPULATION_FLUSH"
      ? staleSelected
      : [];

  let inspection: TableInspectionView | null = null;
  const inspectingCard = state.inspecting
    ? cardById(scenario, state.inspecting)
    : undefined;
  const inspectingDraft = inspectingCard
    ? draftFor(scenario, state, inspectingCard)
    : undefined;
  if (
    inspectingCard &&
    inspectingDraft &&
    state.inspections[inspectingCard.id]
  ) {
    const report = reportFor(scenario, state, inspectingDraft);
    const expected = scoreCards(
      scenario,
      state,
      [inspectingCard],
      "HIGH_TABLE",
      true
    );
    inspection = {
      ...deriveInspectionView(
        inspectingDraft,
        report,
        state.inspections[inspectingCard.id]
      ),
      card: inspectingCard,
      table: inspectingDraft,
      expected,
      unpenalizedMult: unpenalizedMult(expected),
      provenance: provenanceOf(state, inspectingCard),
      stale: isStale(scenario, state, inspectingCard),
    };
  }

  const reviewing = state.status === "REVIEWING";
  const lastTimeline = state.lastPlay
    ? scoreTimeline(state.lastPlay.evaluation, {
        roundScoreBefore: state.roundScore - state.lastPlay.evaluation.score,
        target: scenario.blind.quota,
        cardNames: Object.fromEntries(
          scenario.deck.map((c) => [c.id, c.number])
        ),
        zeroRuleLabels: Object.fromEntries(
          scenario.rulebook.rules
            .filter((r) => r.severity === "FATAL")
            .map((r) => [r.id, `${r.category} ERROR`])
        ),
      })
    : null;
  return {
    hand,
    classification,
    preview,
    previewUnpenalizedMult: preview ? unpenalizedMult(preview) : 0,
    previewUnverified: hand.some((h) => h.selected && h.unverified),
    quota: scenario.blind.quota,
    deckRemaining: scenario.deck.length - state.deckIndex,
    spentCount: state.deckIndex - state.hand.length,
    drawPile: Array.from(
      { length: scenario.deck.length - state.deckIndex },
      (_, i): RedactedCard => ({
        slot: `draw-${state.deckIndex + i}`,
        faceDown: true,
      })
    ),
    handsAffordable: Math.floor(state.cpu.available / CPU_COSTS.PLAY_HAND),
    discardsAffordable: Math.floor(state.cpu.available / CPU_COSTS.DISCARD),
    canPlay:
      reviewing &&
      state.selected.length > 0 &&
      staleSelected.length === 0 &&
      canAfford(state.cpu, "PLAY_HAND"),
    canDiscard:
      reviewing && state.selected.length > 0 && canAfford(state.cpu, "DISCARD"),
    canInspect: reviewing && canAfford(state.cpu, "INSPECT"),
    inspection,
    lastTimeline,
    snapshot: snapshotRef(currentSnapshot(state)),
    staleSelected,
    playBlockedReason: staleSelected.length > 0 ? STALE_ALERT : null,
    flushBrokenBy,
    canRecompile: reviewing && canAfford(state.cpu, "RECOMPILE"),
    invalidations: state.invalidations,
  };
}
