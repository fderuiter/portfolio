/**
 * Runtime contracts for Trial & Error: Biostat Ops.
 *
 * Every poker primitive and scenario document is declared as a Zod schema with
 * its TypeScript type inferred from it, so scenario data can be validated at
 * runtime with the same definition the compiler checks against. See
 * ADR 0046 for the module boundary and scoring pipeline these types serve.
 */
import { z } from "zod";

/**
 * Analysis populations act as card suits. FAS and ITT are distinct members:
 * a scenario may only treat them as equivalent by declaring an alias in its
 * SAP rulebook.
 */
export const PopulationTypeSchema = z.enum([
  "SCREENED",
  "ITT",
  "SAFETY",
  "PER_PROTOCOL",
  "FAS",
]);
/** An analysis population (card suit). */
export type PopulationType = z.infer<typeof PopulationTypeSchema>;

/** Display names for each analysis population. */
export const POPULATION_LABELS: Readonly<Record<PopulationType, string>> =
  Object.freeze({
    SCREENED: "Screened",
    ITT: "ITT",
    SAFETY: "Safety",
    PER_PROTOCOL: "Per-Protocol",
    FAS: "FAS",
  });

/** The kinds of card a hand can contain. */
export const CardTypeSchema = z.enum([
  "TABLE",
  "LISTING",
  "FIGURE",
  "SUBJECT_TOKEN",
]);
/** A card kind: Table, Listing, Figure, or subject data token. */
export type CardType = z.infer<typeof CardTypeSchema>;

/** Milestone delivery quotas, escalating from internal QC to a boss review. */
export const BlindTierSchema = z.enum([
  "SMALL_BLIND",
  "BIG_BLIND",
  "BOSS_BLIND",
]);
/** A milestone Blind tier. */
export type BlindTier = z.infer<typeof BlindTierSchema>;

/** Scoring hands, ordered from weakest to strongest. */
export const HandTypeSchema = z.enum([
  "HIGH_TABLE",
  "TLF_PAIR",
  "TLF_TWO_PAIR",
  "POPULATION_FLUSH",
  "CSR_STRAIGHT",
  "EFFICACY_FULL_HOUSE",
  "MEDDRA_FIVE_OF_A_KIND",
]);
/** A scoring hand type. */
export type HandType = z.infer<typeof HandTypeSchema>;
/** Enum-style access to hand types, e.g. `HandType.HIGH_TABLE`. */
export const HandType = HandTypeSchema.enum;

/**
 * Decimal tie-breaking conventions a SAP can declare. There is no universal
 * rule: each scenario's rulebook is authoritative.
 */
export const RoundingModeSchema = z.enum([
  "HALF_EVEN",
  "HALF_AWAY_FROM_ZERO",
  "TRUNCATE",
]);
/** A decimal rounding convention. */
export type RoundingMode = z.infer<typeof RoundingModeSchema>;

const nonNegativeInt = z.number().int().nonnegative();
const identifier = z.string().trim().min(1).max(64);

/** Base Chips and base +Mult a hand type is worth before any card is scored. */
export const HandBaseScoreSchema = z.object({
  handType: HandTypeSchema,
  baseChips: nonNegativeInt,
  baseMult: nonNegativeInt,
  description: z.string().min(1),
});
/** Base Chips and +Mult for one hand type. */
export type HandBaseScore = z.infer<typeof HandBaseScoreSchema>;

/** A planned output (Table, Listing or Figure) and its scoring weight. */
export const TableShellSpecSchema = z.object({
  id: identifier,
  tableNumber: z.string().min(1),
  title: z.string().min(1),
  cardType: CardTypeSchema,
  targetPopulation: PopulationTypeSchema,
  chips: nonNegativeInt,
  mult: nonNegativeInt,
  requiredRulebookId: identifier,
  allowedFootnoteSlots: nonNegativeInt,
  isBlinded: z.boolean().optional(),
});
/** A table shell card specification. */
export type TableShellSpec = z.infer<typeof TableShellSpecSchema>;

/** A zero-based grid coordinate inside a staged output. */
export const CellCoordinatesSchema = z.object({
  row: nonNegativeInt,
  col: nonNegativeInt,
});
/** A zero-based grid coordinate. */
export type CellCoordinates = z.infer<typeof CellCoordinatesSchema>;

