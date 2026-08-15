import { describe, it, expect } from "vitest";
import {
  generateRoguelikeCampaign,
  generateTSPRoom,
  generateFaceForgeRoom,
  generateBlinkBrowseRoom,
  generateBillableHoursRoom,
  calculateFOV,
  hasLineOfSight,
  computeShortestTour,
  updateTSPMovingWalls,
  createFaceForgeBoss,
  updateFaceForgeBoss,
  rotate3D,
  project3DTo2D,
  fireWeapon,
  DEFAULT_WEAPONS,
  updateEnemyAI,
} from "@/lib/dungeon";

describe("Roguelike Dungeon Generator & Rooms", () => {
  it("should generate the full campaign with 4 distinct themed rooms", () => {
    const rooms = generateRoguelikeCampaign();
    expect(rooms).toHaveLength(4);
    expect(rooms.map((r) => r.id)).toEqual([
      "tsp",
      "faceforge",
      "blinkbrowse",
      "billable_hours",
    ]);
  });

  it("should generate Room 1 (TSP) with valid dimensions, nodes, and moving walls", () => {
    const tspRoom = generateTSPRoom();
    expect(tspRoom.id).toBe("tsp");
    expect(tspRoom.width).toBe(15);
    expect(tspRoom.height).toBe(9);
    expect(tspRoom.startX).toBe(1);
    expect(tspRoom.startY).toBe(1);
    expect(tspRoom.exitX).toBe(13);
    expect(tspRoom.exitY).toBe(7);
    expect(tspRoom.tspNodes?.length).toBeGreaterThanOrEqual(4);
    expect(tspRoom.tspMovingWalls?.length).toBeGreaterThanOrEqual(3);
    expect(tspRoom.enemies.length).toBeGreaterThan(0);
  });

  it("should generate Room 2 (FaceForge 3D) with boss initialized", () => {
    const bossRoom = generateFaceForgeRoom();
    expect(bossRoom.id).toBe("faceforge");
    expect(bossRoom.boss).toBeDefined();
    expect(bossRoom.boss?.name).toContain("faceforge_3d");
    expect(bossRoom.boss?.hp).toBe(300);
    expect(bossRoom.boss?.mesh.vertices.length).toBeGreaterThan(10);
  });

  it("should generate Room 3 (BlinkBrowse) with gaze tracker enemies and items", () => {
    const blinkRoom = generateBlinkBrowseRoom();
    expect(blinkRoom.id).toBe("blinkbrowse");
    expect(blinkRoom.enemies.some((e) => e.type === "slime" || e.type === "drone")).toBe(true);
    expect(blinkRoom.items.length).toBeGreaterThan(0);
  });

  it("should generate Room 4 (Billable Hours) with treasure chests", () => {
    const billableRoom = generateBillableHoursRoom();
    expect(billableRoom.id).toBe("billable_hours");
    expect(billableRoom.items.some((i) => i.itemId === "commit_token")).toBe(true);
  });
});

describe("Field-of-View & Line of Sight Engine", () => {
  const sampleGrid = [
    ["#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", "#"],
    ["#", " ", "#", " ", "#"],
    ["#", " ", " ", " ", "#"],
    ["#", "#", "#", "#", "#"],
  ];

  it("computes field of view centered at player and marks explored tiles", () => {
    const { visible, explored } = calculateFOV(sampleGrid, 1, 1, 3);
    expect(visible[1][1]).toBe(true);
    expect(explored[1][1]).toBe(true);
    expect(visible[0][0]).toBe(true); // adjacent wall
  });

  it("correctly identifies unobstructed line of sight", () => {
    expect(hasLineOfSight(sampleGrid, 1, 1, 1, 3)).toBe(true);
    expect(hasLineOfSight(sampleGrid, 1, 1, 3, 3)).toBe(false); // blocked by wall at (2,2)
  });
});

describe("TSP Dynamic Moving Walls & Path Recalculation", () => {
  it("calculates shortest TSP tour through landmark nodes", () => {
    const nodes = [
      { id: 1, x: 2, y: 1, visited: false },
      { id: 2, x: 4, y: 1, visited: false },
    ];
    const { tour, totalDistance } = computeShortestTour(1, 1, nodes, 5, 1);
    expect(tour.length).toBe(4); // Start -> Node1 -> Node2 -> Exit
    expect(totalDistance).toBeCloseTo(4, 1);
  });

  it("updates moving walls and stamps 'W' onto grid correctly", () => {
    const grid = [
      ["#", "#", "#", "#", "#"],
      ["#", " ", " ", " ", "#"],
      ["#", " ", " ", " ", "#"],
      ["#", " ", " ", " ", "#"],
      ["#", "#", "#", "#", "#"],
    ];
    const walls = [{ x: 2, y: 2, baseX: 2, baseY: 2, active: true }];

    const { updatedGrid, updatedWalls } = updateTSPMovingWalls(grid, walls, 1);
    expect(updatedWalls[0].x).toBe(2);
    expect(updatedGrid[updatedWalls[0].y][updatedWalls[0].x]).toBe("W");
  });
});

