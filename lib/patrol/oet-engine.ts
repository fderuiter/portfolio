import type { OETEngineState, PatrolScenario, ScenarioAction } from "./types";

/**
 * Stub OET (Outdoor Emergency Transportation) Evaluation Engine.
 */
export function createOETEngineState(): OETEngineState {
  return {
    evaluatedCount: 0,
    rulesPassed: 0,
    rulesFailed: 0,
  };
}

export function evaluateOETCompliance(
  scenario: PatrolScenario,
  _actionsTaken: ScenarioAction[]
): {
  score: number;
  passedCount: number;
  failedCount: number;
} {
  if (!scenario.debriefRules || scenario.debriefRules.length === 0) {
    return { score: 100, passedCount: 0, failedCount: 0 };
  }

  const totalPossible = scenario.debriefRules.reduce(
    (acc, rule) => acc + rule.score,
    0
  );

  // Basic stub evaluation based on action history presence
  const evaluatedPassed = scenario.debriefRules.filter((rule) => rule.passed);
  const earnedScore = evaluatedPassed.reduce(
    (acc, rule) => acc + rule.score,
    0
  );

  const normalizedScore =
    totalPossible > 0 ? Math.round((earnedScore / totalPossible) * 100) : 100;

  return {
    score: normalizedScore,
    passedCount: evaluatedPassed.length,
    failedCount: scenario.debriefRules.length - evaluatedPassed.length,
  };
}
