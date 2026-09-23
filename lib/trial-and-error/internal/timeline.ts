import type { HandEvaluation, HandType } from "../types";
import { HAND_NAMES } from "./hands";

/** Running totals after a step: what the score plate shows at that moment. */
export interface TimelineRunning {
  chips: number;
  mult: number;
  xMult: number;
}

/** One step of a hand's scoring, in playback order. */
export type TimelineStep = { text: string; running: TimelineRunning } & (
  | {
      kind: "HAND_BASE";
      handType: HandType;
      level: number;
      chips: number;
      mult: number;
    }
  | {
      kind: "CARD_SCORED";
      cardId: string;
      chips: number;
      mult: number;
      retrigger: number;
    }
  | {
      kind: "RULE";
      ruleId: string;
      chipsDelta: number;
      multDelta: number;
      evidence: string;
    }
  | {
      kind: "RELIC";
      relicId: string;
      phase: "ON_CARD_SCORED" | "ON_HAND_PLAYED";
      chips: number;
      mult: number;
      xMult: number;
    }
  | { kind: "X_MULT"; source: string; factor: number }
  | { kind: "ZERO_RULE"; ruleId: string; evidence: string; label: string }
  | { kind: "TOTAL"; chips: number; mult: number; score: number }
  | {
      kind: "BLIND_PROGRESS";
      before: number;
      after: number;
      target: number;
      crossed: boolean;
    }
);

/** Everything outside the evaluation that the timeline narrates. */
export interface TimelineContext {
  /** Round score before this hand. */
  roundScoreBefore: number;
  /** The Blind quota. */
  target: number;
  /** Display names for card ids (falls back to the id). */
  cardNames?: Readonly<Record<string, string>>;
  /** Short slam labels for zero-rule ids, e.g. "DENOMINATOR ERROR". */
  zeroRuleLabels?: Readonly<Record<string, string>>;
}

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/**
 * Turns a hand's evaluation into an ordered, narratable scoring timeline.
 *
 * The order is: hand base, each scored card (retriggers repeat the card),
 * rule results, relic contributions, multiplicative factors, the zero-score
 * rule if triggered, the total, then Blind progress. Every step carries the
 * running totals, so a player only displays values and never computes them.
 * Pure and deterministic; the TOTAL step always equals the evaluation.
 */