/**
 * The scoring consequence of one rule check. `multMultiplier` of 0 is the
 * zero-score rule: it forces the hand's final Mult to 0.
 */
export const RuleCheckResultSchema = z.object({
  ruleId: identifier,
  passed: z.boolean(),
  chipsDelta: z.number().int(),
  multDelta: z.number().int(),
  multMultiplier: z.number().nonnegative().optional(),
  evidence: z.string().min(1),
  cellCoordinates: CellCoordinatesSchema.optional(),
});
/** The scoring consequence of one rule check. */
export type RuleCheckResult = z.infer<typeof RuleCheckResultSchema>;

/** Categories of QC discrepancy the validator can raise. */
export const QcCategorySchema = z.enum([
  "DENOMINATOR",
  "PRECISION",
  "ROUNDING",
  "VALUE",
]);
/** A QC discrepancy category. */
export type QcCategory = z.infer<typeof QcCategorySchema>;

/** How badly an unresolved discrepancy damages a hand. */
export const QcSeveritySchema = z.enum(["FATAL", "MAJOR", "MINOR"]);
/** A QC discrepancy severity. */
export type QcSeverity = z.infer<typeof QcSeveritySchema>;

/** One SAP rule, with the scoring effect of breaking or fixing it. */
export const SapRuleSchema = z.object({
  id: identifier,
  category: QcCategorySchema,
  severity: QcSeveritySchema,
  statement: z.string().min(1),
  consequence: z.string().min(1),
  /** +Mult earned when a discrepancy against this rule is corrected. */
  correctionMultBonus: nonNegativeInt,
  /** +Mult lost (as a positive number) while a non-fatal discrepancy stands. */
  redlineMultPenalty: nonNegativeInt,
});
/** One SAP rule. */
export type SapRule = z.infer<typeof SapRuleSchema>;

/** Declares two populations equivalent for a scenario. Absent by default. */
export const PopulationAliasSchema = z.object({
  population: PopulationTypeSchema,
  equals: PopulationTypeSchema,
});
/** A SAP-declared population equivalence. */
export type PopulationAlias = z.infer<typeof PopulationAliasSchema>;

/**
 * A Statistical Analysis Plan rulebook: the population suit, precision and
 * rounding convention a scenario's outputs are validated against.
 */
export const SapRulebookSchema = z
  .object({
    id: identifier,
    title: z.string().min(1),
    populationSuit: PopulationTypeSchema,
    populationAliases: z.array(PopulationAliasSchema),
    percentPrecision: z.number().int().min(0).max(6),
    meanPrecision: z.number().int().min(0).max(6),
    roundingMode: RoundingModeSchema,
    rules: z.array(SapRuleSchema).min(1),
  })
  .superRefine((rulebook, ctx) => {
    for (const category of QcCategorySchema.options) {
      if (!rulebook.rules.some((rule) => rule.category === category)) {
        ctx.addIssue({
          code: "custom",
          path: ["rules"],
          message: `Rulebook must declare a ${category} rule`,
        });
      }
    }
    for (const [index, alias] of rulebook.populationAliases.entries()) {
      if (alias.population === alias.equals) {
        ctx.addIssue({
          code: "custom",
          path: ["populationAliases", index],
          message: "A population cannot alias itself",
        });
      }
    }
  });
/** A Statistical Analysis Plan rulebook. */
export type SapRulebook = z.infer<typeof SapRulebookSchema>;

/** Treatment arms in the slice's two-arm study. */
export const ArmSchema = z.enum(["PLACEBO", "ACTIVE"]);
/** A treatment arm. */
export type Arm = z.infer<typeof ArmSchema>;

/**
 * One treatment-emergent adverse event, coded to a MedDRA System Organ Class
 * and preferred term. Fictional teaching data.
 */
export const AdverseEventSchema = z.object({
  soc: z.string().min(1).max(64),
  term: z.string().min(1).max(64),
  /** CTCAE grade, 1 (mild) to 5 (death). */
  grade: z.number().int().min(1).max(5),
  serious: z.boolean(),
  /** The event led to permanent discontinuation of study drug. */
  ledToDiscontinuation: z.boolean(),
});
/** A coded adverse event. */
export type AdverseEvent = z.infer<typeof AdverseEventSchema>;

