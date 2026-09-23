import type {
  HandEvaluation,
  HandInput,
  QcReport,
  RuleCheckResult,
  SapRule,
  SapRulebook,
  ScoreLedgerEntry,
} from "../types";
import { HAND_BASE_SCORES } from "./hands";

/** Which findings the scoring view should see and which are corrected. */
export interface RuleResultOptions {
  /** Findings the reviewer has corrected. */
  resolvedFindingIds: readonly string[];
  /**
   * When provided, only these findings are scored: the reviewer's known view
   * of the hand. Omit it to score the hand as it truly is.
   */
  visibleFindingIds?: readonly string[];
}

/**
 * Converts validator findings into scoring consequences.
 *
 * A corrected finding earns its rule's correction bonus. An unresolved fatal
 * finding carries `multMultiplier: 0` (the zero-score rule); an unresolved
 * non-fatal finding is a redline that subtracts its rule's penalty. When no
 * denominator finding stands, the population's verified subject records are
 * credited as Chips.
 */
export function ruleResultsFor(
  report: QcReport,
  rulebook: SapRulebook,
  options: RuleResultOptions
): RuleCheckResult[] {
  const resolved = new Set(options.resolvedFindingIds);
  const visible = options.visibleFindingIds
    ? new Set(options.visibleFindingIds)
    : null;
  const findings = report.findings.filter((f) => !visible || visible.has(f.id));
  const rules = new Map<string, SapRule>(rulebook.rules.map((r) => [r.id, r]));

  const results: RuleCheckResult[] = findings.map((f) => {
    const rule = rules.get(f.ruleId) as SapRule;
    const cellCoordinates = { ...f.cell };
    if (resolved.has(f.id)) {
      return {
        ruleId: f.ruleId,
        passed: true,
        chipsDelta: 0,
        multDelta: rule.correctionMultBonus,
        evidence: `Corrected ${f.observed} to ${f.expected}.`,
        cellCoordinates,
      };
    }
    if (f.severity === "FATAL") {
      return {
        ruleId: f.ruleId,
        passed: false,
        chipsDelta: 0,
        multDelta: 0,
        multMultiplier: 0,
        evidence: f.evidence,
        cellCoordinates,
      };
    }
    return {
      ruleId: f.ruleId,
      passed: false,
      chipsDelta: 0,
      multDelta: -rule.redlineMultPenalty,
      evidence: f.evidence,
      cellCoordinates,
    };
  });

  const denominatorStands = findings.some(
    (f) => f.category === "DENOMINATOR" && !resolved.has(f.id)
  );
  if (!denominatorStands) {
    const denominatorRule = rulebook.rules.find(
      (r) => r.category === "DENOMINATOR"
    ) as SapRule;
    results.unshift({
      ruleId: denominatorRule.id,
      passed: true,
      chipsDelta: report.populationN,
      multDelta: 0,
      evidence: `${report.populationN} subject records reconcile to snapshot ${report.populationSnapshotId}.`,
    });
  }
  return results;
}

