import type {
  BossBlindModifier,
  FootnoteSeal,
  HandClassification,
  HandEvaluation,
  PopulationSnapshot,
  PopulationType,
  SapRulebook,
  TableShellSpec,
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
import { compileDraft, compileShell } from "./compile";
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
  membership,
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
    | "RECOMPILED"
    | "ALLOCATED"
    | "SEALED"
    | "SOLD";
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

/** A footnote seal in the consumable tray. `id` is unique within the tray. */
export interface Consumable {
  id: string;
  seal: FootnoteSeal;
}

/**
 * What the player carries between Blinds besides the study: the consumable
 * tray and the study budget. The Procurement Shop spends and fills it.
 */
export interface Inventory {
  consumables: Consumable[];
  budget: number;
}

/** How many consumables the tray holds. */
export const CONSUMABLE_SLOTS = 2;

const EMPTY_INVENTORY: Inventory = { consumables: [], budget: 0 };

/** The alert shown when a hand holds a blank shell with no data allocated. */
export const EMPTY_SHELL_ALERT =
  "An empty shell cannot compile: allocate an analysis set to it first.";

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
  /** The analysis set allocated to each blank shell in hand. Final once set. */
  allocations: Record<string, PopulationType>;
  /** Footnote seals affixed to each card in hand, in the order applied. */
  seals: Record<string, FootnoteSeal[]>;
  /** The consumable tray, at most `CONSUMABLE_SLOTS`. */
  consumables: Consumable[];
  /** The study budget: the shop's money. */
  budget: number;
  /**
   * How much of `snapshots` and `invalidations` predates this Blind, and the
   * inventory it started with, so a restart returns to exactly that.
   */
  opening: { snapshots: number; invalidations: number; inventory: Inventory };
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
  /** Allocates an analysis set to a blank shell, which compiles it. Free and final. */
  | { type: "ALLOCATE"; cardId: string; population: PopulationType }
  /** Affixes a footnote seal from the tray to a card. Free; uses the seal up. */
  | { type: "APPLY_SEAL"; consumableId: string; cardId: string }
  /** Sells a tray consumable for its sell value. */
  | { type: "SELL_CONSUMABLE"; consumableId: string }
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
  /** A blank shell with no analysis set allocated: it cannot be played yet. */
  blank: boolean;
  /** The analysis sets this card's shell accepts. Empty for face-only cards. */
  compatiblePopulations: PopulationType[];
  /** Footnote seals affixed to this output, in the order applied. */
  seals: FootnoteSeal[];
  /** How many footnote seals this output takes: its shell's slots. */
  footnoteSlots: number;
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
  /** Selected blank shells with no analysis set allocated, in selection order. */
  emptySelected: string[];
  /** The consumable tray. */
  consumables: Consumable[];
  consumableSlots: number;
  budget: number;
}

/** One analysis set a blank shell could be compiled on, previewed before committing. */
export interface AllocationOption {
  population: PopulationType;
  /** The snapshot the shell would be compiled against. */
  snapshot: SnapshotRef;
  /** Subjects in that population in the snapshot: the output's N. */
  subjects: number;
  /** Why this set cannot be allocated, or null. */
  refusal: string | null;
  /** The hand the selection would make with this allocation. */
  classification: HandClassification | null;
  /** That hand scored from revealed findings only: an estimate, unverified. */
  estimate: HandEvaluation | null;
}

/**
 * A card's face. Draft cards print the draft table's first five rows, showing
 * corrected values once the player has fixed them.
 */
