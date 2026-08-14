/** Shared, deterministic helpers for portfolio game logic. */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * clamp(progress, 0, 1);

export const rectanglesOverlap = (first: Rect, second: Rect) =>
  first.x < second.x + second.width &&
  first.x + first.width > second.x &&
  first.y < second.y + second.height &&
  first.y + first.height > second.y;

/** A tiny repeatable PRNG for gameplay schedules; it is not for security use. */
export const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};