/** Rounds away binary floating-point noise before flooring a score. */
function floorScore(value: number): number {
  return Math.floor(Math.round(value * 1e6) / 1e6);
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Scores a hand through the pipeline pinned in #890:
 * (base hand Chips + Σ output Chips + Σ relic Chips) × (base hand Mult +
 * Σ card and rule +Mult + Σ relic +Mult) × Π ×Mult. Any rule result with a
 * `multMultiplier` of 0 triggers the zero-score rule. Pure and deterministic.
 */
export function evaluateHand(input: HandInput): HandEvaluation {
  const base = HAND_BASE_SCORES[input.handType];
  const modifiers = input.modifiers ?? [];
  const ledger: ScoreLedgerEntry[] = [];

  ledger.push({
    step: 1,
    sourceId: base.handType,
    kind: "CHIPS",
    value: base.baseChips,
    label: `${base.handType} base Chips`,
  });
  for (const card of input.cards) {
    ledger.push({
      step: 1,
      sourceId: card.id,
      kind: "CHIPS",
      value: card.chips,
      label: `${card.id} Chips`,
    });
  }
  for (const result of input.ruleResults) {
    if (result.chipsDelta !== 0) {
      ledger.push({
        step: 1,
        sourceId: result.ruleId,
        kind: "CHIPS",
        value: result.chipsDelta,
        label: result.evidence,
      });
    }
  }
  for (const modifier of modifiers) {
    if (modifier.chips !== 0) {
      ledger.push({
        step: 1,
        sourceId: modifier.sourceId,
        kind: "CHIPS",
        value: modifier.chips,
        label: modifier.label,
      });
    }
  }

  ledger.push({
    step: 2,
    sourceId: base.handType,
    kind: "PLUS_MULT",
    value: base.baseMult,
    label: `${base.handType} base +Mult`,
  });
  for (const card of input.cards) {
    ledger.push({
      step: 2,
      sourceId: card.id,
      kind: "PLUS_MULT",
      value: card.mult,
      label: `${card.id} +Mult`,
    });
  }
  for (const result of input.ruleResults) {
    if (result.multDelta !== 0) {
      ledger.push({
        step: 2,
        sourceId: result.ruleId,
        kind: "PLUS_MULT",
        value: result.multDelta,
        label: result.evidence,
      });
    }
  }
  for (const modifier of modifiers) {
    if (modifier.plusMult !== 0) {
      ledger.push({
        step: 2,
        sourceId: modifier.sourceId,
        kind: "PLUS_MULT",
        value: modifier.plusMult,
        label: modifier.label,
      });
    }
  }

  const factors: { sourceId: string; value: number }[] = [];
  for (const result of input.ruleResults) {
    if (result.multMultiplier !== undefined) {
      factors.push({ sourceId: result.ruleId, value: result.multMultiplier });
      ledger.push({
        step: 3,
        sourceId: result.ruleId,
        kind: "X_MULT",
        value: result.multMultiplier,
        label: result.evidence,
      });
    }
  }
  for (const modifier of modifiers) {
    factors.push({ sourceId: modifier.sourceId, value: modifier.xMult });
    ledger.push({
      step: 3,
      sourceId: modifier.sourceId,
      kind: "X_MULT",
      value: modifier.xMult,
      label: modifier.label,
    });
  }

  const outputChips =
    sum(input.cards.map((c) => c.chips)) +
    sum(input.ruleResults.map((r) => r.chipsDelta));
  const relicChips = sum(modifiers.map((m) => m.chips));
  const chipsTotal = Math.max(0, base.baseChips + outputChips + relicChips);

  const cardAndRuleMult =
    sum(input.cards.map((c) => c.mult)) +
    sum(input.ruleResults.map((r) => r.multDelta));
  const relicMult = sum(modifiers.map((m) => m.plusMult));
  const multTotal = Math.max(0, base.baseMult + cardAndRuleMult + relicMult);

  const product = factors.reduce((total, f) => total * f.value, 1);
  const zeroRuleIds = input.ruleResults
    .filter((r) => r.multMultiplier === 0)
    .map((r) => r.ruleId);
  const triggered = zeroRuleIds.length > 0;
  const finalMult = triggered ? 0 : multTotal * product;
  const score = floorScore(chipsTotal * finalMult);

  ledger.push({
    step: 4,
    sourceId: "FINAL",
    kind: "X_MULT",
    value: finalMult,
    label: triggered
      ? `Zero-score rule: ${zeroRuleIds.join(", ")}`
      : `${chipsTotal} Chips × ${finalMult} Mult`,
  });

  return {
    handType: input.handType,
    cardIds: input.cards.map((c) => c.id),
    base: { ...base },
    chips: {
      base: base.baseChips,
      outputs: outputChips,
      relics: relicChips,
      total: chipsTotal,
    },
    mult: {
      base: base.baseMult,
      cardsAndRules: cardAndRuleMult,
      relics: relicMult,
      total: multTotal,
    },
    xMult: { factors, product },
    ruleResults: input.ruleResults.map((r) => ({ ...r })),
    ledger,
    zeroRule: { triggered, ruleIds: zeroRuleIds },
    finalMult,
    score,
  };
}