/** A fictional subject data token and the populations it belongs to. */
export const SubjectSchema = z.object({
  id: identifier,
  arm: ArmSchema,
  age: z.number().int().min(0).max(120),
  sex: z.enum(["F", "M"]),
  populations: z.array(PopulationTypeSchema),
  /** Treatment-emergent adverse events. Absent means none were reported. */
  adverseEvents: z.array(AdverseEventSchema).optional(),
});
/** A fictional subject data token. */
export type Subject = z.infer<typeof SubjectSchema>;

/** An immutable, versioned record of population membership. */
export const PopulationSnapshotSchema = z.object({
  id: identifier,
  version: z.number().int().positive(),
  capturedAt: z.iso.datetime(),
  subjects: z.array(SubjectSchema),
});
/** An immutable population snapshot. */
export type PopulationSnapshot = z.infer<typeof PopulationSnapshotSchema>;

/**
 * Which snapshot an output was compiled against: its id, version and capture
 * time. Every dealt card carries one, so its denominators have provenance.
 */
export const SnapshotRefSchema = z.object({
  id: identifier,
  version: z.number().int().positive(),
  capturedAt: z.iso.datetime(),
});
/** A reference to one population snapshot version. */
export type SnapshotRef = z.infer<typeof SnapshotRefSchema>;

/** Why a subject's population membership changed. */
export const TransitionReasonSchema = z.enum([
  "DROPOUT",
  "PROTOCOL_AMENDMENT",
  "SCREEN_FAILURE",
  "PROTOCOL_DEVIATION",
]);
/** Why a subject's population membership changed. */
export type TransitionReason = z.infer<typeof TransitionReasonSchema>;

/**
 * One subject joining or leaving analysis populations. Applying it to a
 * snapshot produces the next version; `effectiveAt` becomes that version's
 * `capturedAt`, so no clock is read.
 */
export const PopulationTransitionSchema = z.object({
  id: identifier,
  subjectId: identifier,
  reason: TransitionReasonSchema,
  change: z.enum(["JOIN", "LEAVE"]),
  populations: z.array(PopulationTypeSchema).min(1),
  effectiveAt: z.iso.datetime(),
  /** What happened, in the study's words. */
  description: z.string().min(1).max(280),
});
/** One subject joining or leaving analysis populations. */
export type PopulationTransition = z.infer<typeof PopulationTransitionSchema>;

/** A scripted study event: a transition applied after a given hand. */
export const StudyEventSchema = z.object({
  /** Fires once the Blind's hands played reaches this count. */
  afterHands: z.number().int().positive(),
  transition: PopulationTransitionSchema,
});
/** A scripted study event. */
export type StudyEvent = z.infer<typeof StudyEventSchema>;

/** Which subjects a column summarises. */
export const ColumnArmSchema = z.enum(["PLACEBO", "ACTIVE", "TOTAL"]);
/** A column's arm filter. */
export type ColumnArm = z.infer<typeof ColumnArmSchema>;

/** The statistic a table row reports, re-derivable from the snapshot. */
export const RowStatisticSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("POPULATION_N") }),
  z.object({ kind: z.literal("MEAN_AGE") }),
  z.object({ kind: z.literal("SEX_COUNT_PCT"), sex: z.enum(["F", "M"]) }),
  z.object({
    kind: z.literal("AGE_AT_LEAST_COUNT_PCT"),
    minAge: z.number().int().min(0),
  }),
  /**
   * Subjects with at least one adverse event matching every given filter,
   * as "n (%)". A subject counts once however many events match (MedDRA
   * incidence is by subject, not by event).
   */
  z.object({
    kind: z.literal("AE_SUBJECT_COUNT_PCT"),
    soc: z.string().min(1).max(64).optional(),
    term: z.string().min(1).max(64).optional(),
    serious: z.literal(true).optional(),
    minGrade: z.number().int().min(1).max(5).optional(),
    ledToDiscontinuation: z.literal(true).optional(),
  }),
]);
/** A row statistic definition. */
export type RowStatistic = z.infer<typeof RowStatisticSchema>;

