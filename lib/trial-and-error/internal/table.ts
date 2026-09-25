import type {
  BossBlindModifier,
  CellCoordinates,
  CrisisCard,
  CrisisChoice,
  FootnoteSeal,
  GuidanceCard,
  HandClassification,
  HandEvaluation,
  HandLevels,
  HandType,
  PopulationSnapshot,
  PopulationType,
  SapRulebook,
  TableShellSpec,
  QcReport,
  RuleCheckResult,
  Scenario,
  SnapshotRef,
  StagedTable,
  PopulationTransition,
  StudyEvent,
  TlfCard,
  CardFace,
  CardStamp,
  KmFigure,
  RedactedCard,
} from "../types";
import { POPULATION_LABELS } from "../types";
import { compileDraft, compileShell } from "./compile";
import {
  CPU_COSTS,
  canAfford,
  costOf,
  cpuReducer,
  type CpuAction,
  type CpuLedger,
} from "./cpu";
import type { DeskStatus } from "./desk";
import {
  HAND_NAMES,
  classifyHand,
  handLevelTable,
  initialHandLevels,
  leveledBase,
  type HandLevelRow,
} from "./hands";
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
import {
  UNBLINDING_RULE_ID,
  structuralQc,
  type AccessKind,
  type AccessRecord,
  type DmcSession,
  type StructuralQcReport,
} from "./blinding";
import { traceCell, type CellTrace } from "./listing";
import { validateKm, type KmFinding, type KmReport } from "./km";
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
    | "SOLD"
    | "LEVELED_UP"
    | "CRISIS_RESOLVED"
    | "TRACED"
    | "STRUCTURAL_QC"
    | "UNBLINDED"
    | "SESSION_CHANGED";
  message: string;
  /** On LEVELED_UP: the hand that levelled and its base before and after. */
  levelUp?: LevelUp;
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

/** A hand levelling up: the Guidance card used and the hand's base either side. */
export interface LevelUp {
  guidanceId: string;
  guidanceName: string;
  handType: HandType;
  from: { level: number; chips: number; mult: number };
  to: { level: number; chips: number; mult: number };
}

/**
 * A consumable in the tray: a footnote seal or a Guidance card. `id` is
 * unique within the tray.
 */
export type Consumable =
  | { id: string; kind: "SEAL"; seal: FootnoteSeal }
  | { id: string; kind: "GUIDANCE"; guidance: GuidanceCard };

/** A consumable's printed name. */
export function consumableName(item: Consumable): string {
  return item.kind === "SEAL" ? item.seal.name : item.guidance.name;
}

/** What selling a consumable adds to the study budget. */
export function consumableSellValue(item: Consumable): number {
  return item.kind === "SEAL" ? item.seal.sellValue : item.guidance.sellValue;
}

/**
 * What the player carries between Blinds besides the study: the consumable
 * tray, the study budget and the run's hand levels. The Procurement Shop
 * spends and fills it. Absent hand levels mean a fresh run's.
 */
export interface Inventory {
  consumables: Consumable[];
  budget: number;
  handLevels?: HandLevels;
}

/**
 * One entry in the Blind's inspection audit log: a flagged table cell traced
 * to the patient Listing rows behind it, and how its discrepancy stands. The
 * log is kept for end-of-Blind grading, so it outlives the cards in hand.
 */
export interface TraceRecord {
  /** The summary Table traced. */
  cardId: string;
  /** The supporting Listing it was traced into. */
  listingId: string;
  cell: CellCoordinates;
  /** The findings flagged on the cell. */
  findingIds: string[];
  /** Every subject row inspected on the Listing, by USUBJID. */
  subjectIds: string[];
  /** The subjects the cell counts: the rows the trace line highlights. */
  matchedSubjectIds: string[];
  /** The population snapshot the Listing rows were filtered on. */
  snapshotId: string;
  /** RESOLVED once every finding on the cell is corrected. */
  resolution: "OPEN" | "RESOLVED";
  /** The Table was recompiled since: this trace describes an output that no longer exists. */
  superseded: boolean;
}

/** The ×Mult a reconciled Kaplan–Meier figure earns with a validated parent. */
export const KM_SYNERGY = 2;

/** The +Mult each unresolved Kaplan–Meier discrepancy costs a hand. */
export const KM_REDLINE_PENALTY = 1;

/** The ×Mult a traced, fully resolved Table earns when played with its Listing. */
export const TLF_PAIR_SYNERGY = 2;

/** The alert shown when a Table and its Listing disagree on provenance. */
export const PROVENANCE_ALERT =
  "Listing and table were compiled against different population snapshots: recompile the stale output before tracing.";

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
  /** The run's hand levels, carried from Blind to Blind. */
  handLevels: HandLevels;
  /** The crisis drawn for this Blind, until the player answers it. */
  crisis: CrisisCard | null;
  /** How this Blind's crisis was answered, once it has been. */
  crisisResolution: { crisisId: string; choiceId: string } | null;
  /** Modifiers crisis choices imposed on this Blind, besides its boss. */
  modifiers: BossBlindModifier[];
  /** Every table cell traced to its Listing this Blind, in trace order. */
  auditLog: TraceRecord[];
  /** The DMC session in force. Blinded outputs are face down in OPEN. */
  session: DmcSession;
  /** Every DMC access this Blind: structural QC, unblinding, session changes. */
  accessLog: AccessRecord[];
  /** Blinded outputs in hand that have had structural QC, in order. */
  structuralQc: string[];
  /** Blinded outputs revealed by an unauthorized unblinding. They stay face up. */
  unblinded: string[];
  /** Unauthorized unblindings the next hand played will answer for with ×0. */
  pendingViolations: string[];
  /**
   * How much of `snapshots` and `invalidations` predates this Blind, the
   * inventory it started with, and its crisis, so a restart returns to
   * exactly that.
   */
  opening: {
    snapshots: number;
    invalidations: number;
    inventory: Inventory;
    crisis: CrisisCard | null;
  };
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
  /** Traces a flagged cell of the inspected Table to its Listing rows. Free. */
  | { type: "TRACE_CELL"; row: number; col: number }
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
  /** Uses a Guidance card from the tray: its hand levels up for the run. */
  | { type: "USE_GUIDANCE"; consumableId: string }
  /** Answers the Blind's crisis with one of its choices. */
  | { type: "RESOLVE_CRISIS"; choiceId: string }
  /** Structural QC of a face-down output: shape and format, no values. */
  | { type: "STRUCTURAL_QC"; cardId: string }
  /**
   * Views a face-down output without DMC authorization: a blinding violation.
   * Logged, and the next hand played scores ×0.
   */
  | { type: "PEEK_BLINDED"; cardId: string }
  /** Moves to the other DMC session under the scenario's charter. */
  | { type: "SET_SESSION"; session: DmcSession }
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
  /**
   * Cards in hand this one forms a TLF Pair with: a Table's supporting
   * Listings, or a Listing's Tables. The linked-card indicator.
   */
  pairedWith: string[];
  /** A dependent Figure's parent and ×Mult status, or null for other cards. */
  figure: FigureStatus | null;
  /** A closed-session output (its shell is blinded). */
  blinded: boolean;
  /**
   * Face down under the DMC open session. `card` and `face` then carry no
   * value: the face is the shell's structure with every cell redacted.
   */
  faceDown: boolean;
  /** Structural QC of a blinded output, once run. */
  structural: StructuralQcReport | null;
}