export function scoreTimeline(
  evaluation: HandEvaluation,
  context: TimelineContext
): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const running: TimelineRunning = { chips: 0, mult: 0, xMult: 1 };
  const snapshot = (): TimelineRunning => ({ ...running });
  const name = (id: string) => context.cardNames?.[id] ?? id;

  running.chips += evaluation.base.baseChips;
  running.mult += evaluation.base.baseMult;
  steps.push({
    kind: "HAND_BASE",
    handType: evaluation.handType,
    level: 1,
    chips: evaluation.base.baseChips,
    mult: evaluation.base.baseMult,
    text: `${HAND_NAMES[evaluation.handType]}: ${evaluation.base.baseChips} Chips, +${evaluation.base.baseMult} Mult.`,
    running: snapshot(),
  });

  const cardIds = new Set(evaluation.cardIds);
  const ruleIds = new Set(evaluation.ruleResults.map((r) => r.ruleId));
  const ledgerValue = (sourceId: string, kind: "CHIPS" | "PLUS_MULT") =>
    evaluation.ledger
      .filter((l) => l.sourceId === sourceId && l.kind === kind && l.step !== 4)
      .reduce((sum, l) => sum + l.value, 0);

  for (const cardId of evaluation.cardIds) {
    const chips = ledgerValue(cardId, "CHIPS");
    const mult = ledgerValue(cardId, "PLUS_MULT");
    running.chips += chips;
    running.mult += mult;
    steps.push({
      kind: "CARD_SCORED",
      cardId,
      chips,
      mult,
      retrigger: 0,
      text: `${name(cardId)}: ${signed(chips)} Chips${mult ? `, ${signed(mult)} Mult` : ""}.`,
      running: snapshot(),
    });
  }

  for (const result of evaluation.ruleResults) {
    if (result.chipsDelta === 0 && result.multDelta === 0) continue;
    running.chips += result.chipsDelta;
    running.mult += result.multDelta;
    const parts = [
      result.chipsDelta ? `${signed(result.chipsDelta)} Chips` : "",
      result.multDelta ? `${signed(result.multDelta)} Mult` : "",
    ].filter(Boolean);
    steps.push({
      kind: "RULE",
      ruleId: result.ruleId,
      chipsDelta: result.chipsDelta,
      multDelta: result.multDelta,
      evidence: result.evidence,
      text: `${result.ruleId}: ${parts.join(", ")}. ${result.evidence}`,
      running: snapshot(),
    });
  }

  const relicIds = [
    ...new Set(
      evaluation.ledger
        .filter(
          (l) =>
            l.step !== 4 &&
            l.sourceId !== evaluation.handType &&
            !cardIds.has(l.sourceId) &&
            !ruleIds.has(l.sourceId)
        )
        .map((l) => l.sourceId)
    ),
  ];
  for (const relicId of relicIds) {
    const chips = ledgerValue(relicId, "CHIPS");
    const mult = ledgerValue(relicId, "PLUS_MULT");
    const factor =
      evaluation.xMult.factors.find((f) => f.sourceId === relicId)?.value ?? 1;
    running.chips += chips;
    running.mult += mult;
    steps.push({
      kind: "RELIC",
      relicId,
      phase: "ON_HAND_PLAYED",
      chips,
      mult,
      xMult: factor,
      text: `${relicId}: ${[chips ? `${signed(chips)} Chips` : "", mult ? `${signed(mult)} Mult` : "", factor !== 1 ? `×${factor} Mult` : ""].filter(Boolean).join(", ") || "no effect"}.`,
      running: snapshot(),
    });
  }

  const zeroIds = new Set(evaluation.zeroRule.ruleIds);
  for (const factor of evaluation.xMult.factors) {
    if (zeroIds.has(factor.sourceId) && factor.value === 0) continue;
    running.xMult *= factor.value;
    steps.push({
      kind: "X_MULT",
      source: factor.sourceId,
      factor: factor.value,
      text: `${factor.sourceId}: ×${factor.value} Mult.`,
      running: snapshot(),
    });
  }

  if (evaluation.zeroRule.triggered) {
    running.xMult = 0;
    const [first] = evaluation.zeroRule.ruleIds;
    const result = evaluation.ruleResults.find(
      (r) => r.ruleId === first && r.multMultiplier === 0
    );
    const label = context.zeroRuleLabels?.[first] ?? "ZERO-SCORE RULE";
    const count = evaluation.zeroRule.ruleIds.length;
    steps.push({
      kind: "ZERO_RULE",
      ruleId: first,
      evidence: result?.evidence ?? "",
      label,
      text: `${label} ×0: ${count} fatal finding${count === 1 ? "" : "s"} under ${first}. ${result?.evidence ?? ""}`.trim(),
      running: snapshot(),
    });
  }

  steps.push({
    kind: "TOTAL",
    chips: evaluation.chips.total,
    mult: evaluation.finalMult,
    score: evaluation.score,
    text: `Hand scores ${evaluation.score}: ${evaluation.chips.total} Chips × ${evaluation.finalMult} Mult.`,
    running: snapshot(),
  });

  const before = context.roundScoreBefore;
  const after = before + evaluation.score;
  const crossed = before < context.target && after >= context.target;
  steps.push({
    kind: "BLIND_PROGRESS",
    before,
    after,
    target: context.target,
    crossed,
    text: `Round ${after} of ${context.target}.${crossed ? " Target crossed: Blind cleared." : ""}`,
    running: snapshot(),
  });

  return steps;
}
