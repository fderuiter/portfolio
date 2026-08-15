/**
 * NeuroRecon: FreeSurfer Pipeline Simulator & QA Studio
 * Core Type Definitions & Neuroimaging Data Structures
 */

export interface VoxelCoord {
  x: number;
  y: number;
  z: number;
}

export interface ControlPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  intensity: number;
  label?: string;
  timestamp: number;
}

export interface VoxelEdit {
  x: number;
  y: number;
  z: number;
  originalValue: number;
  newValue: number;
  layer: "brainmask" | "wm";
}

export type SlicePlane = "axial" | "coronal" | "sagittal";

export type SurfaceMode = "pial" | "white" | "inflated" | "aseg";

export type ToolMode = "inspect" | "control_point" | "paint" | "erase";

export type ScenarioId =
  | "dura_inclusion"
  | "wm_hypointensity"
  | "skull_strip_erosion"
  | "topological_handle"
  | "sandbox";

export type DatasetSource = "case_study" | "mni152" | "oasis";

export interface DatasetConfig {
  id: DatasetSource;
  name: string;
  subtitle: string;
  sourceRepo: string;
  modelUrl?: string;
  isRealHumanScan: boolean;
}

export interface ScenarioLore {
  biologicalCause: string;
  algorithmicImpact: string;
  remediationProtocol: string;
  freeSurferCommand: string;
}

export interface ScenarioConfig {
  id: ScenarioId;
  title: string;
  subtitle: string;
  badge: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Sandbox";
  targetPlane: SlicePlane;
  targetCoords: VoxelCoord;
  defectDescription: string;
  lore: ScenarioLore;
  initialEuler: number;
  targetEuler: number;
  initialDefects: number;
  targetDice: number;
  recommendedTool: ToolMode;
  successMessage: string;
}

export interface QAMetrics {
  eulerCharacteristic: number;
  defectCount: number;
  diceScore: number;
  meanCorticalThicknessMm: number;
  controlPointCount: number;
  voxelEditsCount: number;
  isResolved: boolean;
  accuracyScore: number;
}

export interface ScoreState {
  score: number;
  multiplier: number;
  streak: number;
  resolvedScenarios: ScenarioId[];
}

export interface TerminalLog {
  id: string;
  type: "command" | "output" | "error" | "info" | "success";
  text: string;
  timestamp: string;
}

export interface VolumeDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface TissueSegmentLabels {
  BACKGROUND: 0;
  CSF: 1;
  GRAY_MATTER: 2;
  WHITE_MATTER: 3;
  SUBCORTICAL: 4;
  DURA: 5;
  SKULL: 6;
}

export const TISSUE_LABELS: TissueSegmentLabels = {
  BACKGROUND: 0,
  CSF: 1,
  GRAY_MATTER: 2,
  WHITE_MATTER: 3,
  SUBCORTICAL: 4,
  DURA: 5,
  SKULL: 6,
};
