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

/** A fictional subject data token and the populations it belongs to. */
export const SubjectSchema = z.object({
  id: identifier,
  arm: ArmSchema,
  age: z.number().int().min(0).max(120),
  sex: z.enum(["F", "M"]),
  populations: z.array(PopulationTypeSchema),
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

/** A playable scenario: SAP, snapshot, shell, and a fixed draw pile. */
export const ScenarioSchema = z
  .object({
    id: identifier,
    title: z.string().min(1),
    summary: z.string().min(1),
    blind: BlindSchema,
    handType: HandTypeSchema,
    startingCpu: nonNegativeInt,
    rulebook: SapRulebookSchema,
    populationSnapshot: PopulationSnapshotSchema,
    shell: TableShellSpecSchema,
    drawPile: z.array(StagedTableSchema).min(1),
    table: TableRulesSchema,
    deck: z.array(TlfCardSchema).min(1),
  })
  .superRefine((scenario, ctx) => {
    if (scenario.shell.requiredRulebookId !== scenario.rulebook.id) {
      ctx.addIssue({
        code: "custom",
        path: ["shell", "requiredRulebookId"],
        message: "Shell must require the scenario's rulebook",
      });
    }
    scenario.drawPile.forEach((table, index) => {
      if (table.shellId !== scenario.shell.id) {
        ctx.addIssue({
          code: "custom",
          path: ["drawPile", index, "shellId"],
          message: "Every draft must be compiled from the scenario's shell",
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
    });
  });
/** A playable scenario. */
export type Scenario = z.infer<typeof ScenarioSchema>;
