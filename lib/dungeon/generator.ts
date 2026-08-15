/**
 * Procedural Dungeon & Themed Room Generator
 */

import { createFaceForgeBoss } from "./boss";
import { DungeonRoom, Enemy, ItemPickup, TSPMovingWall, TSPNode } from "./types";

export const STAGE_1_MAZE: string[][] = [
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "P", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
  ["#", "#", "#", " ", "#", " ", "#", "#", "#", "#", "#", " ", "#", " ", "#"],
  ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#", " ", "#"],
  ["#", " ", "#", "#", "#", "#", "#", "#", "#", " ", "#", " ", "#", " ", "#"],
  ["#", " ", "#", " ", " ", " ", " ", " ", "#", " ", "#", " ", "#", " ", "#"],
  ["#", " ", "#", " ", "#", "#", "#", " ", "#", " ", "#", " ", "#", " ", "#"],
  ["#", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#", "E", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
];

export const STAGE_2_MAZE: string[][] = [
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "P", " ", " ", " ", "#", " ", " ", " ", "#", " ", " ", " ", " ", "#"],
  ["#", " ", "#", "#", " ", "#", " ", "#", " ", "#", " ", "#", "#", " ", "#"],
  ["#", " ", "#", " ", " ", " ", " ", "#", " ", " ", " ", " ", "#", " ", "#"],
  ["#", " ", "#", " ", "#", "#", " ", "#", " ", "#", "#", " ", "#", " ", "#"],
  ["#", " ", " ", " ", "#", " ", " ", " ", " ", " ", "#", " ", " ", " ", "#"],
  ["#", "#", "#", " ", "#", " ", "#", "#", "#", " ", "#", " ", "#", "#", "#"],
  ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", "#", " ", " ", "E", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
];

/**
 * Creates Room 1: Traveling-Salesman-Problem
 */