/** A staged output card: the displayed cells a reviewer checks. */
export const StagedTableSchema = z
  .object({
    id: identifier,
    shellId: identifier,
    draftLabel: z.string().min(1),
    populationSnapshotId: identifier,
    columns: z
      .array(
        z.object({
          id: identifier,
          label: z.string().min(1),
          arm: ColumnArmSchema,
        })
      )
      .min(1),
    rows: z
      .array(
        z.object({
          id: identifier,
          label: z.string().min(1),
          statistic: RowStatisticSchema,
        })
      )
      .min(1),
    cells: z.array(z.array(z.string())),
  })
  .superRefine((table, ctx) => {
    if (table.cells.length !== table.rows.length) {
      ctx.addIssue({
        code: "custom",
        path: ["cells"],
        message: "cells must have one entry per row",
      });
      return;
    }
    table.cells.forEach((row, index) => {
      if (row.length !== table.columns.length) {
        ctx.addIssue({
          code: "custom",
          path: ["cells", index],
          message: "each cell row must have one entry per column",
        });
      }
    });
  });
/** A staged output card. */
export type StagedTable = z.infer<typeof StagedTableSchema>;

/** One validator finding, explained for the reviewer. */
export const QcFindingSchema = z.object({
  /** Stable identifier: `<ruleId>@r<row>c<col>`. */
  id: z.string().min(1),
  ruleId: identifier,
  category: QcCategorySchema,
  severity: QcSeveritySchema,
  cell: CellCoordinatesSchema,
  observed: z.string(),
  expected: z.string(),
  evidence: z.string().min(1),
  rule: z.string().min(1),
  consequence: z.string().min(1),
});
/** One validator finding. */
export type QcFinding = z.infer<typeof QcFindingSchema>;

/** The validator's complete, stably ordered output for one staged table. */
export const QcReportSchema = z.object({
  tableId: identifier,
  rulebookId: identifier,
  populationSnapshotId: identifier,
  /** Subjects in the rulebook's population suit, across all arms. */
  populationN: nonNegativeInt,
  findings: z.array(QcFindingSchema),
});
/** The validator's output for one staged table. */
export type QcReport = z.infer<typeof QcReportSchema>;

/** A Chips/+Mult/×Mult contribution from outside the cards (e.g. a relic). */
export const ScoreModifierSchema = z.object({
  sourceId: identifier,
  label: z.string().min(1),
  chips: z.number().int(),
  plusMult: z.number().int(),
  xMult: z.number().nonnegative(),
});
/** A score modifier such as an SOP relic. */
export type ScoreModifier = z.infer<typeof ScoreModifierSchema>;

/** One scored card in a hand. */
export const ScoredCardSchema = z.object({
  id: identifier,
  chips: nonNegativeInt,
  mult: nonNegativeInt,
});
/** One scored card in a hand. */
export type ScoredCard = z.infer<typeof ScoredCardSchema>;

/** Everything the evaluator needs to score one hand. */
export const HandInputSchema = z.object({
  handType: HandTypeSchema,
  cards: z.array(ScoredCardSchema).min(1),
  ruleResults: z.array(RuleCheckResultSchema),
  modifiers: z.array(ScoreModifierSchema).optional(),
});
/** Input to the hand evaluator. */
export type HandInput = z.infer<typeof HandInputSchema>;

/** One line of the score ledger, tagged with its pipeline step. */
export const ScoreLedgerEntrySchema = z.object({
  step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  sourceId: z.string().min(1),
  kind: z.enum(["CHIPS", "PLUS_MULT", "X_MULT"]),
  value: z.number(),
  label: z.string().min(1),
});
/** One line of the score ledger. */
export type ScoreLedgerEntry = z.infer<typeof ScoreLedgerEntrySchema>;

/**
 * The full, explainable result of scoring a hand. Later tickets extend the
 * inputs (relics, synergies), not this shape.
 */
export const HandEvaluationSchema = z.object({
  handType: HandTypeSchema,
  cardIds: z.array(z.string()),
  base: HandBaseScoreSchema,
  chips: z.object({
    base: z.number().int(),
    outputs: z.number().int(),
    relics: z.number().int(),
    total: z.number().int(),
  }),
  mult: z.object({
    base: z.number().int(),
    cardsAndRules: z.number().int(),
    relics: z.number().int(),
    total: z.number().int(),
  }),
  xMult: z.object({
    factors: z.array(z.object({ sourceId: z.string(), value: z.number() })),
    product: z.number().nonnegative(),
  }),
  ruleResults: z.array(RuleCheckResultSchema),
  ledger: z.array(ScoreLedgerEntrySchema),
  zeroRule: z.object({
    triggered: z.boolean(),
    ruleIds: z.array(z.string()),
  }),
  finalMult: z.number().nonnegative(),
  score: z.number().int().nonnegative(),
});
/** The full, explainable result of scoring a hand. */
export type HandEvaluation = z.infer<typeof HandEvaluationSchema>;

