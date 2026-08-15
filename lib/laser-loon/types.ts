export type LaserMode = "arcade" | "sandbox";

export type LaserType = "cyan-pulse" | "emerald-beam" | "rainbow-chaos" | "ice-cannon";

export type TargetBugType =
  | "memory-leak"
  | "hydration-error"
  | "null-pointer"
  | "segfault"
  | "drop-db"
  | "alien"
  | "iceberg";

export interface BugTemplate {
  type: TargetBugType;
  label: string;
  color: string;
  points: number;
  hp: number;
  radius: number;
}

export interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: TargetBugType;
  label: string;
  color: string;
  hp: number;
  maxHp: number;
  points: number;
  pulsePhase: number;
  frozenTimer: number; // >0 indicates target is frozen in ice
}

export interface IceBlock {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  hp: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: "circle" | "crystal";
  rotation?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface LoonPosition {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export interface LaserLoonState {
  mode: LaserMode;
  laserType: LaserType;
  gameState: "idle" | "playing" | "gameover";
  score: number;
  highScore: number;
  combo: number;
  multiplier: number;
  timeLeft: number;
  gravity: number;
  targets: Target[];
  iceBlocks: IceBlock[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  loonPos: LoonPosition;
  aimPos: { x: number; y: number };
  lastFireTime: number;
  lastComboTime: number;
  nextTargetId: number;
  nextIceId: number;
  nextTextId: number;
  shakeIntensity: number;
}
