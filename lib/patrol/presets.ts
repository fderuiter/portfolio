import { INITIAL_PATROL_SCENARIOS } from "./scenarios/catalog";
import type { PatrolScenario } from "./types";

/**
 * Public catalog re-export for Patrol Shift scenario presets.
 */
export const PATROL_SCENARIOS: PatrolScenario[] = INITIAL_PATROL_SCENARIOS;

export function getScenarioById(id: string): PatrolScenario | undefined {
  return PATROL_SCENARIOS.find((s) => s.id === id);
}