/** The debuffs a Boss Blind can impose. */
export const BossDebuffTypeSchema = z.enum([
  "DISABLE_POPULATION",
  "HAND_LIMIT",
  "DISCARD_PENALTY",
  "BLIND_FIREWALL",
]);
/** A Boss Blind debuff type. */
export type BossDebuffType = z.infer<typeof BossDebuffTypeSchema>;

/**
 * A Boss Blind's rule twist. `DISABLE_POPULATION` scores every output built
 * on one of `disabledPopulations` at 0 Chips. The other debuff types are
 * declared for later bosses and have no effect yet.
 */
export const BossBlindModifierSchema = z
  .object({
    id: identifier,
    name: z.string().min(1),
    description: z.string().min(1),
    debuffType: BossDebuffTypeSchema,
    disabledPopulations: z.array(PopulationTypeSchema).optional(),
    maxHandsAllowed: z.number().int().positive().optional(),
    discardCpuPenalty: nonNegativeInt.optional(),
  })
  .superRefine((modifier, ctx) => {
    if (
      modifier.debuffType === "DISABLE_POPULATION" &&
      (modifier.disabledPopulations ?? []).length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["disabledPopulations"],
        message: "DISABLE_POPULATION must name at least one population",
      });
    }
  });
/** A Boss Blind's rule twist. */
export type BossBlindModifier = z.infer<typeof BossBlindModifierSchema>;

/** A milestone quota the player must reach. */
export const BlindSchema = z.object({
  tier: BlindTierSchema,
  name: z.string().min(1),
  quota: z.number().int().positive(),
});
/** A milestone Blind. */
export type Blind = z.infer<typeof BlindSchema>;

/** Stages of the standard CSR submission flow, in pipeline order. */
export const CsrStageSchema = z.enum([
  "DISPOSITION",
  "BASELINE",
  "EFFICACY",
  "SAFETY_AE",
  "PATIENT_LISTING",
]);
/** A CSR pipeline stage (CSR Straight). */
export type CsrStage = z.infer<typeof CsrStageSchema>;

/**
 * A TLF card on the Card Table. `topic` links a Table to its supporting
 * Listing (TLF Pair) and a Figure to the Table it depends on (Efficacy Full
 * House). `draftId` points at a staged table in the scenario's draw pile when
 * the card has reviewable cells.
 */
const faceText = z.string().min(1).max(24);

/** One plotted series on a Figure face, as `[x, y]` points in data units. */
const FigureSeriesSchema = z.object({
  label: faceText,
  points: z
    .array(z.tuple([z.number(), z.number()]))
    .min(2)
    .max(12),
});

/** One subgroup row on a forest-plot face. */
const ForestIntervalSchema = z
  .object({
    label: faceText,
    estimate: z.number(),
    lower: z.number(),
    upper: z.number(),
  })
  .refine((i) => i.lower <= i.estimate && i.estimate <= i.upper, {
    message: "A forest interval must contain its estimate",
  });

/** What a Figure face plots. */
export const FigurePlotSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("KM"),
    series: z.array(FigureSeriesSchema).min(1).max(2),
  }),
  z.object({
    type: z.literal("SPARKLINE"),
    series: z.array(FigureSeriesSchema).min(1).max(2),
  }),
  z.object({
    type: z.literal("FOREST"),
    reference: z.number(),
    intervals: z.array(ForestIntervalSchema).min(2).max(5),
  }),
]);
/** What a Figure face plots. */
export type FigurePlot = z.infer<typeof FigurePlotSchema>;

/**
 * A card's face: a live miniature of the output it represents, rendered from
 * this data rather than from an illustration.
 */
