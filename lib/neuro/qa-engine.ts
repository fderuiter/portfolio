/**
 * NeuroRecon QA Evaluation Engine & Morphometric Metric Calculator
 * Computes live Euler characteristics (χ = 2 - 2g), Dice Similarity Coefficients,
 * Defect Counts, and Cortical Thickness estimates.
 */

import { ControlPoint, QAMetrics, ScenarioConfig, VoxelEdit } from "./types";
import { SyntheticVolume } from "./volume-generator";
import { roundToDecimals } from "../utils";

/**
 * Evaluate the live QA status of the current workspace state.
 */
export function evaluateQAMetrics(
  scenario: ScenarioConfig,
  volume: SyntheticVolume,
  controlPoints: ControlPoint[],
  voxelEdits: VoxelEdit[]
): QAMetrics {
  const { min, max } = volume.defectRegion;
  const initialDefects = scenario.initialDefects;

  // Count how many relevant edits have been placed in the defect region
  let correctedDefects = 0;

  if (scenario.id === "dura_inclusion") {
    // Corrected by erasing brainmask in the defect zone
    const erasedInDefect = voxelEdits.filter(
      (e) =>
        e.layer === "brainmask" &&
        e.newValue === 0 &&
        e.x >= min.x &&
        e.x <= max.x &&
        e.y >= min.y &&
        e.y <= max.y &&
        e.z >= min.z &&
        e.z <= max.z
    ).length;
    correctedDefects = Math.min(initialDefects, erasedInDefect);
  } else if (scenario.id === "wm_hypointensity") {
    // Corrected by placing control points OR painting wm in the defect zone
    const cpsInDefect = controlPoints.filter(
      (cp) =>
        cp.x >= min.x - 3 &&
        cp.x <= max.x + 3 &&
        cp.y >= min.y - 3 &&
        cp.y <= max.y + 3 &&
        cp.z >= min.z - 3 &&
        cp.z <= max.z + 3
    ).length;

    const paintedWm = voxelEdits.filter(
      (e) =>
        e.layer === "wm" &&
        e.newValue === 1 &&
        e.x >= min.x &&
        e.x <= max.x &&
        e.y >= min.y &&
        e.y <= max.y &&
        e.z >= min.z &&
        e.z <= max.z
    ).length;

    correctedDefects = Math.min(initialDefects, cpsInDefect * 18 + paintedWm);
  } else if (scenario.id === "skull_strip_erosion") {
    // Corrected by painting brainmask back in the defect zone
    const paintedMask = voxelEdits.filter(
      (e) =>
        e.layer === "brainmask" &&
        e.newValue === 1 &&
        e.x >= min.x &&
        e.x <= max.x &&
        e.y >= min.y &&
        e.y <= max.y &&
        e.z >= min.z &&
        e.z <= max.z
    ).length;
    correctedDefects = Math.min(initialDefects, paintedMask);
  } else if (scenario.id === "topological_handle") {
    // Corrected by erasing white matter bridge in the defect zone
    const cutBridge = voxelEdits.filter(
      (e) =>
        (e.layer === "wm" || e.layer === "brainmask") &&
        e.newValue === 0 &&
        e.x >= min.x &&
        e.x <= max.x &&
        e.y >= min.y &&
        e.y <= max.y &&
        e.z >= min.z &&
        e.z <= max.z
    ).length;
    correctedDefects = Math.min(initialDefects, cutBridge * 2);
  } else {
    // Sandbox
    correctedDefects = initialDefects;
  }

  const remainingDefects = Math.max(0, initialDefects - correctedDefects);
  const completionRatio =
    initialDefects > 0
      ? (initialDefects - remainingDefects) / initialDefects
      : 1.0;

  // Compute live Euler Characteristic χ
  // S2 sphere = 2; genus g handle: χ = 2 - 2g
  let liveEuler = scenario.initialEuler;
  if (completionRatio >= 0.85) {
    liveEuler = scenario.targetEuler;
  } else if (completionRatio > 0.4) {
    liveEuler = Math.round(
      scenario.initialEuler +
        (scenario.targetEuler - scenario.initialEuler) * 0.5
    );
  }

  // Compute live Dice Similarity
  const baseDice = scenario.id === "sandbox" ? 0.98 : 0.88;
  const liveDice = roundToDecimals(
    baseDice + (scenario.targetDice - baseDice) * completionRatio,
    3
  );

  // Compute Mean Cortical Thickness (mm)
  let thickness = 2.45;
  if (scenario.id === "dura_inclusion") {
    // Inflated by dura until fixed
    thickness = roundToDecimals(3.82 - 1.37 * completionRatio, 2);
  } else if (scenario.id === "skull_strip_erosion") {
    // Truncated until restored
    thickness = roundToDecimals(1.65 + 0.8 * completionRatio, 2);
  }

  const isResolved =
    remainingDefects <= 2 &&
    liveDice >= scenario.targetDice &&
    liveEuler === scenario.targetEuler;
  const accuracyScore = Math.round(completionRatio * 100);

  return {
    eulerCharacteristic: liveEuler,
    defectCount: remainingDefects,
    diceScore: liveDice,
    meanCorticalThicknessMm: thickness,
    controlPointCount: controlPoints.length,
    voxelEditsCount: voxelEdits.length,
    isResolved,
    accuracyScore,
  };
}