describe("FaceForge 3D Boss & Wireframe Projection Engine", () => {
  it("rotates and projects 3D vertices to 2D screen coords deterministically", () => {
    const v = { x: 1, y: 0, z: 0 };
    const rotated = rotate3D(v, { x: 0, y: Math.PI / 2, z: 0 });
    expect(rotated.x).toBeCloseTo(0, 4);
    expect(rotated.z).toBeCloseTo(-1, 4);

    const projected = project3DTo2D(rotated, 100, 100, 20, 4);
    expect(projected.x).toBeCloseTo(100, 1);
    expect(projected.y).toBeCloseTo(100, 1);
  });

  it("progresses boss phases and spawns projectiles as HP decreases", () => {
    const boss = createFaceForgeBoss(7, 4);
    expect(boss.phase).toBe(1);

    // Phase 1 update
    const { updatedBoss } = updateFaceForgeBoss(boss, 1, 1, 2000, 15, 9);
    expect(updatedBoss.projectiles.length).toBeGreaterThan(0);

    // Damage to phase 2
    const phase2Boss = { ...boss, hp: 150 };
    const res2 = updateFaceForgeBoss(phase2Boss, 1, 1, 4000, 15, 9);
    expect(res2.updatedBoss.phase).toBe(2);

    // Damage to phase 3
    const phase3Boss = { ...boss, hp: 50 };
    const res3 = updateFaceForgeBoss(phase3Boss, 1, 1, 6000, 15, 9);
    expect(res3.updatedBoss.phase).toBe(3);
  });
});

describe("Developer Weapons & Humorous Side Effects", () => {
  it("executes npm install with AoE damage and lag spike side effect", () => {
    const enemies = [
      {
        id: "e1",
        type: "zombie" as const,
        name: "Zombie",
        x: 2,
        y: 1,
        hp: 30,
        maxHp: 30,
        state: "patrol" as const,
        patrolDir: "right" as const,
        symbol: "Z",
        color: "#f59e0b",
      },
    ];

    const res = fireWeapon(
      "npm_install",
      DEFAULT_WEAPONS,
      1,
      1,
      100,
      100,
      enemies,
      undefined,
      1000
    );

    expect(res.success).toBe(true);
    expect(res.activeSideEffect?.type).toBe("lag_spike");
    expect(res.activeSideEffect?.title).toContain("DEPENDENCY_BLOAT");
    expect(res.updatedEnemies).toHaveLength(0); // Defeated by AoE
    expect(res.particles.length).toBeGreaterThan(0);
  });

  it("executes git push --force and wipes room history", () => {
    const enemies = [
      {
        id: "e1",
        type: "drone" as const,
        name: "Drone",
        x: 10,
        y: 5,
        hp: 50,
        maxHp: 50,
        state: "patrol" as const,
        patrolDir: "left" as const,
        symbol: "D",
        color: "#ef4444",
      },
    ];

    const res = fireWeapon(
      "git_force_push",
      DEFAULT_WEAPONS,
      1,
      1,
      100,
      100,
      enemies,
      undefined,
      1000
    );

    expect(res.success).toBe(true);
    expect(res.activeSideEffect?.type).toBe("history_rewritten");
    expect(res.updatedEnemies).toHaveLength(0);
    expect(res.updatedWeapons.git_force_push.ammo).toBe(DEFAULT_WEAPONS.git_force_push.ammo - 1);
  });

  it("executes Stack Overflow Copy-Paste, heals HP, and triggers keybind scramble", () => {
    const res = fireWeapon(
      "stack_overflow",
      DEFAULT_WEAPONS,
      1,
      1,
      40,
      100,
      [],
      undefined,
      1000
    );

    expect(res.success).toBe(true);
    expect(res.updatedPlayerHp).toBe(80);
    expect(res.activeSideEffect?.type).toBe("scrambled_keys");
    expect(res.activeSideEffect?.description).toContain("inverted");
  });
});

describe("Enemy AI State Machine", () => {
  const grid = [
    ["#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", "#"],
    ["#", " ", " ", " ", "#"],
    ["#", "#", "#", "#", "#"],
  ];

  it("patrols within bounds and turns around on edge", () => {
    const enemies = [
      {
        id: "e1",
        type: "drone" as const,
        name: "Drone",
        x: 3,
        y: 1,
        hp: 50,
        maxHp: 50,
        state: "patrol" as const,
        patrolDir: "right" as const,
        minX: 1,
        maxX: 3,
        symbol: "D",
        color: "#ef4444",
      },
    ];

    const { updatedEnemies } = updateEnemyAI(enemies, grid, 1, 2, 100);
    expect(updatedEnemies[0].patrolDir).toBe("left");
    expect(updatedEnemies[0].x).toBe(2);
  });

  it("transitions to chase state for zombies when player is in line of sight within range", () => {
    const enemies = [
      {
        id: "z1",
        type: "zombie" as const,
        name: "Zombie",
        x: 3,
        y: 1,
        hp: 50,
        maxHp: 50,
        state: "patrol" as const,
        patrolDir: "left" as const,
        minX: 1,
        maxX: 3,
        symbol: "Z",
        color: "#f59e0b",
      },
    ];

    const { updatedEnemies } = updateEnemyAI(enemies, grid, 2, 1, 100);
    expect(updatedEnemies[0].state).toBe("chase");
  });
});
