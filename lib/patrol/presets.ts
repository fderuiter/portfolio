import {
  INITIAL_PATROL_SCENARIOS,
  OEC_SAMPLE_SCENARIO,
} from "./scenarios/catalog";
import type { PatrolScenario } from "./types";

/**
 * Public catalog re-export for Patrol Shift initial scenario presets.
 */
export const PATROL_SCENARIOS: PatrolScenario[] = INITIAL_PATROL_SCENARIOS;

/**
 * Sample clinical OEC scenario for patient assessment and care interaction.
 * // PLACEHOLDER — needs OEC/NSP content review, see #744
 */
export const OEC_SAMPLE_SCENARIO_PRESET: PatrolScenario = OEC_SAMPLE_SCENARIO;

/**
 * Comprehensive list of all scenarios registered across milestones.
 */
export const ALL_PATROL_SCENARIOS: PatrolScenario[] = [
  ...INITIAL_PATROL_SCENARIOS,
  OEC_SAMPLE_SCENARIO,
];

export function getScenarioById(id: string): PatrolScenario | undefined {
  return ALL_PATROL_SCENARIOS.find((s) => s.id === id);
}
