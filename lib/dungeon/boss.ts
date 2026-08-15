/**
 * FaceForge 3D Boss Engine & 3D Wireframe Projection System
 */

import { BossState, MeshProjectile, Vec3, WireframeMesh } from "./types";

/**
 * Creates the low-polygon wireframe 3D face mesh.
 */
export function createFaceMesh(): WireframeMesh {
  // Low-poly 3D facial mask vertices (normalized -1 to 1)
  const vertices: Vec3[] = [
    // Forehead / Crown
    { x: -0.6, y: -0.9, z: 0.2 },
    { x: 0.0, y: -1.0, z: 0.4 },
    { x: 0.6, y: -0.9, z: 0.2 },
    // Eyebrows / Temples
    { x: -0.8, y: -0.4, z: 0.0 },
    { x: -0.3, y: -0.5, z: 0.5 },
    { x: 0.3, y: -0.5, z: 0.5 },
    { x: 0.8, y: -0.4, z: 0.0 },
    // Eyes
    { x: -0.4, y: -0.2, z: 0.4 },
    { x: 0.4, y: -0.2, z: 0.4 },
    // Nose bridge & tip
    { x: 0.0, y: -0.2, z: 0.7 },
    { x: 0.0, y: 0.2, z: 0.9 },
    // Cheeks
    { x: -0.7, y: 0.1, z: 0.1 },
    { x: 0.7, y: 0.1, z: 0.1 },
    // Mouth
    { x: -0.4, y: 0.5, z: 0.4 },
    { x: 0.0, y: 0.5, z: 0.5 },
    { x: 0.4, y: 0.5, z: 0.4 },
    // Jaw & Chin
    { x: -0.5, y: 0.8, z: 0.1 },
    { x: 0.0, y: 0.9, z: 0.4 },
    { x: 0.5, y: 0.8, z: 0.1 },
  ];

  // Wireframe edges linking facial landmarks
  const edges = [
    { p1: 0, p2: 1 }, { p1: 1, p2: 2 },
    { p1: 0, p2: 3 }, { p1: 1, p2: 4 }, { p1: 1, p2: 5 }, { p1: 2, p2: 6 },
    { p1: 3, p2: 4 }, { p1: 4, p2: 5 }, { p1: 5, p2: 6 },
    { p1: 4, p2: 7 }, { p1: 5, p2: 8 },
    { p1: 4, p2: 9 }, { p1: 5, p2: 9 }, { p1: 9, p2: 10 },
    { p1: 3, p2: 11 }, { p1: 6, p2: 12 },
    { p1: 7, p2: 11 }, { p1: 8, p2: 12 },
    { p1: 10, p2: 14 }, { p1: 11, p2: 13 }, { p1: 12, p2: 15 },
    { p1: 13, p2: 14 }, { p1: 14, p2: 15 },
    { p1: 13, p2: 16 }, { p1: 14, p2: 17 }, { p1: 15, p2: 18 },
    { p1: 16, p2: 17 }, { p1: 17, p2: 18 },
  ];

  return {
    vertices,
    edges,
    rotation: { x: 0, y: 0, z: 0 },
    rotSpeed: { x: 0.015, y: 0.025, z: 0.008 },
    color: "#ec4899",
    scale: 24,
  };
}

/**
 * Creates untextured 3D cube mesh for projectiles.
 */