/** A dependent Figure's ×Mult badge: its parent, and why it is off if it is. */
export interface FigureStatus {
  /** The parent Table's number. */
  parent: string;
  xMult: number;
  /** The ×Mult applies if the Figure is played now. */
  active: boolean;
  /** Why the ×Mult is off, or null when it is active. */
  reason: string | null;
  /** The parent is missing, stale or unvalidated: the Figure cannot compile. */
  blocked: boolean;
}

/** The open Inspect drawer's content for a Kaplan–Meier figure. */
export interface FigureInspectionView {
  card: TlfCard;
  km: KmFigure;
  report: KmReport;
  /** Findings still uncorrected. Inspection reveals every KM finding. */
  openFindings: KmFinding[];
  resolvedFindingIds: string[];
  parent: TlfCard | null;
  status: FigureStatus;
  /** The Figure's own value as a High Table. */
  expected: HandEvaluation;
  unpenalizedMult: number;
  provenance: SnapshotRef;
  stale: boolean;
}

/** One crisis choice as the table renders it. */
export interface CrisisChoiceView {
  choice: CrisisChoice;
  /** Why this choice cannot be taken now, or null. */
  refusal: string | null;
}

/** The Blind's unanswered crisis. */
export interface CrisisView {
  crisis: CrisisCard;
  choices: CrisisChoiceView[];
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
  trace: InspectionTraceView;
}