export function generateTSPRoom(): DungeonRoom {
  const grid: string[][] = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", "#", " ", " ", " ", " ", "#", " ", " ", " ", " ", "#"],
    ["#", " ", "#", " ", "#", " ", "#", " ", " ", "#", " ", "#", "#", " ", "#"],
    ["#", " ", "#", " ", " ", " ", "#", " ", " ", " ", " ", " ", "#", " ", "#"],
    ["#", " ", "#", "#", " ", " ", "#", "#", "#", " ", " ", " ", "#", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#", " ", " ", " ", "#"],
    ["#", " ", "#", "#", "#", " ", "#", " ", "#", " ", "#", "#", "#", " ", "#"],
    ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", "E", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ];

  const tspNodes: TSPNode[] = [
    { id: 1, x: 3, y: 1, visited: false },
    { id: 2, x: 7, y: 2, visited: false },
    { id: 3, x: 10, y: 5, visited: false },
    { id: 4, x: 4, y: 7, visited: false },
  ];

  const tspMovingWalls: TSPMovingWall[] = [
    { x: 5, y: 3, baseX: 5, baseY: 3, active: true },
    { x: 9, y: 4, baseX: 9, baseY: 4, active: true },
    { x: 11, y: 6, baseX: 11, baseY: 6, active: true },
  ];

  const enemies: Enemy[] = [
    {
      id: "tsp-drone-1",
      type: "drone",
      name: "Shortest Path Sentinel",
      x: 7,
      y: 5,
      hp: 50,
      maxHp: 50,
      state: "patrol",
      patrolDir: "right",
      minX: 5,
      maxX: 9,
      symbol: "D",
      color: "#ef4444",
    },
    {
      id: "tsp-zombie-1",
      type: "zombie",
      name: "O(N!) Brute Force Zombie",
      x: 12,
      y: 3,
      hp: 40,
      maxHp: 40,
      state: "patrol",
      patrolDir: "down",
      minY: 1,
      maxY: 4,
      symbol: "Z",
      color: "#f59e0b",
    },
  ];

  const items: ItemPickup[] = [
    {
      id: "item-node-1",
      itemId: "node_modules",
      name: "node_modules Bundle (+4 Ammo)",
      x: 1,
      y: 5,
      symbol: "📦",
      color: "#f59e0b",
      collected: false,
    },
    {
      id: "item-coffee-1",
      itemId: "coffee",
      name: "Cold Brew (+20 HP)",
      x: 13,
      y: 1,
      symbol: "☕",
      color: "#38bdf8",
      collected: false,
    },
  ];

  return {
    id: "tsp",
    index: 1,
    title: "Traveling-Salesman-Problem",
    repo: "github.com/fderuiter/tsp-heuristic-v1",
    mechanic: "Dynamic walls shift every move. TSP route recalculates shortest path.",
    badge: "ROOM 01 :: DYNAMIC ROUTING",
    width: 15,
    height: 9,
    grid,
    startX: 1,
    startY: 1,
    exitX: 13,
    exitY: 7,
    enemies,
    items,
    tspNodes,
    tspMovingWalls,
  };
}

/**
 * Creates Room 2: faceforge_3d (Boss Fight)
 */
export function generateFaceForgeRoom(): DungeonRoom {
  const grid: string[][] = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", "#", "#", " ", " ", " ", " ", " ", " ", " ", "#", "#", " ", "#"],
    ["#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", "B", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#"],
    ["#", " ", "#", "#", " ", " ", " ", " ", " ", " ", " ", "#", "#", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "E", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ];

  const boss = createFaceForgeBoss(7, 4);

  const items: ItemPickup[] = [
    {
      id: "item-git-1",
      itemId: "git_stash",
      name: "git commit Ammo (+1 Force Push)",
      x: 1,
      y: 7,
      symbol: "💥",
      color: "#ef4444",
      collected: false,
    },
    {
      id: "item-shield-1",
      itemId: "todo_shield",
      name: "TODO: Fix Later (Shield)",
      x: 13,
      y: 1,
      symbol: "🛡️",
      color: "#10b981",
      collected: false,
    },
  ];

  return {
    id: "faceforge",
    index: 2,
    title: "faceforge_3d",
    repo: "github.com/fderuiter/faceforge-wireframe-abandoned",
    mechanic: "Boss Fight: Wireframe 3D face firing untextured mesh projectiles.",
    badge: "ROOM 02 :: BOSS ARENA",
    width: 15,
    height: 9,
    grid,
    startX: 1,
    startY: 1,
    exitX: 13,
    exitY: 7,
    enemies: [],
    items,
    boss,
  };
}

/**
 * Creates Room 3: BlinkBrowse (Eye-tracking / Cursor Steering)
 */
export function generateBlinkBrowseRoom(): DungeonRoom {
  const grid: string[][] = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", "#", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", "#"],
    ["#", " ", " ", "#", " ", "#", "#", "#", " ", "#", " ", "#", "#", " ", "#"],
    ["#", " ", " ", " ", " ", "#", " ", "#", " ", " ", " ", "#", " ", " ", "#"],
    ["#", "#", "#", " ", " ", "#", " ", "#", " ", " ", " ", "#", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#", " ", " ", "#"],
    ["#", " ", "#", "#", "#", " ", "#", " ", " ", "#", " ", "#", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", "E", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ];

  const enemies: Enemy[] = [
    {
      id: "blink-slime-1",
      type: "slime",
      name: "Gaze Tracker Drift Slime",
      x: 6,
      y: 3,
      hp: 60,
      maxHp: 60,
      state: "patrol",
      patrolDir: "left",
      minX: 4,
      maxX: 8,
      symbol: "S",
      color: "#38bdf8",
    },
    {
      id: "blink-drone-2",
      type: "drone",
      name: "Pupil Calibration Drone",
      x: 10,
      y: 5,
      hp: 55,
      maxHp: 55,
      state: "patrol",
      patrolDir: "right",
      minX: 9,
      maxX: 13,
      symbol: "D",
      color: "#a855f7",
    },
  ];

  const items: ItemPickup[] = [
    {
      id: "item-node-2",
      itemId: "node_modules",
      name: "node_modules Bundle (+4 Ammo)",
      x: 1,
      y: 6,
      symbol: "📦",
      color: "#f59e0b",
      collected: false,
    },
    {
      id: "item-coffee-2",
      itemId: "coffee",
      name: "Espresso (+25 HP)",
      x: 7,
      y: 1,
      symbol: "☕",
      color: "#38bdf8",
      collected: false,
    },
  ];

  return {
    id: "blinkbrowse",
    index: 3,
    title: "BlinkBrowse",
    repo: "github.com/fderuiter/blink-browse-webcam-nav",
    mechanic: "Eye-tracking drift: Character steers towards mouse cursor position!",
    badge: "ROOM 03 :: GAZE TRACKING",
    width: 15,
    height: 9,
    grid,
    startX: 1,
    startY: 1,
    exitX: 13,
    exitY: 7,
    enemies,
    items,
  };
}

/**
 * Creates Room 4: billable_hours_automation (Chest Room with Timesheet Modal)
 */
export function generateBillableHoursRoom(): DungeonRoom {
  const grid: string[][] = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", "#", "#", "#", " ", " ", "#", " ", " ", "#", "#", "#", " ", "#"],
    ["#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#"],
    ["#", " ", "#", " ", "T", " ", " ", " ", " ", " ", "T", " ", "#", " ", "#"],
    ["#", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#"],
    ["#", " ", "#", "#", "#", " ", " ", "#", " ", " ", "#", "#", "#", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ", "E", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ];

  const enemies: Enemy[] = [
    {
      id: "bill-drone-1",
      type: "drone",
      name: "Timesheet Audit Daemon",
      x: 7,
      y: 3,
      hp: 50,
      maxHp: 50,
      state: "patrol",
      patrolDir: "left",
      minX: 5,
      maxX: 9,
      symbol: "D",
      color: "#ef4444",
    },
  ];

  const items: ItemPickup[] = [
    {
      id: "item-commit-1",
      itemId: "commit_token",
      name: "Gold Commit Token (+500 Pts)",
      x: 4,
      y: 4,
      symbol: "💎",
      color: "#fbbf24",
      collected: false,
    },
    {
      id: "item-commit-2",
      itemId: "commit_token",
      name: "Gold Commit Token (+500 Pts)",
      x: 10,
      y: 4,
      symbol: "💎",
      color: "#fbbf24",
      collected: false,
    },
  ];

  return {
    id: "billable_hours",
    index: 4,
    title: "billable_hours_automation",
    repo: "github.com/fderuiter/billable-hours-crunch-bot",
    mechanic: "Opening treasure chests requires submitting a 0.25h admin work timesheet!",
    badge: "ROOM 04 :: ADMIN VAULT",
    width: 15,
    height: 9,
    grid,
    startX: 1,
    startY: 1,
    exitX: 13,
    exitY: 7,
    enemies,
    items,
    chestOpened: false,
  };
}

/**
 * Creates classic stage 1 baseline room.
 */
export function generateClassicStage1(): DungeonRoom {
  return {
    id: "classic_1",
    index: 1,
    title: "Subnet 01",
    repo: "system_labyrinth_subnet_01",
    mechanic: "Standard cybernetic navigation grid.",
    badge: "STAGE 01 :: SUBNET CORE",
    width: 15,
    height: 9,
    grid: STAGE_1_MAZE,
    startX: 1,
    startY: 1,
    exitX: 13,
    exitY: 7,
    enemies: [],
    items: [],
  };
}

/**
 * Creates classic stage 2 firewall room.
 */
export function generateClassicStage2(): DungeonRoom {
  return {
    id: "classic_2",
    index: 2,
    title: "Subnet 02 (Firewall)",
    repo: "system_labyrinth_subnet_02",
    mechanic: "Firewall perimeter with active security drones.",
    badge: "STAGE 02 :: FIREWALL PERIMETER",
    width: 15,
    height: 9,
    grid: STAGE_2_MAZE,
    startX: 1,
    startY: 1,
    exitX: 13,
    exitY: 7,
    enemies: [
      {
        id: "drone-stage-2",
        type: "drone",
        name: "Firewall Sentinel",
        x: 6,
        y: 5,
        hp: 50,
        maxHp: 50,
        state: "patrol",
        patrolDir: "right",
        minX: 5,
        maxX: 9,
        symbol: "D",
        color: "#ef4444",
      },
    ],
    items: [],
  };
}

/**
 * Creates the full roguelike campaign list of themed graveyard rooms.
 */
export function generateRoguelikeCampaign(): DungeonRoom[] {
  return [
    generateTSPRoom(),
    generateFaceForgeRoom(),
    generateBlinkBrowseRoom(),
    generateBillableHoursRoom(),
  ];
}