export function createCubeMesh(color: string = "#f43f5e", scale: number = 8): WireframeMesh {
  const vertices: Vec3[] = [
    { x: -1, y: -1, z: -1 },
    { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
  ];

  const edges = [
    { p1: 0, p2: 1 }, { p1: 1, p2: 2 }, { p1: 2, p2: 3 }, { p1: 3, p2: 0 },
    { p1: 4, p2: 5 }, { p1: 5, p2: 6 }, { p1: 6, p2: 7 }, { p1: 7, p2: 4 },
    { p1: 0, p2: 4 }, { p1: 1, p2: 5 }, { p1: 2, p2: 6 }, { p1: 3, p2: 7 },
  ];

  return {
    vertices,
    edges,
    rotation: { x: 0, y: 0, z: 0 },
    rotSpeed: { x: 0.05, y: 0.08, z: 0.03 },
    color,
    scale,
  };
}

/**
 * Creates untextured 3D tetrahedron/pyramid mesh for phase 3 projectiles.
 */
export function createTetrahedronMesh(color: string = "#a855f7", scale: number = 7): WireframeMesh {
  const vertices: Vec3[] = [
    { x: 0, y: -1, z: 0 },
    { x: -1, y: 1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: 0, y: 1, z: 1 },
  ];

  const edges = [
    { p1: 0, p2: 1 }, { p1: 0, p2: 2 }, { p1: 0, p2: 3 },
    { p1: 1, p2: 2 }, { p1: 2, p2: 3 }, { p1: 3, p2: 1 },
  ];

  return {
    vertices,
    edges,
    rotation: { x: 0, y: 0, z: 0 },
    rotSpeed: { x: 0.08, y: 0.12, z: 0.06 },
    color,
    scale,
  };
}

/**
 * Rotates a 3D vertex around X, Y, and Z axes.
 */
export function rotate3D(v: Vec3, rot: Vec3): Vec3 {
  // Rotate around X
  const radX = rot.x;
  const y1 = v.y * Math.cos(radX) - v.z * Math.sin(radX);
  const z1 = v.y * Math.sin(radX) + v.z * Math.cos(radX);

  // Rotate around Y
  const radY = rot.y;
  const x2 = v.x * Math.cos(radY) + z1 * Math.sin(radY);
  const z2 = -v.x * Math.sin(radY) + z1 * Math.cos(radY);

  // Rotate around Z
  const radZ = rot.z;
  const x3 = x2 * Math.cos(radZ) - y1 * Math.sin(radZ);
  const y3 = x2 * Math.sin(radZ) + y1 * Math.cos(radZ);

  return { x: x3, y: y3, z: z2 };
}

/**
 * Projects a 3D rotated vertex onto a 2D screen coordinate.
 */
export function project3DTo2D(
  v: Vec3,
  screenCenterX: number,
  screenCenterY: number,
  scale: number,
  cameraDistance: number = 3.5
): { x: number; y: number; z: number } {
  const z = v.z + cameraDistance;
  const factor = z > 0 ? (cameraDistance / z) * scale : scale;
  return {
    x: screenCenterX + v.x * factor,
    y: screenCenterY + v.y * factor,
    z,
  };
}

/**
 * Renders a wireframe 3D mesh onto a 2D canvas context.
 */
export function renderWireframeMesh(
  ctx: CanvasRenderingContext2D,
  mesh: WireframeMesh,
  centerX: number,
  centerY: number,
  glow: boolean = true
): void {
  const rotated = mesh.vertices.map((v) => rotate3D(v, mesh.rotation));
  const projected = rotated.map((v) =>
    project3DTo2D(v, centerX, centerY, mesh.scale)
  );

  ctx.save();
  ctx.strokeStyle = mesh.color;
  ctx.lineWidth = 1.2;

  if (glow) {
    ctx.shadowColor = mesh.color;
    ctx.shadowBlur = 6;
  }

  mesh.edges.forEach((edge) => {
    const p1 = projected[edge.p1];
    const p2 = projected[edge.p2];
    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // Render glowing vertex nodes
  ctx.fillStyle = mesh.color;
  projected.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Initializes the FaceForge 3D Boss State.
 */
export function createFaceForgeBoss(gridX: number, gridY: number): BossState {
  return {
    name: "faceforge_3d :: Untranslated Vertex Daemon",
    hp: 300,
    maxHp: 300,
    phase: 1,
    x: gridX,
    y: gridY,
    mesh: createFaceMesh(),
    projectiles: [],
    lastSalvoTime: 0,
    attackIntervalMs: 1600,
    defeated: false,
  };
}

/**
 * Updates boss animations, attack patterns, and projectile trajectories.
 */
export function updateFaceForgeBoss(
  boss: BossState,
  playerX: number,
  playerY: number,
  nowMs: number,
  gridWidth: number,
  gridHeight: number
): {
  updatedBoss: BossState;
  spawnedDamage: number;
} {
  if (boss.defeated) return { updatedBoss: boss, spawnedDamage: 0 };

  // 1. Advance mesh rotations
  const nextMesh: WireframeMesh = {
    ...boss.mesh,
    rotation: {
      x: boss.mesh.rotation.x + boss.mesh.rotSpeed.x,
      y: boss.mesh.rotation.y + boss.mesh.rotSpeed.y,
      z: boss.mesh.rotation.z + boss.mesh.rotSpeed.z,
    },
  };

  // 2. Determine phase
  const hpRatio = boss.hp / boss.maxHp;
  let phase: 1 | 2 | 3 = 1;
  let attackIntervalMs = 1800;

  if (hpRatio <= 0.34) {
    phase = 3;
    attackIntervalMs = 900;
    nextMesh.color = "#ef4444"; // Aggressive red
  } else if (hpRatio <= 0.67) {
    phase = 2;
    attackIntervalMs = 1300;
    nextMesh.color = "#f59e0b"; // Warning amber
  } else {
    phase = 1;
    attackIntervalMs = 1700;
    nextMesh.color = "#ec4899"; // Cyber pink
  }

  const newProjectiles = [...boss.projectiles];

  // 3. Boss firing logic
  if (nowMs - boss.lastSalvoTime >= attackIntervalMs) {
    if (phase === 1) {
      // Salvo: 2-3 spinning cubes aimed at player
      const angle = Math.atan2(playerY - boss.y, playerX - boss.x);
      const speed = 0.08;
      newProjectiles.push({
        id: `mesh-cube-${nowMs}-1`,
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        mesh: createCubeMesh("#f43f5e", 7),
        damage: 15,
        alive: true,
      });
    } else if (phase === 2) {
      // Phase 2: Spread of 3 untextured meshes
      const baseAngle = Math.atan2(playerY - boss.y, playerX - boss.x);
      const spreadAngles = [baseAngle - 0.25, baseAngle, baseAngle + 0.25];
      const speed = 0.11;

      spreadAngles.forEach((ang, idx) => {
        newProjectiles.push({
          id: `mesh-shard-${nowMs}-${idx}`,
          x: boss.x,
          y: boss.y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          mesh: createCubeMesh("#f59e0b", 6),
          damage: 18,
          alive: true,
        });
      });
    } else {
      // Phase 3: Radial 6-way untextured tetrahedron blast
      const numRays = 6;
      const speed = 0.12;
      for (let i = 0; i < numRays; i++) {
        const ang = (i * 2 * Math.PI) / numRays + ((nowMs / 500) % Math.PI);
        newProjectiles.push({
          id: `mesh-tetra-${nowMs}-${i}`,
          x: boss.x,
          y: boss.y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          mesh: createTetrahedronMesh("#a855f7", 8),
          damage: 22,
          alive: true,
        });
      }
    }
  }

  // 4. Advance projectiles & test player collision
  let damageDealtToPlayer = 0;
  const liveProjectiles: MeshProjectile[] = [];

  newProjectiles.forEach((p) => {
    if (!p.alive) return;

    const nextX = p.x + p.vx;
    const nextY = p.y + p.vy;

    // Check bounds
    if (nextX < 0 || nextX >= gridWidth || nextY < 0 || nextY >= gridHeight) {
      return;
    }

    // Check collision with player (hitbox radius approx 0.8 grid units)
    const distToPlayer = Math.hypot(nextX - playerX, nextY - playerY);
    if (distToPlayer < 0.75) {
      damageDealtToPlayer += p.damage;
      return; // Projectile explodes on player
    }

    // Advance mesh rotation
    const pRotMesh: WireframeMesh = {
      ...p.mesh,
      rotation: {
        x: p.mesh.rotation.x + p.mesh.rotSpeed.x,
        y: p.mesh.rotation.y + p.mesh.rotSpeed.y,
        z: p.mesh.rotation.z + p.mesh.rotSpeed.z,
      },
    };

    liveProjectiles.push({
      ...p,
      x: nextX,
      y: nextY,
      mesh: pRotMesh,
    });
  });

  const updatedBoss: BossState = {
    ...boss,
    phase,
    mesh: nextMesh,
    attackIntervalMs,
    projectiles: liveProjectiles,
    lastSalvoTime: nowMs - boss.lastSalvoTime >= attackIntervalMs ? nowMs : boss.lastSalvoTime,
  };

  return { updatedBoss, spawnedDamage: damageDealtToPlayer };
}