export const CardFaceSchema = z
  .discriminatedUnion("kind", [
    z.object({
      kind: z.literal("TABLE"),
      columns: z.array(faceText).min(2).max(3),
      rows: z
        .array(z.object({ label: faceText, values: z.array(faceText) }))
        .min(3)
        .max(5),
    }),
    z.object({
      kind: z.literal("LISTING"),
      columns: z.array(faceText).min(2).max(4),
      rows: z.array(z.array(faceText)).min(3).max(4),
    }),
    z.object({ kind: z.literal("FIGURE"), plot: FigurePlotSchema }),
    z.object({
      kind: z.literal("TOKEN"),
      cohort: faceText,
      count: nonNegativeInt,
    }),
  ])
  .superRefine((face, ctx) => {
    if (face.kind === "TABLE") {
      face.rows.forEach((row, index) => {
        if (row.values.length !== face.columns.length) {
          ctx.addIssue({
            code: "custom",
            path: ["rows", index, "values"],
            message: "Each face row needs one value per column",
          });
        }
      });
    }
    if (face.kind === "LISTING") {
      face.rows.forEach((row, index) => {
        if (row.length !== face.columns.length) {
          ctx.addIssue({
            code: "custom",
            path: ["rows", index],
            message: "Each listing row needs one value per column",
          });
        }
      });
    }
  });
/** A card's face data. */
export type CardFace = z.infer<typeof CardFaceSchema>;

/** The face kind each card type renders. */
export const FACE_KIND_BY_CARD_TYPE = {
  TABLE: "TABLE",
  LISTING: "LISTING",
  FIGURE: "FIGURE",
  SUBJECT_TOKEN: "TOKEN",
} as const satisfies Record<CardType, CardFace["kind"]>;

/**
 * Marks stamped on a card face. T&E-UX-03 produces REDLINE and QC_PASS; the
 * rest are the slots later tickets fill (stale outputs, sealed and blinded
 * sessions).
 */
export const CardStampSchema = z.enum([
  "REDLINE",
  "QC_PASS",
  "STALE",
  "SEALED",
  "BLINDED",
]);
/** A mark stamped on a card face. */
export type CardStamp = z.infer<typeof CardStampSchema>;

/**
 * A face-down card: an opaque slot and nothing else. It cannot carry face
 * values, so a blinded or undealt card can be rendered without leaking them.
 */
export const RedactedCardSchema = z
  .object({ slot: identifier, faceDown: z.literal(true) })
  .strict();
/** A face-down card. */
export type RedactedCard = z.infer<typeof RedactedCardSchema>;

export const TlfCardSchema = z.object({
  id: identifier,
  cardType: CardTypeSchema,
  number: z.string().min(1),
  title: z.string().min(1),
  population: PopulationTypeSchema,
  chips: nonNegativeInt,
  mult: nonNegativeInt,
  topic: identifier,
  csrStage: CsrStageSchema.optional(),
  soc: z.string().min(1).optional(),
  draftId: identifier.optional(),
  /** Face data. Draft cards derive their face from the draft table instead. */
  face: CardFaceSchema.optional(),
});
/** A TLF card on the Card Table. */
export type TlfCard = z.infer<typeof TlfCardSchema>;

/** The best hand a selection makes, and the cards that actually score. */
export const HandClassificationSchema = z.object({
  handType: HandTypeSchema,
  scoringCardIds: z.array(identifier).min(1),
});
/** The best hand a selection makes. */
export type HandClassification = z.infer<typeof HandClassificationSchema>;

/** Card Table rules for a scenario. */
export const TableRulesSchema = z.object({
  startingCpu: nonNegativeInt,
  handSize: z.number().int().min(1).max(12),
  maxSelection: z.number().int().min(1).max(5),
});
/** Card Table rules for a scenario. */
export type TableRules = z.infer<typeof TableRulesSchema>;

/**
 * A playable scenario (one Blind): SAP, snapshot, the shells its drafts are
 * compiled from, and a fixed draw pile.
 */
