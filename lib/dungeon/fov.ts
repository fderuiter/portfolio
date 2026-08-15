/**
 * Raycasting Field-of-View (FOV) and Fog-of-War Engine
 */

export interface FOVResult {
  visible: boolean[][];
  explored: boolean[][];
}

/**
 * Calculates field of view using raycasting algorithm from a player origin (px, py).
 * Updates explored matrix permanently and visible matrix for current frame.
 */
export function calculateFOV(
  grid: string[][],
  px: number,
  py: number,
  radius: number = 6,
  existingExplored?: boolean[][]
): FOVResult {
  const height = grid.length;
  const width = grid[0].length;

  const visible: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  const explored: boolean[][] = existingExplored
    ? existingExplored.map((row) => [...row])
    : Array.from({ length: height }, () => Array(width).fill(false));

  // Player position is always visible & explored
  if (py >= 0 && py < height && px >= 0 && px < width) {
    visible[py][px] = true;
    explored[py][px] = true;
  }

  // Cast rays in 360 degrees (using fine step)
  const numRays = 120;
  for (let i = 0; i < numRays; i++) {
    const angle = (i * 2 * Math.PI) / numRays;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    for (let r = 1; r <= radius; r += 0.5) {
      const targetX = Math.round(px + cos * r);
      const targetY = Math.round(py + sin * r);

      if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
        break;
      }

      visible[targetY][targetX] = true;
      explored[targetY][targetX] = true;

      // Walls block ray propagation
      if (grid[targetY][targetX] === "#" || grid[targetY][targetX] === "W") {
        break;
      }
    }
  }

  return { visible, explored };
}

/**
 * Checks if a direct unobstructed line of sight exists between two coordinates.
 */
export function hasLineOfSight(
  grid: string[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number
): boolean {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;

  while (true) {
    if (cx === x1 && cy === y1) return true;

    if (
      cy >= 0 &&
      cy < grid.length &&
      cx >= 0 &&
      cx < grid[0].length &&
      (cx !== x0 || cy !== y0)
    ) {
      if (grid[cy][cx] === "#" || grid[cy][cx] === "W") {
        return false;
      }
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}