/** Table-to-Listing tracing for the inspected output. */
export interface InspectionTraceView {
  /** The supporting Listing in hand the Table traces into, or null. */
  listing: TlfCard | null;
  /** Why no cell can be traced now, or null. */
  blocked: string | null;
  /** The Listing rows behind each traced cell, keyed `row:col`. */
  cells: Record<string, CellTrace>;
  /** This output's audit log entries, in trace order. */
  log: TraceRecord[];
  /** Playing the Table with `listing` earns the TLF Pair ×Mult now. */
  synergy: boolean;
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
  /** The run's hand levels. */
  handLevels: HandLevels;
  /** The run's hand table at current levels, weakest hand first, for Run Info. */
  handTable: HandLevelRow[];
  /** The crisis to answer before the Blind can be played, if any. */
  crisis: CrisisView | null;
  /** Every modifier in force: the boss's, then any a crisis imposed. */
  modifiers: BossBlindModifier[];
  /** Hands left under a hand limit, or null when there is none. */
  handsLeft: number | null;
  /** What one discard costs, with any penalty. */
  discardCost: number;
  /** Treatment-arm values are face down (a DMC firewall). */
  firewall: boolean;
  /** The Blind's inspection audit log, for end-of-Blind grading. */
  auditLog: TraceRecord[];
  /** The open Inspect drawer's content when it holds a KM figure. */
  figureInspection: FigureInspectionView | null;
  /** The DMC session in force. */
  session: DmcSession;
  /** The charter the closed session is convened under, or null without a DMC. */
  dmcCharter: string | null;
  /** Why the session cannot change now, or null. */
  sessionRefusal: string | null;
  /** The Blind's DMC access history, oldest first. */
  accessLog: AccessRecord[];
  /** Unblinded outputs the next hand played will score ×0 for. */
  pendingViolations: string[];
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

/** Every modifier in force this Blind: the boss's, then any a crisis imposed. */
const activeModifiers = (
  scenario: Scenario,
  state: TableState
): BossBlindModifier[] =>
  scenario.boss ? [scenario.boss, ...state.modifiers] : [...state.modifiers];

/** The modifier that disables this card's population, if any. */
function disablingModifier(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): BossBlindModifier | undefined {
  return activeModifiers(scenario, state).find(
    (m) =>
      m.debuffType === "DISABLE_POPULATION" &&
      (m.disabledPopulations ?? []).includes(card.population)
  );
}

/** The tightest hand limit in force, or null. */
function handLimit(scenario: Scenario, state: TableState): number | null {
  const limits = activeModifiers(scenario, state)
    .filter((m) => m.debuffType === "HAND_LIMIT")
    .map((m) => m.maxHandsAllowed as number);
  return limits.length > 0 ? Math.min(...limits) : null;
}

/** The extra CPU every discard costs this Blind. */
const discardSurcharge = (scenario: Scenario, state: TableState): number =>
  activeModifiers(scenario, state)
    .filter((m) => m.debuffType === "DISCARD_PENALTY")
    .reduce((sum, m) => sum + (m.discardCpuPenalty ?? 0), 0);

/** Whether a DMC firewall turns treatment-arm values face down. */
const firewallUp = (scenario: Scenario, state: TableState): boolean =>
  activeModifiers(scenario, state).some(
    (m) => m.debuffType === "BLIND_FIREWALL"
  );

/** A closed-session output: its shell is blinded. */
function isBlindedCard(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): boolean {
  const draft = draftFor(scenario, state, card);
  return (
    shellById(scenario, card.shellId ?? draft?.shellId)?.isBlinded === true
  );
}

/** Face down: blinded, in the open session, and never unblinded by a peek. */
const isFaceDown = (
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): boolean =>
  state.session === "OPEN" &&
  !state.unblinded.includes(card.id) &&
  isBlindedCard(scenario, state, card);

/** The alert shown when Inspect meets a face-down output. */
const faceDownAlert = (card: TlfCard) =>
  `${cardShortName(card)} is face down in the DMC open session: run structural QC, or convene the closed session.`;

/** A face with every value redacted: its structure and labels only. */
function redactedFace(face: CardFace): CardFace {
  if (face.kind === "TABLE") {
    return {
      ...face,
      rows: face.rows.map((row) => ({
        label: row.label,
        values: row.values.map(() => FIREWALL_CELL),
      })),
    };
  }
  if (face.kind === "LISTING") {
    return {
      ...face,
      rows: face.rows.map((row) => row.map(() => FIREWALL_CELL)),
    };
  }
  return { kind: "TOKEN", cohort: FIREWALL_CELL, count: 0 };
}

/** The access history with one more entry. */
function withAccess(
  state: TableState,
  kind: AccessKind,
  cardId: string | null,
  authorized: boolean,
  text: string
): AccessRecord[] {
  return [
    ...state.accessLog,
    {
      seq: state.accessLog.length + 1,
      kind,
      cardId,
      session: state.session,
      handsPlayed: state.handsPlayed,
      authorized,
      text,
    },
  ];
}

/** Blinded outputs in hand, in hand order. */
const blindedInHand = (scenario: Scenario, state: TableState): TlfCard[] =>
  state.hand
    .map((id) => cardById(scenario, state, id) as TlfCard)
    .filter((card) => isBlindedCard(scenario, state, card));

/** Why the DMC session cannot move to `to` now, or null. */
function sessionRefusal(
  scenario: Scenario,
  state: TableState,
  to: DmcSession
): string | null {
  if (!scenario.dmc) {
    return "No Data Monitoring Committee is chartered for this Blind.";
  }
  if (state.session === to) {
    return `The ${to === "OPEN" ? "open" : "closed"} session is already in force.`;
  }
  if (to === "CLOSED") {
    const pending = blindedInHand(scenario, state).filter(
      (card) => !state.structuralQc.includes(card.id)
    );
    if (pending.length > 0) {
      return `Run structural QC on every blinded output before convening the closed session: ${pending.map(cardShortName).join(", ")}.`;
    }
  }
  return null;
}

/**
 * Cards in hand whose reviews a session change withdraws: the blinded
 * outputs, and any Figure built on one.
 */
function sessionDependents(scenario: Scenario, state: TableState): string[] {
  return state.hand.filter((id) => {
    const card = cardById(scenario, state, id) as TlfCard;
    if (isBlindedCard(scenario, state, card)) return true;
    const parent = card.km
      ? cardById(scenario, state, card.km.parent.cardId)
      : undefined;
    return parent !== undefined && isBlindedCard(scenario, state, parent);
  });
}

/** The alert shown while a crisis waits for an answer. */
const crisisAlert = (crisis: CrisisCard) =>
  `${crisis.name}: answer the crisis first.`;

/** A KM figure's findings, validated against its parent Table's face. */
function kmReportFor(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): KmReport | null {
  if (!card.km) return null;
  const parent = cardById(scenario, state, card.km.parent.cardId);
  // A face-down parent's values stay behind the firewall: the figure cannot
  // be reconciled against them until the closed session reveals them.
  const parentFace =
    parent && !isFaceDown(scenario, state, parent)
      ? faceFor(
          parent,
          draftFor(scenario, state, parent),
          null,
          shellById(scenario, parent.shellId)
        )
      : undefined;
  return validateKm(
    card.km,
    snapshotById(scenario, state, card.km.populationSnapshotId),
    card.population,
    parentFace
  );
}

/** Why a Figure's parent Table blocks it from compiling, or null. */
function dependencyBlock(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): string | null {
  if (!card.km) return null;
  const parent = cardById(scenario, state, card.km.parent.cardId);
  const name = parent ? cardShortName(parent) : card.km.parent.cardId;
  if (!parent || !state.hand.includes(parent.id)) {
    return `Parent ${name} is not on the table: a dependent Figure needs its source Table in hand.`;
  }
  if (isStale(scenario, state, parent)) {
    return `Parent ${name} is stale: recompile it before the Figure can compile.`;
  }
  const draft = draftFor(scenario, state, parent);
  if (draft) {
    const inspection = state.inspections[parent.id];
    if (!inspection) {
      return `Parent ${name} is unvalidated: inspect it before the Figure can compile.`;
    }
    const open = deriveInspectionView(
      draft,
      reportFor(scenario, state, parent, draft),
      inspection
    ).openFindings.length;
    if (open > 0) {
      return `Parent ${name} has ${open} open redline${open === 1 ? "" : "s"}.`;
    }
  }
  return null;
}

/** A Figure's ×Mult badge: its parent, and whether the ×Mult applies now. */
function figureStatus(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): FigureStatus | null {
  if (!card.km) return null;
  const parent = cardById(scenario, state, card.km.parent.cardId);
  const blockedBy = dependencyBlock(scenario, state, card);
  const inspection = state.inspections[card.id];
  const report = kmReportFor(scenario, state, card) as KmReport;
  const open = report.findings.filter(
    (f) => !inspection?.resolvedFindingIds.includes(f.id)
  ).length;
  const reason =
    blockedBy ??
    (isStale(scenario, state, card)
      ? `${cardShortName(card)} is stale: recompile it.`
      : !inspection
        ? "Inspect the figure to reconcile its Number-at-Risk."
        : open > 0
          ? `${open} Kaplan–Meier discrepanc${open === 1 ? "y" : "ies"} unresolved.`
          : null);
  return {
    parent: parent ? parent.number : card.km.parent.cardId,
    xMult: KM_SYNERGY,
    active: reason === null,
    reason,
    blocked: blockedBy !== null,
  };
}

/** A KM figure's face: the draft as printed, each arm corrected once reconciled. */
function kmFace(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): CardFace {
  const km = card.km as KmFigure;
  const report = kmReportFor(scenario, state, card) as KmReport;
  const resolved = new Set(state.inspections[card.id]?.resolvedFindingIds);
  const last = km.milestones[km.milestones.length - 1];
  const arms = km.displayed.map((shown, i) => {
    const exp = report.arms[i];
    const fixed =
      state.inspections[card.id] !== undefined &&
      report.findings
        .filter((f) => f.arm === shown.arm)
        .every((f) => resolved.has(f.id));
    const curve: [number, number][] = fixed
      ? [...exp.curve, [last, exp.curve[exp.curve.length - 1][1]]]
      : shown.curve;
    return {
      label: shown.arm === "PLACEBO" ? "Placebo" : "Active",
      points: curve.slice(0, 12),
      censors: fixed ? exp.censorTicks : shown.censorTicks,
      atRisk: fixed ? exp.atRisk : shown.atRisk,
    };
  });
  const parent = cardById(scenario, state, km.parent.cardId);
  return {
    kind: "FIGURE",
    plot: {
      type: "KM",
      series: arms.map(({ label: l, points, censors }) => ({
        label: l,
        points,
        censors,
      })),
    },
    source: parent?.number.slice(0, 24),
    atRisk: {
      times: km.milestones,
      rows: arms.map((a) => ({ label: a.label, values: a.atRisk })),
    },
  };
}

/** Cards in hand that form a TLF Pair with this one, in hand order. */
function pairPartners(
  scenario: Scenario,
  state: TableState,
  card: TlfCard
): TlfCard[] {
  const partnerType =
    card.cardType === "TABLE"
      ? "LISTING"
      : card.cardType === "LISTING"
        ? "TABLE"
        : null;
  if (partnerType === null) return [];
  return state.hand
    .map((id) => cardById(scenario, state, id) as TlfCard)
    .filter(
      (c) =>
        c.id !== card.id && c.cardType === partnerType && c.topic === card.topic
    );
}

/**
 * Whether a Listing shares the Table's provenance: neither output is stale,
 * and the Listing's snapshot has the same members of the Table's analysis
 * set as the snapshot the Table was compiled against.
 */
function provenanceMatches(
  scenario: Scenario,
  state: TableState,
  table: TlfCard,
  draft: StagedTable,
  listing: TlfCard
): boolean {
  if (isStale(scenario, state, table) || isStale(scenario, state, listing)) {
    return false;
  }
  return sameMembership(
    snapshotById(scenario, state, provenanceOf(state, listing).id),
    snapshotById(scenario, state, draft.populationSnapshotId),
    rulebookFor(scenario, state, table).populationSuit
  );
}

/** The Listing a Table's cells trace into, or why none can be traced now. */
function traceTarget(
  scenario: Scenario,
  state: TableState,
  table: TlfCard,
  draft: StagedTable
): { listing: TlfCard | null; blocked: string | null } {
  if (firewallUp(scenario, state)) {
    return { listing: null, blocked: FIREWALL_ALERT };
  }
  const partners = pairPartners(scenario, state, table);
  if (partners.length === 0) {
    return {
      listing: null,
      blocked: `No supporting Listing for ${cardShortName(table)} is in hand: a trace needs one.`,
    };
  }
  const listing = partners.find((l) =>
    provenanceMatches(scenario, state, table, draft, l)
  );
  return listing
    ? { listing, blocked: null }
    : { listing: partners[0], blocked: PROVENANCE_ALERT };
}

/** A Table's current audit log entries traced into one Listing. */
const tracesOf = (state: TableState, tableId: string, listingId?: string) =>
  state.auditLog.filter(
    (e) =>
      e.cardId === tableId &&
      !e.superseded &&
      (listingId === undefined || e.listingId === listingId)
  );

/**
 * Whether a Table played with this Listing earns the TLF Pair ×Mult: at least
 * one flagged cell traced into it, and every traced discrepancy resolved.
 */
function pairSynergy(
  state: TableState,
  tableId: string,
  listingId: string
): boolean {
  const traces = tracesOf(state, tableId, listingId);
  return traces.length > 0 && traces.every((e) => e.resolution === "RESOLVED");
}

/** A face-down cell under a DMC firewall. */
export const FIREWALL_CELL = "■";

const ARM_LABELS = new Set(["placebo", "active", "arm", "pbo", "act"]);

/**
 * A face with every treatment-arm value turned face down: arm columns of a
 * table, and the arm column of a listing. Totals stay readable.
 */
function firewalled(face: CardFace, draft: StagedTable | undefined): CardFace {
  const isArm = (label: string, c: number) =>
    draft
      ? draft.columns[c]?.arm !== "TOTAL"
      : ARM_LABELS.has(label.trim().toLowerCase());
  if (face.kind === "TABLE") {
    return {
      ...face,
      rows: face.rows.map((row) => ({
        ...row,
        values: row.values.map((v, c) =>
          isArm(face.columns[c], c) ? FIREWALL_CELL : v
        ),
      })),
    };
  }
  if (face.kind === "LISTING") {
    return {
      ...face,
      rows: face.rows.map((row) =>
        row.map((v, c) =>
          ARM_LABELS.has(face.columns[c].trim().toLowerCase())
            ? FIREWALL_CELL
            : v
        )
      ),
    };
  }
  return face;
}

/**
 * A disabling modifier as one explained rule result: a disabled card's
 * Chips, and any subject credit its draft earned, are cancelled. Its +Mult
 * and any zero-score rule still apply.
 */
function debuffFor(
  scenario: Scenario,
  state: TableState,
  card: TlfCard,
  results: readonly RuleCheckResult[]
): RuleCheckResult | null {
  const modifier = disablingModifier(scenario, state, card);
  if (!modifier) return null;
  const chips = card.chips + results.reduce((sum, r) => sum + r.chipsDelta, 0);
  return {
    ruleId: modifier.id,
    passed: false,
    chipsDelta: -chips,
    multDelta: 0,
    evidence: `${scenario.title} (${modifier.name}): ${card.number} is built on the ${POPULATION_LABELS[card.population]} population, so it scores 0 Chips (${chips} cancelled).`,
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
    const first = ruleResults.length;
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
    const km = kmReportFor(scenario, state, card);
    if (km) {
      const inspection = state.inspections[card.id];
      if (!revealedOnly || inspection) {
        for (const f of km.findings) {
          if (inspection?.resolvedFindingIds.includes(f.id)) continue;
          results.push({
            ruleId: `KM@${f.id}`,
            passed: false,
            chipsDelta: 0,
            multDelta: -KM_REDLINE_PENALTY,
            evidence: `${cardShortName(card)}: ${f.evidence} Shows ${f.observed}; expected ${f.expected}.`,
          });
        }
      }
      ruleResults.push(...results.filter((r) => r.ruleId.startsWith("KM@")));
    }
    const blockedBy = dependencyBlock(scenario, state, card);
    const cancelled =
      staleFor(scenario, state, card, results) ??
      debuffFor(scenario, state, card, results) ??
      (blockedBy
        ? {
            ruleId: "FIG-DEPENDENCY",
            passed: false,
            chipsDelta: -(
              card.chips + results.reduce((sum, r) => sum + r.chipsDelta, 0)
            ),
            multDelta: 0,
            evidence: `${cardShortName(card)} cannot compile: ${blockedBy}`,
          }
        : null);
    if (cancelled) ruleResults.push(cancelled);
    if (km && figureStatus(scenario, state, card)?.active) {
      ruleResults.push({
        ruleId: `KM-RECONCILED@${card.id}`,
        passed: true,
        chipsDelta: 0,
        multDelta: 0,
        multMultiplier: KM_SYNERGY,
        evidence: `${cardShortName(card)}: Number-at-Risk, censoring ticks and survival estimates reconcile with ${figureStatus(scenario, state, card)?.parent}.`,
      });
    }
    // A face-down output's findings score, but their evidence would print
    // closed-session values, so it is withheld.
    if (isFaceDown(scenario, state, card)) {
      for (let i = first; i < ruleResults.length; i++) {
        ruleResults[i] = {
          ...ruleResults[i],
          evidence: `${cardShortName(card)}: closed-session finding; its values are withheld in the open session.`,
        };
      }
    }
  }
  if (state.pendingViolations.length > 0) {
    ruleResults.push({
      ruleId: UNBLINDING_RULE_ID,
      passed: false,
      chipsDelta: 0,
      multDelta: 0,
      multMultiplier: 0,
      evidence: `Unauthorized unblinding of ${state.pendingViolations
        .map((id) => cardShortName(cardById(scenario, state, id) as TlfCard))
        .join(
          ", "
        )} in the open session: the DMC firewall zeroes this hand's Mult.`,
    });
  }
  if (handType === "TLF_PAIR" || handType === "TLF_TWO_PAIR") {
    for (const table of cards.filter((c) => c.cardType === "TABLE")) {
      const listing = cards.find(
        (c) =>
          c.cardType === "LISTING" &&
          c.topic === table.topic &&
          pairSynergy(state, table.id, c.id)
      );
      if (!listing) continue;
      ruleResults.push({
        ruleId: `TLF-PAIR@${table.id}`,
        passed: true,
        chipsDelta: 0,
        multDelta: 0,
        multMultiplier: TLF_PAIR_SYNERGY,
        evidence: `${cardShortName(table)} traced to ${listing.number} with every traced discrepancy resolved: TLF Pair synergy.`,
      });
    }
  }
  return evaluateHand({
    handType,
    cards: cards.map((c) => ({ id: c.id, chips: c.chips, mult: c.mult })),
    ruleResults,
    level: state.handLevels[handType].level,
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
 * scenario's own snapshot. `inventory` is the tray, budget and hand levels
 * carried in; the Blind's granted seals, then its Guidance cards, fill any
 * free tray slots.
 */
export function createTableState(
  scenario: Scenario,
  history: StudyHistory = {
    snapshots: [scenario.populationSnapshot],
    invalidations: [],
  },
  inventory: Inventory = EMPTY_INVENTORY,
  crisis: CrisisCard | null = null
): TableState {
  const consumables = [...inventory.consumables];
  const grants: Consumable[] = [
    ...(scenario.consumables ?? []).map((seal): Consumable => ({
      id: `${seal.id}@${scenario.id}`,
      kind: "SEAL",
      seal,
    })),
    ...(scenario.guidance ?? []).map((guidance): Consumable => ({
      id: `${guidance.id}@${scenario.id}`,
      kind: "GUIDANCE",
      guidance,
    })),
  ];
  for (const grant of grants) {
    if (consumables.length >= CONSUMABLE_SLOTS) break;
    if (!consumables.some((c) => c.id === grant.id)) consumables.push(grant);
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
    handLevels: inventory.handLevels ?? initialHandLevels(),
    crisis,
    crisisResolution: null,
    modifiers: [],
    auditLog: [],
    session: "OPEN",
    accessLog: [],
    structuralQc: [],
    unblinded: [],
    pendingViolations: [],
    opening: {
      snapshots: history.snapshots.length,
      invalidations: history.invalidations.length,
      inventory,
      crisis,
    },
  });
}

/** The study history this state carries, for the next Blind. */
export function studyHistory(state: TableState): StudyHistory {
  return { snapshots: state.snapshots, invalidations: state.invalidations };
}

/** The tray, budget and hand levels this state carries, for the next Blind. */
export function carriedInventory(state: TableState): Inventory {
  return {
    consumables: state.consumables,
    budget: state.budget,
    handLevels: state.handLevels,
  };
}

/** Removes the selected cards and pays for the action. Does not refill. */
function spendSelection(
  state: TableState,
  action: CpuAction,
  surcharge = 0
): TableState {
  const removed = new Set(state.selected);
  const keep = <T>(record: Record<string, T>) =>
    Object.fromEntries(
      Object.entries(record).filter(([id]) => !removed.has(id))
    );
  return {
    ...state,
    cpu: cpuReducer(state.cpu, { type: "SPEND", action, surcharge }),
    hand: state.hand.filter((id) => !removed.has(id)),
    selected: [],
    inspections: keep(state.inspections),
    provenance: keep(state.provenance),
    drafts: keep(state.drafts),
    allocations: keep(state.allocations),
    seals: keep(state.seals),
    structuralQc: state.structuralQc.filter((id) => !removed.has(id)),
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
    const applied = transitionTable(scenario, next, transition);
    if (!applied) continue;
    next = applied.state;
    messages.push(applied.message);
  }
  return { state: next, message: messages.join(" ") };
}

/**
 * Applies one population transition to the table: a new snapshot version,
 * and a record of which cards in hand it staled. Null when the transition
 * changes no membership.
 */
function transitionTable(
  scenario: Scenario,
  state: TableState,
  transition: PopulationTransition
): { state: TableState; message: string } | null {
  const from = currentSnapshot(state);
  const outcome = applyTransition(from, transition);
  if (!outcome.ok) return null;
  let next: TableState = {
    ...state,
    snapshots: [...state.snapshots, outcome.snapshot],
  };
  const staleCardIds = next.hand.filter((id) => {
    const card = cardById(scenario, next, id) as TlfCard;
    return (
      outcome.changed.includes(card.population) && isStale(scenario, next, card)
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
  return {
    state: next,
    message: `${transition.description} ${populations} population now ${outcome.snapshot.id}. ${
      names.length === 0
        ? "No output in hand is stale."
        : `Stale: ${names.join(", ")}.`
    }`,
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
  const limit = handLimit(scenario, state);
  if (limit !== null && state.handsPlayed >= limit) {
    return {
      state: { ...state, status: "FAILED" },
      outcome: `${scenario.blind.name} failed: the ${limit}-hand limit is used up.`,
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

/** Actions still allowed while a crisis waits for an answer: none play the Blind. */
const CRISIS_SAFE_ACTIONS = new Set<TableAction["type"]>([
  "TOGGLE_SELECT",
  "MOVE_CARD",
  "SELL_CONSUMABLE",
  "USE_GUIDANCE",
  "CLOSE_INSPECT",
]);

/** The alert shown when Inspect meets a DMC firewall. */
export const FIREWALL_ALERT =
  "The DMC firewall hides treatment assignments: no output can be inspected this Blind.";

/** Why a crisis choice cannot be taken now, or null. */
function choiceRefusal(state: TableState, choice: CrisisChoice): string | null {
  const { cpu = 0, budget = 0, spendSeal } = choice.effect;
  if (cpu < 0 && state.cpu.available < -cpu) {
    return `Needs ${-cpu} CPU; ${state.cpu.available} left.`;
  }
  if (budget < 0 && state.budget < -budget) {
    return `Needs $${-budget}k study budget; $${state.budget}k left.`;
  }
  if (spendSeal && !state.consumables.some((c) => c.kind === "SEAL")) {
    return "Needs a footnote seal in the tray.";
  }
  return null;
}

/**
 * Answers the Blind's crisis. Every effect is deterministic: CPU and budget
 * change, a seal is granted or spent, a transition moves the snapshot (and
 * stales the matching outputs in hand), and a modifier joins the Blind's.
 */
function resolveCrisis(
  scenario: Scenario,
  state: TableState,
  choiceId: string
): TableState {
  const crisis = state.crisis;
  if (!crisis) return refuse(state, "There is no crisis to answer.");
  const choice = crisis.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return refuse(state, `${crisis.name} has no such choice.`);
  }
  const why = choiceRefusal(state, choice);
  if (why) return refuse(state, `${choice.label}: ${why}`);
  const { effect } = choice;
  const notes: string[] = [];
  let next: TableState = {
    ...state,
    crisis: null,
    crisisResolution: { crisisId: crisis.id, choiceId: choice.id },
  };
  if (effect.cpu) {
    next = {
      ...next,
      cpu: cpuReducer(next.cpu, { type: "ADJUST", delta: effect.cpu }),
    };
  }
  if (effect.budget) next = { ...next, budget: next.budget + effect.budget };
  if (effect.spendSeal) {
    const spent = next.consumables.find((c) => c.kind === "SEAL") as Consumable;
    next = {
      ...next,
      consumables: next.consumables.filter((c) => c !== spent),
    };
    notes.push(`${consumableName(spent)} spent.`);
  }
  if (effect.grantSeal) {
    const id = `${effect.grantSeal.id}@${crisis.id}`;
    if (next.consumables.length < CONSUMABLE_SLOTS) {
      next = {
        ...next,
        consumables: [
          ...next.consumables,
          { id, kind: "SEAL", seal: effect.grantSeal },
        ],
      };
      notes.push(`${effect.grantSeal.name} added to the tray.`);
    } else {
      notes.push(`The tray is full, so ${effect.grantSeal.name} is lost.`);
    }
  }
  if (effect.modifier) {
    next = { ...next, modifiers: [...next.modifiers, effect.modifier] };
    notes.push(`${effect.modifier.name}: ${effect.modifier.description}`);
  }
  if (effect.transition) {
    const applied = transitionTable(scenario, next, effect.transition);
    if (applied) {
      next = applied.state;
      notes.push(applied.message);
    }
  }
  return {
    ...next,
    lastEvent: nextEvent(
      state,
      "CRISIS_RESOLVED",
      `${crisis.name}: ${choice.label}. ${choice.consequence}${notes.length ? ` ${notes.join(" ")}` : ""}`
    ),
  };
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
        state.opening.inventory,
        state.opening.crisis
      ),
      lastEvent: nextEvent(state, "RESET", `${scenario.blind.name} restarted.`),
    };
  }
  if (state.status !== "REVIEWING") {
    return refuse(state, "The Blind is over. Restart to play again.");
  }
  if (action.type === "RESOLVE_CRISIS") {
    return resolveCrisis(scenario, state, action.choiceId);
  }
  if (state.crisis && !CRISIS_SAFE_ACTIONS.has(action.type)) {
    return refuse(state, crisisAlert(state.crisis));
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
            // The violation is answered for by this hand's ×0.
            pendingViolations: [],
            handLevels: {
              ...state.handLevels,
              [classification.handType]: {
                ...state.handLevels[classification.handType],
                playedCount:
                  state.handLevels[classification.handType].playedCount + 1,
              },
            },
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
      const surcharge = discardSurcharge(scenario, state);
      if (!canAfford(state.cpu, "DISCARD", surcharge)) {
        return refuse(
          state,
          `Discard needs ${costOf("DISCARD", surcharge)} CPU.`
        );
      }
      const count = state.selected.length;
      const { state: settled, outcome } = settle(
        scenario,
        refill(
          scenario,
          spendSelection(
            { ...state, discards: state.discards + 1 },
            "DISCARD",
            surcharge
          )
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
      if (firewallUp(scenario, state)) {
        return refuse(state, FIREWALL_ALERT);
      }
      if (isFaceDown(scenario, state, card)) {
        return refuse(state, faceDownAlert(card));
      }
      if (isBlank(state, card)) {
        return refuse(
          state,
          `${cardShortName(card)} is an empty shell: allocate an analysis set to compile it first.`
        );
      }
      if (!draftFor(scenario, state, card) && !card.km) {
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

    case "STRUCTURAL_QC": {
      const card = cardById(scenario, state, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      if (!isFaceDown(scenario, state, card)) {
        return refuse(
          state,
          `${cardShortName(card)} is face up: inspect it instead.`
        );
      }
      const draft = draftFor(scenario, state, card);
      if (!draft) {
        return refuse(
          state,
          `${cardShortName(card)} is an empty shell: allocate an analysis set to compile it first.`
        );
      }
      const report = structuralQc(
        draft,
        shellById(scenario, card.shellId ?? draft.shellId)
      );
      const summary = `${report.checks.filter((c) => c.passed).length} of ${report.checks.length} structural checks pass.${report.checks
        .filter((c) => !c.passed)
        .map((c) => ` ${c.label}: ${c.detail}`)
        .join("")}`;
      if (state.structuralQc.includes(card.id)) {
        return {
          ...state,
          lastEvent: nextEvent(
            state,
            "STRUCTURAL_QC",
            `${cardShortName(card)}: ${summary}`
          ),
        };
      }
      if (!canAfford(state.cpu, "INSPECT")) {
        return refuse(state, `Structural QC needs ${CPU_COSTS.INSPECT} CPU.`);
      }
      return {
        ...state,
        cpu: cpuReducer(state.cpu, { type: "SPEND", action: "INSPECT" }),
        structuralQc: [...state.structuralQc, card.id],
        accessLog: withAccess(
          state,
          "STRUCTURAL_QC",
          card.id,
          true,
          `Structural QC of ${cardShortName(card)} across the firewall: ${summary}`
        ),
        lastEvent: nextEvent(
          state,
          "STRUCTURAL_QC",
          `Structural QC of ${cardShortName(card)} for ${CPU_COSTS.INSPECT} CPU, no values read: ${summary}`
        ),
      };
    }

    case "PEEK_BLINDED": {
      const card = cardById(scenario, state, action.cardId);
      if (!card || !state.hand.includes(card.id)) {
        return refuse(state, "That card is not in your hand.");
      }
      if (!isFaceDown(scenario, state, card)) {
        return refuse(state, `${cardShortName(card)} is not face down.`);
      }
      const text = `Unauthorized unblinding of ${cardShortName(card)} in the open session. Audit finding logged; the next hand played scores ×0 Mult.`;
      return {
        ...state,
        unblinded: [...state.unblinded, card.id],
        pendingViolations: [...state.pendingViolations, card.id],
        accessLog: withAccess(
          state,
          "UNAUTHORIZED_UNBLINDING",
          card.id,
          false,
          text
        ),
        lastEvent: nextEvent(state, "UNBLINDED", text),
      };
    }

    case "SET_SESSION": {
      const refusal = sessionRefusal(scenario, state, action.session);
      if (refusal) return refuse(state, refusal);
      const withdrawn = sessionDependents(scenario, state).filter(
        (id) => state.inspections[id]
      );
      const inspections = Object.fromEntries(
        Object.entries(state.inspections).filter(
          ([id]) => !withdrawn.includes(id)
        )
      );
      const count = blindedInHand(scenario, state).length;
      const plural = count === 1 ? "" : "s";
      const withdrawnText =
        withdrawn.length > 0
          ? ` Reviews withdrawn: ${withdrawn
              .map((id) =>
                cardShortName(cardById(scenario, state, id) as TlfCard)
              )
              .join(", ")}.`
          : "";
      const text =
        action.session === "CLOSED"
          ? `Closed DMC session convened under ${scenario.dmc?.charter}: ${count} blinded output${plural} revealed.${withdrawnText}`
          : `Returned to the open session: ${count} blinded output${plural} face down again.${withdrawnText}`;
      const moved: TableState = { ...state, session: action.session };
      return {
        ...moved,
        inspections,
        inspecting:
          state.inspecting && withdrawn.includes(state.inspecting)
            ? null
            : state.inspecting,
        accessLog: withAccess(
          moved,
          action.session === "CLOSED" ? "SESSION_CLOSED" : "SESSION_OPENED",
          null,
          true,
          text
        ),
        lastEvent: nextEvent(state, "SESSION_CHANGED", text),
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
        // A recompiled output is a new output: its review starts over, and
        // its traces describe the old one.
        inspections,
        auditLog: state.auditLog.map((e) =>
          e.cardId === card.id ? { ...e, superseded: true } : e
        ),
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
      if (item.kind !== "SEAL") {
        return refuse(
          state,
          `${item.guidance.name} is a Guidance card: use it to level up ${handName(item.guidance.handType)}.`
        );
      }
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
      if (!item) return refuse(state, "That consumable is not in your tray.");
      const value = consumableSellValue(item);
      const budget = state.budget + value;
      return {
        ...state,
        consumables: state.consumables.filter((c) => c.id !== item.id),
        budget,
        lastEvent: nextEvent(
          state,
          "SOLD",
          `Sold ${consumableName(item)} for $${value}k. Study budget $${budget}k.`
        ),
      };
    }

    case "USE_GUIDANCE": {
      const item = state.consumables.find((c) => c.id === action.consumableId);
      if (!item || item.kind !== "GUIDANCE") {
        return refuse(state, "That Guidance card is not in your tray.");
      }
      const { guidance } = item;
      const { handType } = guidance;
      const current = state.handLevels[handType];
      const before = leveledBase(handType, current.level);
      const after = leveledBase(handType, current.level + 1);
      const levelUp: LevelUp = {
        guidanceId: guidance.id,
        guidanceName: guidance.name,
        handType,
        from: {
          level: current.level,
          chips: before.baseChips,
          mult: before.baseMult,
        },
        to: {
          level: current.level + 1,
          chips: after.baseChips,
          mult: after.baseMult,
        },
      };
      return {
        ...state,
        consumables: state.consumables.filter((c) => c.id !== item.id),
        handLevels: {
          ...state.handLevels,
          [handType]: { ...current, level: current.level + 1 },
        },
        lastEvent: {
          ...nextEvent(
            state,
            "LEVELED_UP",
            `${guidance.name}: ${handName(handType)} levelled up to Lv.${levelUp.to.level}. Base ${levelUp.to.chips} Chips, +${levelUp.to.mult} Mult.`
          ),
          levelUp,
        },
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
      if (card?.km) {
        if (action.type === "INSPECT_CELL") {
          return refuse(
            state,
            `${cardShortName(card)} is a figure: inspecting it revealed every check at once.`
          );
        }
        const report = kmReportFor(scenario, state, card) as KmReport;
        const current = state.inspections[card.id];
        const target = report.findings.find((f) => f.id === action.findingId);
        if (!target || current.resolvedFindingIds.includes(target.id)) {
          return refuse(state, "That Kaplan–Meier finding is not open.");
        }
        const inspection = {
          ...current,
          resolvedFindingIds: [...current.resolvedFindingIds, target.id],
        };
        const next = {
          ...state,
          inspections: { ...state.inspections, [card.id]: inspection },
        };
        const status = figureStatus(scenario, next, card) as FigureStatus;
        return {
          ...next,
          lastEvent: nextEvent(
            state,
            "CORRECTED",
            `Reconciled ${target.check.replaceAll("_", " ").toLowerCase()} for ${target.arm === "PLACEBO" ? "Placebo" : "Active"}: ${target.observed} to ${target.expected}.${status.active ? ` ${cardShortName(card)} ×${KM_SYNERGY} Mult is live.` : ""}`
          ),
        };
      }
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
      const resolved = new Set(outcome.inspection.resolvedFindingIds);
      return {
        ...state,
        inspections: { ...state.inspections, [card.id]: outcome.inspection },
        auditLog: state.auditLog.map((e) =>
          e.cardId === card.id && !e.superseded
            ? {
                ...e,
                resolution: e.findingIds.every((id) => resolved.has(id))
                  ? "RESOLVED"
                  : "OPEN",
              }
            : e
        ),
        lastEvent: nextEvent(
          state,
          action.type === "INSPECT_CELL" ? "INSPECTED" : "CORRECTED",
          outcome.message
        ),
      };
    }

    case "TRACE_CELL": {
      const card = state.inspecting
        ? cardById(scenario, state, state.inspecting)
        : undefined;
      const draft = card ? draftFor(scenario, state, card) : undefined;
      const inspection = card ? state.inspections[card.id] : undefined;
      if (!card || !draft || !inspection) {
        return refuse(state, "Open a card's Inspect view first.");
      }
      const { listing, blocked } = traceTarget(scenario, state, card, draft);
      if (!listing || blocked) return refuse(state, blocked as string);
      const report = reportFor(scenario, state, card, draft);
      const revealed = new Set(visibleFindingIds(report, inspection));
      const flagged = report.findings.filter(
        (f) =>
          f.cell.row === action.row &&
          f.cell.col === action.col &&
          revealed.has(f.id)
      );
      if (flagged.length === 0) {
        return refuse(
          state,
          "Only a flagged cell can be traced: inspect it and reveal a redline first."
        );
      }
      const trace = traceCell(
        draft,
        snapshotById(scenario, state, draft.populationSnapshotId),
        rulebookFor(scenario, state, card),
        action.row,
        action.col
      ) as CellTrace;
      const where = `${draft.rows[action.row].label}, ${draft.columns[action.col].label}`;
      const traced = tracesOf(state, card.id, listing.id).some(
        (e) => e.cell.row === action.row && e.cell.col === action.col
      );
      const record: TraceRecord = {
        cardId: card.id,
        listingId: listing.id,
        cell: { row: action.row, col: action.col },
        findingIds: flagged.map((f) => f.id),
        subjectIds: trace.rows.map((r) => r.usubjid),
        matchedSubjectIds: trace.matchedSubjectIds,
        snapshotId: trace.snapshotId,
        resolution: flagged.every((f) =>
          inspection.resolvedFindingIds.includes(f.id)
        )
          ? "RESOLVED"
          : "OPEN",
        superseded: false,
      };
      const n = trace.matchedSubjectIds.length;
      return {
        ...state,
        auditLog: traced ? state.auditLog : [...state.auditLog, record],
        lastEvent: nextEvent(
          state,
          "TRACED",
          `Traced ${where} of ${cardShortName(card)} to ${listing.number} on ${trace.snapshotId}: ${n} of ${trace.rows.length} subject row${trace.rows.length === 1 ? "" : "s"} counted${n > 0 ? ` (${trace.matchedSubjectIds.join(", ")})` : ""}.`
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
  const firewall = firewallUp(scenario, state);
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
    const km = kmReportFor(scenario, state, card);
    // Inspecting a KM figure reveals every one of its findings.
    const openRedlines = km
      ? inspection
        ? km.findings.filter(
            (f) => !inspection.resolvedFindingIds.includes(f.id)
          ).length
        : 0
      : (review?.openFindings.length ?? 0);
    const stale = isStale(scenario, state, card);
    const blinded = isBlindedCard(scenario, state, card);
    const faceDown = isFaceDown(scenario, state, card);
    const stamps: CardStamp[] = [];
    if (faceDown) stamps.push("BLINDED");
    if (stale) stamps.push("STALE");
    if (openRedlines > 0) stamps.push("REDLINE");
    // QC ✓ only once every cell is reviewed, so it never vouches for a
    // defect the player has not looked for.
    if (
      (review && review.reviewedCells === review.totalCells && !openRedlines) ||
      (km && inspection && !openRedlines)
    ) {
      stamps.push("QC_PASS");
    }
    const face = card.km
      ? kmFace(scenario, state, card)
      : faceFor(card, draft, review, shell);
    const reviewable = draft !== undefined || km !== null;
    const structural =
      blinded && draft && state.structuralQc.includes(id)
        ? structuralQc(draft, shell)
        : null;
    return {
      // Face down, or under a firewall, the values are absent from the view
      // itself, including the card's own authored face.
      card: faceDown
        ? { ...card, face: undefined, km: undefined }
        : firewall && card.face
          ? { ...card, face: firewalled(card.face, undefined) }
          : card,
      selected: selected.has(id),
      inspectable: reviewable && !faceDown,
      inspected: inspection !== undefined,
      unverified: faceDown
        ? reviewable && structural === null
        : reviewable && inspection === undefined,
      openRedlines,
      face: faceDown
        ? redactedFace(face)
        : firewall
          ? firewalled(face, draft)
          : face,
      stamps,
      debuffed: disablingModifier(scenario, state, card) !== undefined,
      stale,
      provenance: provenanceOf(state, card),
      blank: isBlank(state, card),
      compatiblePopulations: shell ? compatibleWith(shell) : [],
      seals: state.seals[id] ?? [],
      footnoteSlots: footnoteSlotsOf(scenario, state, card),
      pairedWith: pairPartners(scenario, state, card).map((c) => c.id),
      figure: figureStatus(scenario, state, card),
      blinded,
      faceDown,
      structural,
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
    const target = traceTarget(
      scenario,
      state,
      inspectingCard,
      inspectingDraft
    );
    const log = tracesOf(state, inspectingCard.id);
    const traceSnapshot = snapshotById(
      scenario,
      state,
      inspectingDraft.populationSnapshotId
    );
    const cells: Record<string, CellTrace> = {};
    for (const entry of log) {
      const key = `${entry.cell.row}:${entry.cell.col}`;
      cells[key] ??= traceCell(
        inspectingDraft,
        traceSnapshot,
        rulebookFor(scenario, state, inspectingCard),
        entry.cell.row,
        entry.cell.col
      ) as CellTrace;
    }
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
      trace: {
        listing: target.listing,
        blocked: target.blocked,
        cells,
        log,
        synergy:
          target.listing !== null &&
          target.blocked === null &&
          pairSynergy(state, inspectingCard.id, target.listing.id),
      },
    };
  }

  let figureInspection: FigureInspectionView | null = null;
  if (inspectingCard?.km && state.inspections[inspectingCard.id]) {
    const report = kmReportFor(scenario, state, inspectingCard) as KmReport;
    const resolvedFindingIds =
      state.inspections[inspectingCard.id].resolvedFindingIds;
    const expected = scoreCards(
      scenario,
      state,
      [inspectingCard],
      "HIGH_TABLE",
      true
    );
    figureInspection = {
      card: inspectingCard,
      km: inspectingCard.km,
      report,
      openFindings: report.findings.filter(
        (f) => !resolvedFindingIds.includes(f.id)
      ),
      resolvedFindingIds,
      parent:
        cardById(scenario, state, inspectingCard.km.parent.cardId) ?? null,
      status: figureStatus(scenario, state, inspectingCard) as FigureStatus,
      expected,
      unpenalizedMult: unpenalizedMult(expected),
      provenance: provenanceOf(state, inspectingCard),
      stale: isStale(scenario, state, inspectingCard),
    };
  }

  const reviewing = state.status === "REVIEWING" && state.crisis === null;
  const limit = handLimit(scenario, state);
  const handsLeft =
    limit === null ? null : Math.max(0, limit - state.handsPlayed);
  const surcharge = discardSurcharge(scenario, state);
  const discardCost = costOf("DISCARD", surcharge);
  const cpuHands = Math.floor(state.cpu.available / CPU_COSTS.PLAY_HAND);
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
            .map((r): [string, string] => [r.id, `${r.category} ERROR`])
            .concat([[UNBLINDING_RULE_ID, "UNBLINDING"]])
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
    handsAffordable:
      handsLeft === null ? cpuHands : Math.min(cpuHands, handsLeft),
    discardsAffordable: Math.floor(state.cpu.available / discardCost),
    canPlay:
      reviewing &&
      state.selected.length > 0 &&
      staleSelected.length === 0 &&
      emptySelected.length === 0 &&
      canAfford(state.cpu, "PLAY_HAND"),
    canDiscard:
      reviewing &&
      state.selected.length > 0 &&
      canAfford(state.cpu, "DISCARD", surcharge),
    canInspect: reviewing && !firewall && canAfford(state.cpu, "INSPECT"),
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
    handLevels: state.handLevels,
    handTable: handLevelTable(state.handLevels),
    budget: state.budget,
    crisis: state.crisis
      ? {
          crisis: state.crisis,
          choices: state.crisis.choices.map((choice) => ({
            choice,
            refusal: choiceRefusal(state, choice),
          })),
        }
      : null,
    modifiers: activeModifiers(scenario, state),
    handsLeft,
    discardCost,
    firewall,
    auditLog: state.auditLog,
    figureInspection,
    session: state.session,
    dmcCharter: scenario.dmc?.charter ?? null,
    sessionRefusal: sessionRefusal(
      scenario,
      state,
      state.session === "OPEN" ? "CLOSED" : "OPEN"
    ),
    accessLog: state.accessLog,
    pendingViolations: state.pendingViolations,
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
