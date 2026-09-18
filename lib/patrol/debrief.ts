import type { DebriefReport, PatrolScenario, ShiftState } from "./types";
import { evaluateOETCompliance } from "./oet-engine";

/**
 * Debrief generation and evaluation helpers.
 */
export function generateDebriefReport(
  scenario: PatrolScenario,
  shiftState: ShiftState
): DebriefReport {
  const oetResult = evaluateOETCompliance(
    scenario,
    shiftState.actionHistory,
    shiftState.activeEvents
  );

  const rules = oetResult.evaluatedRules ?? scenario.debriefRules;
  const passedRules = rules.filter((r) => r.passed);
  const failedRules = rules.filter((r) => !r.passed);

  return {
    scenarioId: scenario.id,
    totalTimeMinutes: shiftState.timeElapsedMinutes,
    score: oetResult.score,
    maxPossibleScore: 100,
    passedRules,
    failedRules,
    summary: `Shift completed for ${scenario.title}. Performance score: ${oetResult.score}%. Actions taken: ${shiftState.actionHistory.length}.`,
  };
}
