/**
 * Enemy AI State Machine & Collision Handling
 */

import { hasLineOfSight } from "./fov";
import { Enemy } from "./types";

export interface AIUpdateResult {
  updatedEnemies: Enemy[];
  damageToPlayer: number;
  caughtPlayer: boolean;
}

/**
 * Updates AI states (patrol, chase, stunned) and positions for all active enemies.
 */
export function updateEnemyAI(
  enemies: Enemy[],
  grid: string[][],
  playerX: number,
  playerY: number,
  deltaMs: number
): AIUpdateResult {
  let damageToPlayer = 0;
  let caughtPlayer = false;

  const updatedEnemies = enemies.map((enemy) => {
    // 1. Handle Stun State
    if (enemy.state === "stunned") {
      const remainingStun = (enemy.stunTimerMs || 0) - deltaMs;
      if (remainingStun <= 0) {
        return {
          ...enemy,
          state: "patrol" as const,
          stunTimerMs: 0,
        };
      }
      return {
        ...enemy,
        stunTimerMs: remainingStun,
      };
    }

    const distToPlayer = Math.hypot(enemy.x - playerX, enemy.y - playerY);
    const los = hasLineOfSight(grid, enemy.x, enemy.y, playerX, playerY);

    // 2. State Transition: Zombies/slimes chase if within range & LOS. Drones maintain patrol track unless close-range alert.
    let state = enemy.state;
    if (enemy.type === "zombie" || enemy.type === "slime") {
      if (distToPlayer <= 5 && los) {
        state = "chase";
      } else if (distToPlayer > 6) {
        state = "patrol";
      }
    }

    let nextX = enemy.x;
    let nextY = enemy.y;
    let nextDir = enemy.patrolDir;

    if (state === "chase") {
      // Chase movement: step closer to player along primary axis
      const dx = playerX - enemy.x;
      const dy = playerY - enemy.y;

      let stepX = 0;
      let stepY = 0;

      if (Math.abs(dx) >= Math.abs(dy)) {
        stepX = dx > 0 ? 1 : -1;
      } else {
        stepY = dy > 0 ? 1 : -1;
      }

      const candidateX = enemy.x + stepX;
      const candidateY = enemy.y + stepY;

      if (
        candidateY >= 0 &&
        candidateY < grid.length &&
        candidateX >= 0 &&
        candidateX < grid[0].length &&
        grid[candidateY][candidateX] !== "#" &&
        grid[candidateY][candidateX] !== "W"
      ) {
        nextX = candidateX;
        nextY = candidateY;
      }
    } else {
      // Patrol movement along axis
      if (enemy.patrolDir === "right") {
        if (enemy.maxX !== undefined && nextX >= enemy.maxX) {
          nextDir = "left";
          nextX -= 1;
        } else {
          nextX += 1;
        }
      } else if (enemy.patrolDir === "left") {
        if (enemy.minX !== undefined && nextX <= enemy.minX) {
          nextDir = "right";
          nextX += 1;
        } else {
          nextX -= 1;
        }
      } else if (enemy.patrolDir === "down") {
        if (enemy.maxY !== undefined && nextY >= enemy.maxY) {
          nextDir = "up";
          nextY -= 1;
        } else {
          nextY += 1;
        }
      } else if (enemy.patrolDir === "up") {
        if (enemy.minY !== undefined && nextY <= enemy.minY) {
          nextDir = "down";
          nextY += 1;
        } else {
          nextY += 1;
        }
      }
    }

    // Check collision with player
    if (nextX === playerX && nextY === playerY) {
      caughtPlayer = true;
      damageToPlayer += 25;
    }

    return {
      ...enemy,
      x: nextX,
      y: nextY,
      state,
      patrolDir: nextDir,
    };
  });

  return {
    updatedEnemies,
    damageToPlayer,
    caughtPlayer,
  };
}
