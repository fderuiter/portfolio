import type {
  HandClassification,
  HandEvaluation,
  QcReport,
  RuleCheckResult,
  Scenario,
  StagedTable,
  TlfCard,
  CardFace,
  CardStamp,
  RedactedCard,
} from "../types";
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
    | "RESET";
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
}

/** The open Inspect drawer's content. */
export interface TableInspectionView extends InspectionView {
  card: TlfCard;
  table: StagedTable;
  /** The card's own value as a High Table, from revealed findings. */
  expected: HandEvaluation;
  unpenalizedMult: number;
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

const draftFor = (
  scenario: Scenario,
  card: TlfCard
): StagedTable | undefined =>
  card.draftId === undefined
    ? undefined
    : scenario.drawPile.find((draft) => draft.id === card.draftId);

const reportFor = (scenario: Scenario, draft: StagedTable): QcReport =>
  validate(draft, scenario.populationSnapshot, scenario.rulebook);

const label = (card: TlfCard) => `${card.number} ${card.title}`;

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

/**
 * Rule results for a set of scoring cards. `revealedOnly` limits each card to
 * the findings its inspection has revealed (the preview); otherwise every true
 * finding counts, so an undiscovered fatal defect still zeroes the hand.
 */
function scoreCards(
  scenario: Scenario,
  cards: readonly TlfCard[],
  inspections: Record<string, InspectionState>,
  handType: HandClassification["handType"],
  revealedOnly: boolean
): HandEvaluation {
  const ruleResults: RuleCheckResult[] = [];
  for (const card of cards) {
    const draft = draftFor(scenario, card);
    if (!draft) continue;
    const report = reportFor(scenario, draft);
    const inspection = inspections[card.id] ?? createInspectionState();
    ruleResults.push(
      ...ruleResultsFor(report, scenario.rulebook, {
        resolvedFindingIds: inspection.resolvedFindingIds,
        visibleFindingIds: revealedOnly
          ? visibleFindingIds(report, inspection)
          : undefined,
      })
    );
  }
  return evaluateHand({
    handType,
    cards: cards.map((c) => ({ id: c.id, chips: c.chips, mult: c.mult })),
    ruleResults,
  });
}

/** Deals from the deck until the hand is full or the deck is empty. */
function refill(scenario: Scenario, hand: string[], deckIndex: number) {
  const next = [...hand];
  let index = deckIndex;
  while (
    next.length < scenario.table.handSize &&
    index < scenario.deck.length
  ) {
    next.push(scenario.deck[index].id);
    index += 1;
  }
  return { hand: next, deckIndex: index };
}

/** Fresh Card Table state: the first hand dealt, full CPU. */
export function createTableState(scenario: Scenario): TableState {
  const { hand, deckIndex } = refill(scenario, [], 0);
  return {
    scenarioId: scenario.id,
    deckIndex,
    hand,
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
  };
}

/** Removes the selected cards, refills the hand and settles the Blind. */
function spendSelection(
  scenario: Scenario,
  state: TableState,
  action: CpuAction
): TableState {
  const removed = new Set(state.selected);
  const inspections = Object.fromEntries(
    Object.entries(state.inspections).filter(([id]) => !removed.has(id))
  );
  const { hand, deckIndex } = refill(
    scenario,
    state.hand.filter((id) => !removed.has(id)),
    state.deckIndex
  );
  return {
    ...state,
    cpu: cpuReducer(state.cpu, { type: "SPEND", action }),
    hand,
    deckIndex,
    selected: [],
    inspections,
    inspecting: null,
  };
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
      ...createTableState(scenario),
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
        selected.map((id) => cardById(scenario, id) as TlfCard)
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
      if (!canAfford(state.cpu, "PLAY_HAND")) {
        return refuse(state, `Play Hand needs ${CPU_COSTS.PLAY_HAND} CPU.`);
      }
      const cards = state.selected.map(
        (id) => cardById(scenario, id) as TlfCard
      );
      const classification = classifyHand(cards) as HandClassification;
      const scoring = classification.scoringCardIds.map(
        (id) => cardById(scenario, id) as TlfCard
      );
      const evaluation = scoreCards(
        scenario,
        scoring,
        state.inspections,
        classification.handType,
        false
      );
      const played = spendSelection(
        scenario,
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
      );
      const { state: settled, outcome } = settle(scenario, played);
      const zero = evaluation.zeroRule.triggered
        ? " Zero-score rule triggered."
        : "";
      return {
        ...settled,
        lastEvent: nextEvent(
          state,
          "PLAYED",
          `${handName(classification.handType)} scored ${evaluation.score} (${evaluation.chips.total} Chips × ${evaluation.finalMult} Mult).${zero} Round ${settled.roundScore} of ${scenario.blind.quota}.${outcome ? ` ${outcome}` : ""}`
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
        spendSelection(
          scenario,
          { ...state, discards: state.discards + 1 },
          "DISCARD"
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
      if (!draftFor(scenario, card)) {
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
      const draft = card ? draftFor(scenario, card) : undefined;
      if (!card || !draft) {
        return refuse(state, "Open a card's Inspect view first.");
      }
      const report = reportFor(scenario, draft);
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
    const draft = draftFor(scenario, card);
    const inspection = state.inspections[id];
    const review =
      draft && inspection
        ? deriveInspectionView(draft, reportFor(scenario, draft), inspection)
        : null;
    const openRedlines = review?.openFindings.length ?? 0;
    const stamps: CardStamp[] = [];
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
    };
  });

  const selectedCards = state.selected.map(
    (id) => cardById(scenario, id) as TlfCard
  );
  const classification = classifyHand(selectedCards);
  const preview = classification
    ? scoreCards(
        scenario,
        classification.scoringCardIds.map(
          (id) => cardById(scenario, id) as TlfCard
        ),
        state.inspections,
        classification.handType,
        true
      )
    : null;

  let inspection: TableInspectionView | null = null;
  const inspectingCard = state.inspecting
    ? cardById(scenario, state.inspecting)
    : undefined;
  const inspectingDraft = inspectingCard
    ? draftFor(scenario, inspectingCard)
    : undefined;
  if (
    inspectingCard &&
    inspectingDraft &&
    state.inspections[inspectingCard.id]
  ) {
    const report = reportFor(scenario, inspectingDraft);
    const expected = scoreCards(
      scenario,
      [inspectingCard],
      state.inspections,
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
      canAfford(state.cpu, "PLAY_HAND"),
    canDiscard:
      reviewing && state.selected.length > 0 && canAfford(state.cpu, "DISCARD"),
    canInspect: reviewing && canAfford(state.cpu, "INSPECT"),
    inspection,
    lastTimeline,
  };
}