export const ScenarioSchema = z
  .object({
    id: identifier,
    title: z.string().min(1),
    summary: z.string().min(1),
    /** The short intro card shown when the Blind starts. */
    intro: z.string().min(1).max(280),
    blind: BlindSchema,
    /** Present only on a Boss Blind. */
    boss: BossBlindModifierSchema.optional(),
    handType: HandTypeSchema,
    startingCpu: nonNegativeInt,
    rulebook: SapRulebookSchema,
    populationSnapshot: PopulationSnapshotSchema,
    shells: z.array(TableShellSpecSchema).min(1),
    drawPile: z.array(StagedTableSchema).min(1),
    table: TableRulesSchema,
    deck: z.array(TlfCardSchema).min(1),
    /** Scripted population changes during this Blind, in hand order. */
    events: z.array(StudyEventSchema).optional(),
  })
  .superRefine((scenario, ctx) => {
    const subjectIds = new Set(
      scenario.populationSnapshot.subjects.map((s) => s.id)
    );
    (scenario.events ?? []).forEach((event, index) => {
      if (!subjectIds.has(event.transition.subjectId)) {
        ctx.addIssue({
          code: "custom",
          path: ["events", index, "transition", "subjectId"],
          message: "A study event must name a subject in the snapshot",
        });
      }
    });
    if (
      (scenario.boss !== undefined) !==
      (scenario.blind.tier === "BOSS_BLIND")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["boss"],
        message:
          "A Boss Blind needs exactly one boss modifier; other Blinds none",
      });
    }
    const shellIds = new Set<string>();
    scenario.shells.forEach((shell, index) => {
      if (shellIds.has(shell.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["shells", index, "id"],
          message: "Shell ids must be unique",
        });
      }
      shellIds.add(shell.id);
      if (shell.requiredRulebookId !== scenario.rulebook.id) {
        ctx.addIssue({
          code: "custom",
          path: ["shells", index, "requiredRulebookId"],
          message: "Shell must require the scenario's rulebook",
        });
      }
    });
    scenario.drawPile.forEach((table, index) => {
      if (!shellIds.has(table.shellId)) {
        ctx.addIssue({
          code: "custom",
          path: ["drawPile", index, "shellId"],
          message:
            "Every draft must be compiled from one of the scenario's shells",
        });
      }
      if (table.populationSnapshotId !== scenario.populationSnapshot.id) {
        ctx.addIssue({
          code: "custom",
          path: ["drawPile", index, "populationSnapshotId"],
          message: "Every draft must reference the scenario's snapshot",
        });
      }
    });
    const draftIds = new Set(scenario.drawPile.map((draft) => draft.id));
    const seen = new Set<string>();
    scenario.deck.forEach((card, index) => {
      if (seen.has(card.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["deck", index, "id"],
          message: "Card ids must be unique",
        });
      }
      seen.add(card.id);
      if (card.draftId !== undefined && !draftIds.has(card.draftId)) {
        ctx.addIssue({
          code: "custom",
          path: ["deck", index, "draftId"],
          message: "A card's draft must exist in the draw pile",
        });
      }
      if ((card.face === undefined) === (card.draftId === undefined)) {
        ctx.addIssue({
          code: "custom",
          path: ["deck", index, "face"],
          message: "A card needs exactly one of face data or a draft",
        });
      }
      if (
        card.face !== undefined &&
        card.face.kind !== FACE_KIND_BY_CARD_TYPE[card.cardType]
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["deck", index, "face", "kind"],
          message: "A card's face must match its card type",
        });
      }
    });
  });
/** A playable scenario. */
export type Scenario = z.infer<typeof ScenarioSchema>;

/**
 * One act of a run: a single study whose Blinds are played in order, Small
 * to Boss. Every Blind declares the study's opening population snapshot; the
 * run carries any later versions from one Blind into the next.
 */
export const ActSchema = z
  .object({
    id: identifier,
    title: z.string().min(1),
    blinds: z.array(ScenarioSchema).min(1).max(3),
  })
  .superRefine((act, ctx) => {
    const tiers = BlindTierSchema.options;
    act.blinds.forEach((blind, index) => {
      if (index === 0) return;
      const previous = act.blinds[index - 1];
      if (
        tiers.indexOf(blind.blind.tier) <= tiers.indexOf(previous.blind.tier)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["blinds", index, "blind", "tier"],
          message: "Blinds must escalate: Small, then Big, then Boss",
        });
      }
      if (blind.populationSnapshot.id !== previous.populationSnapshot.id) {
        ctx.addIssue({
          code: "custom",
          path: ["blinds", index, "populationSnapshot", "id"],
          message: "Every Blind in an act reads the study's one snapshot",
        });
      }
    });
  });
/** One act of a run. */
export type Act = z.infer<typeof ActSchema>;
