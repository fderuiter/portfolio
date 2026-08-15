/**
 * Enemy AI State Machine, CVE Recognition & Collision Handling
 */

import { hasLineOfSight } from "./fov";
import { Enemy } from "./types";

export interface AIUpdateResult {
  updatedEnemies: Enemy[];
  damageToPlayer: number;
  caughtPlayer: boolean;
}

/**
 * Updates AI states (patrol, chase, stunned, confused, frozen) and positions for all active enemies.
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
    // 1. Handle Frozen State (Ransomware Lock)
    if (enemy.state === "frozen" || (enemy.frozenMs && enemy.frozenMs > 0)) {
      const remFrozen = (enemy.frozenMs || 0) - deltaMs;
      if (remFrozen <= 0) {
        return {
          ...enemy,
          state: "patrol" as const,
          frozenMs: 0,
        };
      }
      return {
        ...enemy,
        frozenMs: remFrozen,
      };
    }

    // 2. Handle Stun State
    if (enemy.state === "stunned" || (enemy.stunTimerMs && enemy.stunTimerMs > 0)) {
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

    // 3. Handle Confused State (MitM Packet Spoof)
    let isConfused = false;
    let remainingConfused = enemy.confusedMs || 0;
    if (enemy.state === "confused" || remainingConfused > 0) {
      remainingConfused -= deltaMs;
      if (remainingConfused <= 0) {
        remainingConfused = 0;
      } else {
        isConfused = true;
      }
    }

    const distToPlayer = Math.hypot(enemy.x - playerX, enemy.y - playerY);
    const los = hasLineOfSight(grid, enemy.x, enemy.y, playerX, playerY);

    // 4. State Transitions
    let state = isConfused ? "confused" : enemy.state;
    if (!isConfused) {
      if (enemy.type === "zombie" || enemy.type === "slime" || enemy.type === "sentinel_daemon") {
        if (distToPlayer <= 5 && los) {
          state = "chase";
        } else if (distToPlayer > 6) {
          state = "patrol";
        }
      }
    }

    let nextX = enemy.x;
    let nextY = enemy.y;
    let nextDir = enemy.patrolDir;

    if (state === "confused") {
      // Confused movement: erratic jitter
      const dirs = ["left", "right", "up", "down"] as const;
      nextDir = dirs[Math.floor(Math.random() * dirs.length)];
      const stepX = nextDir === "right" ? 1 : nextDir === "left" ? -1 : 0;
      const stepY = nextDir === "down" ? 1 : nextDir === "up" ? -1 : 0;
      const candX = enemy.x + stepX;
      const candY = enemy.y + stepY;
      if (
        candY >= 0 &&
        candY < grid.length &&
        candX >= 0 &&
        candX < grid[0].length &&
        grid[candY][candX] !== "#" &&
        grid[candY][candX] !== "W"
      ) {
        nextX = candX;
        nextY = candY;
      }
    } else if (state === "chase") {
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

    // Check collision with player (unless confused)
    if (!isConfused && nextX === playerX && nextY === playerY) {
      caughtPlayer = true;
      damageToPlayer += 25;
    }

    return {
      ...enemy,
      x: nextX,
      y: nextY,
      state,
      patrolDir: nextDir,
      confusedMs: remainingConfused,
    };
  });

  return {
    updatedEnemies,
    damageToPlayer,
    caughtPlayer,
  };
}
