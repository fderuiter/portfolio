/**
 * Types & Domain Models for the Roguelike Repository Graveyard Crawler
 */

export type TileType = "#" | " " | "E" | "D" | "T" | "B" | "S" | "W" | "@";

export type RoomThemeId =
  | "classic_1"
  | "classic_2"
  | "tsp"
  | "faceforge"
  | "blinkbrowse"
  | "billable_hours";

export interface ThemedRoomMeta {
  id: RoomThemeId;
  name: string;
  repo: string;
  description: string;
  mechanic: string;
  badge: string;
  boss?: boolean;
}

export type WeaponId = "npm_install" | "git_force_push" | "stack_overflow" | "emp_blast";

export interface Weapon {
  id: WeaponId;
  name: string;
  keyLabel: string;
  ammo: number;
  maxAmmo: number;
  damage: number;
  cooldownMs: number;
  description: string;
  sideEffect: string;
  iconChar: string;
}

export type ItemId =
  | "coffee"
  | "node_modules"
  | "todo_shield"
  | "commit_token"
  | "hotfix_key"
  | "git_stash";

export interface ItemPickup {
  id: string;
  itemId: ItemId;
  name: string;
  x: number;
  y: number;
  symbol: string;
  color: string;
  collected: boolean;
}

export type EnemyType = "zombie" | "drone" | "slime" | "boss_face" | "mesh_projectile";

export type EnemyState = "patrol" | "chase" | "attack" | "stunned";

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  state: EnemyState;
  patrolDir: "left" | "right" | "up" | "down";
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  stunTimerMs?: number;
  symbol: string;
  color: string;
  name: string;
  lastAttackMs?: number;
  speedMs?: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Edge3D {
  p1: number;
  p2: number;
}

export interface WireframeMesh {
  vertices: Vec3[];
  edges: Edge3D[];
  rotation: Vec3;
  rotSpeed: Vec3;
  color: string;
  scale: number;
}

export interface BossState {
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  x: number; // grid coords
  y: number;
  mesh: WireframeMesh;
  projectiles: MeshProjectile[];
  lastSalvoTime: number;
  attackIntervalMs: number;
  defeated: boolean;
  name: string;
}

export interface MeshProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mesh: WireframeMesh;
  damage: number;
  alive: boolean;
}

export interface ActiveSideEffect {
  type: "lag_spike" | "scrambled_keys" | "history_rewritten" | "cursor_drift";
  title: string;
  description: string;
  expiresAt: number;
}

export interface TSPNode {
  id: number;
  x: number;
  y: number;
  visited: boolean;
}

export interface TSPMovingWall {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  active: boolean;
}

export interface DungeonRoom {
  id: RoomThemeId;
  index: number;
  title: string;
  repo: string;
  mechanic: string;
  badge: string;
  width: number;
  height: number;
  grid: string[][];
  startX: number;
  startY: number;
  exitX: number;
  exitY: number;
  enemies: Enemy[];
  items: ItemPickup[];
  boss?: BossState;
  tspNodes?: TSPNode[];
  tspMovingWalls?: TSPMovingWall[];
  chestOpened?: boolean;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  radius: number;
  char?: string;
}

export interface FloatingNotification {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}
