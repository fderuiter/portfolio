import { BugTemplate, LaserType } from "./types";

export const BUG_TYPES: readonly BugTemplate[] = [
  { type: "memory-leak", label: "Memory Leak", color: "#f43f5e", points: 100, hp: 1, radius: 18 },
  { type: "hydration-error", label: "Hydration Mismatch", color: "#f59e0b", points: 150, hp: 2, radius: 22 },
  { type: "null-pointer", label: "Null Pointer", color: "#a855f7", points: 120, hp: 1, radius: 16 },
  { type: "segfault", label: "SegFault 11", color: "#ef4444", points: 250, hp: 3, radius: 26 },
  { type: "drop-db", label: "DROP TABLE", color: "#ec4899", points: 300, hp: 4, radius: 28 },
  { type: "alien", label: "404 Alien", color: "#06b6d4", points: 80, hp: 1, radius: 15 },
  { type: "iceberg", label: "Glacial Iceberg", color: "#38bdf8", points: 200, hp: 3, radius: 30 },
] as const;

export interface WeaponConfig {
  name: string;
  keyNumber: string;
  color: string;
  glowColor: string;
  fireIntervalMs: number;
  damage: number;
  rayHitRadiusExtra: number;
  description: string;
}

export const WEAPONS: Record<LaserType, WeaponConfig> = {
  "ice-cannon": {
    name: "Ice Cannon",
    keyNumber: "4",
    color: "#38bdf8",
    glowColor: "#0284c7",
    fireIntervalMs: 220,
    damage: 2.0,
    rayHitRadiusExtra: 0,
    description: "Launches heavy cryogenic blocks that crush and freeze targets",
  },
  "cyan-pulse": {
    name: "Cyan Pulse",
    keyNumber: "1",
    color: "#22d3ee",
    glowColor: "#06b6d4",
    fireIntervalMs: 140,
    damage: 1.0,
    rayHitRadiusExtra: 8,
    description: "Rapid single-target cyber pulse",
  },
  "emerald-beam": {
    name: "Emerald Plasma",
    keyNumber: "2",
    color: "#10b981",
    glowColor: "#34d399",
    fireIntervalMs: 80,
    damage: 0.75,
    rayHitRadiusExtra: 14,
    description: "Continuous wide beam piercing through dense target clusters",
  },
  "rainbow-chaos": {
    name: "Rainbow Chaos",
    keyNumber: "3",
    color: "#f43f5e",
    glowColor: "#ec4899",
    fireIntervalMs: 140,
    damage: 1.0,
    rayHitRadiusExtra: 10,
    description: "Multispectral prismatic overload beam",
  },
};

export const DEFAULT_CANVAS_WIDTH = 768;
export const DEFAULT_CANVAS_HEIGHT = 420;
export const ARCADE_GAME_DURATION_SECS = 45;
export const COMBO_TIMEOUT_MS = 1800;
export const MAX_MULTIPLIER = 5;