function faceFor(
  card: TlfCard,
  draft: StagedTable | undefined,
  review: InspectionView | null,
  shell: TableShellSpec | undefined
): CardFace {
  if (!draft && shell?.layout) {
    const { columns, rows } = shell.layout;
    return {
      kind: "TABLE",
      columns: columns.map((c) => c.label),
      rows: rows.slice(0, 5).map((row) => ({
        label: row.label,
        values: columns.map(() => "·"),
      })),
    };
  }
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

const deckCard = (scenario: Scenario, id: string): TlfCard | undefined =>
  scenario.deck.find((card) => card.id === id);

/**
 * A card as it stands on this table: an allocated blank shell takes the suit
 * of the analysis set it was compiled on.
 */
function cardById(
  scenario: Scenario,
  state: TableState,
  id: string
): TlfCard | undefined {
  const card = deckCard(scenario, id);
  const allocated = state.allocations[id];
  return card && allocated ? { ...card, population: allocated } : card;
}

const shellById = (
  scenario: Scenario,
  id: string | undefined
): TableShellSpec | undefined =>
  id === undefined ? undefined : scenario.shells.find((s) => s.id === id);

/** The analysis sets a shell may be run on. */
const compatibleWith = (shell: TableShellSpec): PopulationType[] =>
  shell.compatiblePopulations ?? [shell.targetPopulation];

/** A blank shell with nothing allocated yet. */
const isBlank = (state: TableState, card: TlfCard): boolean =>
  card.shellId !== undefined && state.allocations[card.id] === undefined;

/**
 * The rulebook a card's output is checked against. An allocated shell is
 * held to its own analysis set, which the SAP names as valid for it.
 */
function rulebookFor(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): SapRulebook {
  const allocated = state.allocations[card.id];
  return allocated
    ? { ...scenario.rulebook, populationSuit: allocated }
    : scenario.rulebook;
}

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

/** Validates a card's draft against the snapshot it was compiled from. */
const reportFor = (
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  draft: StagedTable
): QcReport =>
  validate(
    draft,
    snapshotById(scenario, state, draft.populationSnapshotId),
    rulebookFor(scenario, state, card)
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

/**
 * A card as hand detection sees it: stale cards, and blank shells with no
 * data, cannot make a flush.
 */
const classifiable = (scenario: Scenario, state: TableState, id: string) => {
  const card = cardById(scenario, state, id) as TlfCard;
  return {
    ...card,
    stale: isStale(scenario, state, card) || isBlank(state, card),
  };
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

/** How many footnote seals a card takes: its shell's slots, or none. */
function footnoteSlotsOf(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): number {
  const shellId = card.shellId ?? draftFor(scenario, state, card)?.shellId;
  return shellById(scenario, shellId)?.allowedFootnoteSlots ?? 0;
}

/** Why a seal cannot be affixed to a card, or null when it can. */
function sealRefusal(
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  seal: FootnoteSeal
): string | null {
  const name = cardShortName(card);
  if (isBlank(state, card)) {
    return `${name} is an empty shell: allocate an analysis set before adding footnotes.`;
  }
  const slots = footnoteSlotsOf(scenario, state, card);
  if (slots === 0) {
    return `${name} has no footnote slot: only outputs compiled from a table shell take footnotes.`;
  }
  if ((state.seals[card.id] ?? []).length >= slots) {
    return `${name} has no free footnote slot.`;
  }
  const { cardTypes, populations, topics } = seal.eligible;
  if (cardTypes && !cardTypes.includes(card.cardType)) {
    return `${seal.name} applies to ${cardTypes.map((t) => t.toLowerCase()).join(" and ")} outputs only.`;
  }
  if (populations && !populations.includes(card.population)) {
    return `${seal.name} applies to ${populations.map((p) => POPULATION_LABELS[p]).join(" and ")} outputs only; ${name} is built on ${POPULATION_LABELS[card.population]}.`;
  }
  if (topics && !topics.includes(card.topic)) {
    return `${seal.name} does not apply to ${name}.`;
  }
  if (
    seal.effect.kind === "WAIVE" &&
    waivedRules(scenario, state, card, [seal]).length === 0
  ) {
    return `No SAP rule for ${name} accepts the ${seal.name} footnote, so it has nothing to waive there.`;
  }
  return null;
}

/** A seal's effect in words, for announcements. */
function sealEffectText(
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  seal: FootnoteSeal
): string {
  switch (seal.effect.kind) {
    case "PLUS_CHIPS":
      return `+${seal.effect.value} Chips`;
    case "PLUS_MULT":
      return `+${seal.effect.value} Mult`;
    case "WAIVE":
      return `waives ${waivedRules(scenario, state, card, [seal]).join(", ")} redlines`;
  }
}

/** The rules a card's SAP lets these seals waive. */
const waivedRules = (
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  seals: readonly FootnoteSeal[]
): string[] =>
  rulebookFor(scenario, state, card)
    .rules.filter((rule) =>
      seals.some(
        (seal) =>
          seal.effect.kind === "WAIVE" &&
          (rule.waivableBy ?? []).includes(seal.id)
      )
    )
    .map((rule) => rule.id);

/**
 * Applies a card's footnote seals to its rule results. A waiver turns the
 * redline of a rule the SAP declares waivable into a passed result that says
 * which footnote waived it; a fatal result is never touched. A bonus seal
 * adds its own `SEAL-*` result. Either way the seal stays traceable.
 */
function withSeals(
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  results: readonly RuleCheckResult[]
): RuleCheckResult[] {
  const seals = state.seals[card.id] ?? [];
  const rules = rulebookFor(scenario, state, card).rules;
  const next = results.map((result) => {
    if (result.passed || result.multMultiplier !== undefined) return result;
    const rule = rules.find((r) => r.id === result.ruleId);
    const seal = seals.find(
      (s) =>
        s.effect.kind === "WAIVE" && (rule?.waivableBy ?? []).includes(s.id)
    );
    if (!seal) return result;
    return {
      ...result,
      passed: true,
      multDelta: 0,
      evidence: `Waived by footnote seal ${seal.name}: "${seal.footnote}" ${result.evidence}`,
    };
  });
  for (const seal of seals) {
    if (seal.effect.kind === "WAIVE") continue;
    const chips = seal.effect.kind === "PLUS_CHIPS" ? seal.effect.value : 0;
    const mult = seal.effect.kind === "PLUS_MULT" ? seal.effect.value : 0;
    next.push({
      ruleId: `SEAL-${seal.id}`,
      passed: true,
      chipsDelta: chips,
      multDelta: mult,
      evidence: `${card.number} carries the ${seal.name} footnote: "${seal.footnote}"`,
    });
  }
  return next;
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
    let results: RuleCheckResult[] = [];
    if (draft) {
      const report = reportFor(scenario, state, card, draft);
      results.push(
        ...ruleResultsFor(report, rulebookFor(scenario, state, card), {
          resolvedFindingIds: inspection.resolvedFindingIds,
          visibleFindingIds: revealedOnly
            ? visibleFindingIds(report, inspection)
            : undefined,
        })
      );
    }
    results = withSeals(scenario, state, card, results);
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
  card: TlfCard,
  draft: StagedTable,
  inspection: InspectionState | undefined
): StagedTable {
  const corrected = new Set<string>();
  if (inspection) {
    const resolved = new Set(inspection.resolvedFindingIds);
    const byCell = new Map<string, boolean>();
    for (const f of reportFor(scenario, state, card, draft).findings) {
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
    rulebookFor(scenario, state, card),
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
    // A blank shell has no data yet: it gets provenance when it is compiled.
    if (card.shellId === undefined) provenance[card.id] = snapshotRef(current);
    const authored = authoredDraft(scenario, card);
    if (authored && authored.populationSnapshotId !== current.id) {
      drafts[card.id] = compileAgainstCurrent(
        scenario,
        state,
        card,
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
 * snapshot, CPU replenished to the Blind's allocation. `history` carries
 * earlier Blinds' snapshot versions; without it the study starts at the
 * scenario's own snapshot. `inventory` is the tray and budget carried in;
 * the Blind's granted seals fill any free tray slots.
 */
export function createTableState(
  scenario: Scenario,
  history: StudyHistory = {
    snapshots: [scenario.populationSnapshot],
    invalidations: [],
  },
  inventory: Inventory = EMPTY_INVENTORY
): TableState {
  const consumables = [...inventory.consumables];
  for (const seal of scenario.consumables ?? []) {
    const id = `${seal.id}@${scenario.id}`;
    if (consumables.length >= CONSUMABLE_SLOTS) break;
    if (!consumables.some((c) => c.id === id)) consumables.push({ id, seal });
  }
  return refill(scenario, {
    scenarioId: scenario.id,
    deckIndex: 0,
    hand: [],
    selected: [],
    inspections: {},
    inspecting: null,
    cpu: cpuReducer(
      { available: 0, spent: 0 },
      { type: "REPLENISH", available: scenario.table.startingCpu }
    ),
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
    allocations: {},
    seals: {},
    consumables,
    budget: inventory.budget,
    opening: {
      snapshots: history.snapshots.length,
      invalidations: history.invalidations.length,
      inventory,
    },
  });
}

/** The study history this state carries, for the next Blind. */
export function studyHistory(state: TableState): StudyHistory {
  return { snapshots: state.snapshots, invalidations: state.invalidations };
}

/** The tray and budget this state carries, for the next Blind. */
export function carriedInventory(state: TableState): Inventory {
  return { consumables: state.consumables, budget: state.budget };
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
    allocations: keep(state.allocations),
    seals: keep(state.seals),
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
      const card = cardById(scenario, next, id) as TlfCard;
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
      cardShortName(cardById(scenario, next, id) as TlfCard)
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
      ...createTableState(
        scenario,
        {
          snapshots: state.snapshots.slice(0, state.opening.snapshots),
          invalidations: state.invalidations.slice(
            0,
            state.opening.invalidations
          ),
        },
        state.opening.inventory
      ),
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
      const card = cardById(scenario, state, action.cardId) as TlfCard;
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
      const card = cardById(scenario, state, action.cardId);
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
        .map((id) => cardById(scenario, state, id) as TlfCard)
        .filter((card) => isStale(scenario, state, card));
      if (stale.length > 0) {
        return refuse(
          state,
          `${STALE_ALERT} Stale: ${stale.map(cardShortName).join(", ")}.`
        );
      }
      const empty = state.selected
        .map((id) => cardById(scenario, state, id) as TlfCard)
        .filter((card) => isBlank(state, card));
      if (empty.length > 0) {
        return refuse(
          state,
          `${EMPTY_SHELL_ALERT} Empty: ${empty.map(cardShortName).join(", ")}.`
        );
      }
      if (!canAfford(state.cpu, "PLAY_HAND")) {
        return refuse(state, `Play Hand needs ${CPU_COSTS.PLAY_HAND} CPU.`);
      }
      const classification = classifyHand(
        state.selected.map((id) => classifiable(scenario, state, id))
      ) as HandClassification;
      const scoring = classification.scoringCardIds.map(
        (id) => cardById(scenario, state, id) as TlfCard
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
      const card = cardById(scenario, state, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      if (isBlank(state, card)) {
        return refuse(
          state,
          `${cardShortName(card)} is an empty shell: allocate an analysis set to compile it first.`
        );
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
      const card = cardById(scenario, state, action.cardId);
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
                card,
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

    case "ALLOCATE": {
      const card = cardById(scenario, state, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      const shell = shellById(scenario, card.shellId);
      if (!shell?.layout) {
        return refuse(
          state,
          `${cardShortName(card)} is already compiled; only a blank shell takes an allocation.`
        );
      }
      const allocated = state.allocations[card.id];
      if (allocated) {
        return refuse(
          state,
          `${cardShortName(card)} is already compiled on the ${POPULATION_LABELS[allocated]} population. Allocation is final: recompile it if the data moves.`
        );
      }
      const compatible = compatibleWith(shell);
      const set = POPULATION_LABELS[action.population];
      if (!compatible.includes(action.population)) {
        return refuse(
          state,
          `${cardShortName(card)} cannot be built on the ${set} population: its shell accepts ${compatible.map((p) => POPULATION_LABELS[p]).join(", ")}.`
        );
      }
      const current = currentSnapshot(state);
      const subjects = membership(current, action.population).length;
      if (subjects === 0) {
        return refuse(
          state,
          `The ${set} population is empty in ${current.id}. ${EMPTY_SHELL_ALERT}`
        );
      }
      const draft = compileShell(
        { ...shell, layout: shell.layout },
        `${shell.id}@${card.id}`,
        current,
        { ...scenario.rulebook, populationSuit: action.population }
      );
      return {
        ...state,
        allocations: { ...state.allocations, [card.id]: action.population },
        drafts: { ...state.drafts, [card.id]: draft },
        provenance: { ...state.provenance, [card.id]: snapshotRef(current) },
        lastEvent: nextEvent(
          state,
          "ALLOCATED",
          `Allocated ${set} data (N=${subjects}, ${current.id}) to ${card.number}. It compiled as a ${set} output.`
        ),
      };
    }

    case "APPLY_SEAL": {
      const item = state.consumables.find((c) => c.id === action.consumableId);
      if (!item)
        return refuse(state, "That footnote seal is not in your tray.");
      const card = cardById(scenario, state, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      const why = sealRefusal(scenario, state, card, item.seal);
      if (why) return refuse(state, why);
      const { seal } = item;
      return {
        ...state,
        consumables: state.consumables.filter((c) => c.id !== item.id),
        seals: {
          ...state.seals,
          [card.id]: [...(state.seals[card.id] ?? []), seal],
        },
        lastEvent: nextEvent(
          state,
          "SEALED",
          `Sealed ${cardShortName(card)} with ${seal.name}: ${sealEffectText(scenario, state, card, seal)}. Footnote: "${seal.footnote}"`
        ),
      };
    }

    case "SELL_CONSUMABLE": {
      const item = state.consumables.find((c) => c.id === action.consumableId);
      if (!item)
        return refuse(state, "That footnote seal is not in your tray.");
      const budget = state.budget + item.seal.sellValue;
      return {
        ...state,
        consumables: state.consumables.filter((c) => c.id !== item.id),
        budget,
        lastEvent: nextEvent(
          state,
          "SOLD",
          `Sold ${item.seal.name} for $${item.seal.sellValue}k. Study budget $${budget}k.`
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
        ? cardById(scenario, state, state.inspecting)
        : undefined;
      const draft = card ? draftFor(scenario, state, card) : undefined;
      if (!card || !draft) {
        return refuse(state, "Open a card's Inspect view first.");
      }
      const report = reportFor(scenario, state, card, draft);
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
    const card = cardById(scenario, state, id) as TlfCard;
    const draft = draftFor(scenario, state, card);
    const inspection = state.inspections[id];
    const review =
      draft && inspection
        ? deriveInspectionView(
            draft,
            reportFor(scenario, state, card, draft),
            inspection
          )
        : null;
    const shell = shellById(scenario, card.shellId ?? draft?.shellId);
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
      face: faceFor(card, draft, review, shell),
      stamps,
      debuffed: isDebuffed(scenario, card),
      stale,
      provenance: provenanceOf(state, card),
      blank: isBlank(state, card),
      compatiblePopulations: shell ? compatibleWith(shell) : [],
      seals: state.seals[id] ?? [],
      footnoteSlots: footnoteSlotsOf(scenario, state, card),
    };
  });

  const selectedCards = state.selected.map((id) =>
    classifiable(scenario, state, id)
  );
  const emptySelected = state.selected.filter((id) =>
    isBlank(state, cardById(scenario, state, id) as TlfCard)
  );
  const classification = classifyHand(selectedCards);
  const preview = classification
    ? scoreCards(
        scenario,
        state,
        classification.scoringCardIds.map(
          (id) => cardById(scenario, state, id) as TlfCard
        ),
        classification.handType,
        true
      )
    : null;
  const empty = new Set(emptySelected);
  const staleSelected = selectedCards
    .filter((c) => c.stale && !empty.has(c.id))
    .map((c) => c.id);
  // Only staleness is lifted here: an empty shell still breaks the flush.
  const flushBrokenBy =
    staleSelected.length > 0 &&
    classification?.handType !== "POPULATION_FLUSH" &&
    classifyHand(selectedCards.map((c) => ({ ...c, stale: empty.has(c.id) })))
      ?.handType === "POPULATION_FLUSH"
      ? staleSelected
      : [];

  let inspection: TableInspectionView | null = null;
  const inspectingCard = state.inspecting
    ? cardById(scenario, state, state.inspecting)
    : undefined;
  const inspectingDraft = inspectingCard
    ? draftFor(scenario, state, inspectingCard)
    : undefined;
  if (
    inspectingCard &&
    inspectingDraft &&
    state.inspections[inspectingCard.id]
  ) {
    const report = reportFor(scenario, state, inspectingCard, inspectingDraft);
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
      emptySelected.length === 0 &&
      canAfford(state.cpu, "PLAY_HAND"),
    canDiscard:
      reviewing && state.selected.length > 0 && canAfford(state.cpu, "DISCARD"),
    canInspect: reviewing && canAfford(state.cpu, "INSPECT"),
    inspection,
    lastTimeline,
    snapshot: snapshotRef(currentSnapshot(state)),
    staleSelected,
    playBlockedReason:
      staleSelected.length > 0
        ? STALE_ALERT
        : emptySelected.length > 0
          ? EMPTY_SHELL_ALERT
          : null,
    flushBrokenBy,
    canRecompile: reviewing && canAfford(state.cpu, "RECOMPILE"),
    invalidations: state.invalidations,
    emptySelected,
    consumables: state.consumables,
    consumableSlots: CONSUMABLE_SLOTS,
    budget: state.budget,
  };
}

/**
 * Previews every analysis set a blank shell in hand could be compiled on:
 * the snapshot it would read, its N, and the hand the selection would make
 * with it, scored from revealed findings only. The shell joins the selection
 * when there is room. Pure; nothing is committed. Empty for any other card.
 */
export function previewAllocation(
  scenario: Scenario,
  state: TableState,
  cardId: string
): AllocationOption[] {
  const card = cardById(scenario, state, cardId);
  const shell = shellById(scenario, card?.shellId);
  if (
    !card ||
    !shell ||
    !state.hand.includes(cardId) ||
    !isBlank(state, card)
  ) {
    return [];
  }
  const current = currentSnapshot(state);
  return compatibleWith(shell).map((population): AllocationOption => {
    const base = {
      population,
      snapshot: snapshotRef(current),
      subjects: membership(current, population).length,
    };
    const next = advanceTable(scenario, state, {
      type: "ALLOCATE",
      cardId,
      population,
    });
    if (next.lastEvent?.kind === "REFUSED") {
      return {
        ...base,
        refusal: next.lastEvent.message,
        classification: null,
        estimate: null,
      };
    }
    const selected = next.selected.includes(cardId)
      ? next.selected
      : next.selected.length < scenario.table.maxSelection
        ? [...next.selected, cardId]
        : [cardId];
    const view = deriveTableView(scenario, { ...next, selected });
    return {
      ...base,
      refusal: null,
      classification: view.classification,
      estimate: view.preview,
    };
  });
}
