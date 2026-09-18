import type { DebriefReport, PatrolScenario, ShiftState } from "./types";
import { evaluateOETCompliance } from "./oet-engine";

/**
 * Debrief generation and evaluation helpers.
 */
export function generateDebriefReport(
  scenario: PatrolScenario,
  shiftState: ShiftState
): DebriefReport {
  const oetResult = evaluateOETCompliance(scenario, shiftState.actionHistory);

  const passedRules = scenario.debriefRules.filter((r) => r.passed);
  const failedRules = scenario.debriefRules.filter((r) => !r.passed);

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
