import { designManifest } from "./design-manifest";
import { prepare, layout, type PreparedText } from "@chenglou/pretext";
import { 
  type PreparedRichInline,
  type RichInlineLine,
} from "@chenglou/pretext/rich-inline";

// --- Types ---
export type Point2D = { x: number; y: number };

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  directionX: number;
  directionY: number;
  duration: number;
}

export interface TextMeasurementOptions {
  text: string;
  fontSize: number;
  lineHeight: number;
  fontFamilyVariable?: string;
  maxWidth: number;
}

// --- Global Caches ---
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  set(key: K, value: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
  clear() {
    this.cache.clear();
  }
}

export const textPrepareCache = new LRUCache<string, PreparedText>(500);
export const textLayoutCache = new LRUCache<string, { height: number; lineCount: number }>(2000);

export const richItemsCache = new LRUCache<string, unknown[]>(500);
export const richPrepareCache = new LRUCache<string, PreparedRichInline>(500);
export const richLayoutCache = new LRUCache<string, { height: number; lines: RichInlineLine[] }>(2000);

// --- Environment and CSS resolution helpers ---

/**
 * Safe browser environment check to prevent SSR failures.
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Resolves font family variable dynamically using Computed Style.
 * Returns designManifest sans-serif fallback if run in SSR or variables are missing.
 */
export function resolveFontFamily(
  variableName: string = "--font-inter",
  fallback: string = designManifest.typography.fonts.sans
): string {
  if (!isBrowser()) {
    return fallback;
  }
  try {
    const rootStyle = window.getComputedStyle(document.documentElement);
    const rawFontFamily = rootStyle.getPropertyValue(variableName).trim();
    return rawFontFamily || fallback;
  } catch {
    return fallback;
  }
}

// --- Text Measurement Services ---

/**
 * Offscreen text measurement utilizing Pretext layout calculations.
 * SSR-safe fallback mechanism returns height 0 if running on server.
 */
export function measureTextOffscreen({
  text,
  fontSize,
  lineHeight,
  fontFamilyVariable = "--font-inter",
  maxWidth,
}: TextMeasurementOptions): { height: number; lineCount: number } {
  if (!isBrowser()) {
    return { height: 0, lineCount: 0 };
  }

  const fontFamily = resolveFontFamily(fontFamilyVariable);
  const fontString = `${fontSize}px ${fontFamily}`;

  const prepareKey = `${text}|${fontString}`;
  let prepared = textPrepareCache.get(prepareKey);
  if (!prepared) {
    prepared = prepare(text, fontString);
    textPrepareCache.set(prepareKey, prepared);
  }

  const flooredWidth = Math.floor(maxWidth);
  const cacheKey = `${text}|${fontString}|${flooredWidth}|${lineHeight}`;
  let result = textLayoutCache.get(cacheKey);
  if (!result) {
    result = layout(prepared, flooredWidth, lineHeight);
    textLayoutCache.set(cacheKey, result);
  }

  return result;
}

/**
 * Expose a layout validation utility that warns in non-production environments
 * when calculated layout height and actual physical DOM measurement differs by more than 2px.
 */
export function validateLayoutHeight(calculated: number, actual: number, contextMessage?: string) {
  if (process.env.NODE_ENV !== "production") {
    const deviation = Math.abs(calculated - actual);
    if (deviation > 2) {
      console.warn(
        `[Layout Validation Warning] Layout drift detected! Calculated height is ${calculated}px, but actual DOM height is ${actual}px (deviation: ${deviation.toFixed(2)}px). ${contextMessage || ""}`
      );
    }
  }
}

// --- Masonry Calculations ---

/**
 * Calculates responsive column count based on container width and breakpoints.
 */
export function calculateColumnCount(
  containerWidth: number,
  breakpoints: { MD: number; LG: number },
  cols: { SM: number; MD: number; LG: number }
): number {
  if (containerWidth >= breakpoints.LG) {
    return cols.LG;
  } else if (containerWidth >= breakpoints.MD) {
    return cols.MD;
  }
  return cols.SM;
}

/**
 * Calculates individual column width in masonry layout.
 */
export function calculateColumnWidth(
  containerWidth: number,
  colCount: number,
  gap: number
): number {
  return (containerWidth - gap * (colCount - 1)) / colCount;
}

/**
 * Distributes items with calculated heights into columns using the greedy shortest-column algorithm.
 */
export function distributeItemsGreedily<T extends { height: number }>(
  items: T[],
  colCount: number,
  gap: number
): { columns: T[][]; columnHeights: number[] } {
  const columns: T[][] = Array.from({ length: colCount }, () => []);
  const columnHeights = Array(colCount).fill(0);

  for (const item of items) {
    let minColIdx = 0;
    let minHeight = columnHeights[0];
    for (let i = 1; i < colCount; i++) {
      if (columnHeights[i] < minHeight) {
        minHeight = columnHeights[i];
        minColIdx = i;
      }
    }

    columns[minColIdx].push(item);
    columnHeights[minColIdx] += item.height + gap;
  }

  return { columns, columnHeights };
}

// --- SVG Spline & Coordinate Projections ---

/**
 * Maps a list of 1D data values to 2D Cartesian coordinates within a specified bounding box.
 * Takes min/max overrides or computes them from data.
 */
export function mapDataToCoordinates(
  data: number[],
  width: number,
  height: number,
  padding: number,
  minVal?: number,
  maxVal?: number
): Point2D[] {
  if (data.length === 0) return [];
  
  const computedMin = minVal !== undefined ? minVal : Math.min(...data, 0);
  const computedMax = maxVal !== undefined ? maxVal : Math.max(...data, 1);
  const usableHeight = height - padding * 2;

  return data.map((val, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * width : 0;
    const percentage = (val - computedMin) / ((computedMax - computedMin) || 1);
    const y = height - padding - percentage * usableHeight;
    return { x, y };
  });
}

/**
 * Computes cubic Bezier curves connecting a series of points using midpoint control points.
 * Generates an SVG path string ('d' attribute) for the line and an optional closed area path.
 */
export function generateCubicSplinePath(
  points: Point2D[],
  heightForArea?: number
): { pathD: string; areaD: string } {
  if (points.length === 0) {
    return { pathD: "", areaD: "" };
  }

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // Compute mid-point control points
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  let areaD = "";
  if (heightForArea !== undefined) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${heightForArea} L ${points[0].x} ${heightForArea} Z`;
  }

  return { pathD, areaD };
}

/**
 * Computes cubic Hermite spline paths (Catmull-Rom style tangents) connecting a series of points.
 * This generates smooth organic curves by calculating tangents at each point.
 */
export function generateHermiteSplinePath(
  points: Point2D[],
  heightForArea?: number
): { pathD: string; areaD: string } {
  if (points.length === 0) {
    return { pathD: "", areaD: "" };
  }
  if (points.length === 1) {
    const pathD = `M ${points[0].x} ${points[0].y}`;
    const areaD = heightForArea !== undefined ? `${pathD} L ${points[0].x} ${heightForArea} Z` : "";
    return { pathD, areaD };
  }

  // Calculate tangents (finite difference method / Catmull-Rom style tangents)
  const tangents: Point2D[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      tangents.push({
        x: points[1].x - points[0].x,
        y: points[1].y - points[0].y,
      });
    } else if (i === points.length - 1) {
      tangents.push({
        x: points[points.length - 1].x - points[points.length - 2].x,
        y: points[points.length - 1].y - points[points.length - 2].y,
      });
    } else {
      tangents.push({
        x: (points[i + 1].x - points[i - 1].x) / 2,
        y: (points[i + 1].y - points[i - 1].y) / 2,
      });
    }
  }

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const t0 = tangents[i];
    const t1 = tangents[i + 1];

    // Convert Hermite formulation to Cubic Bezier control points
    const cp1x = p0.x + t0.x / 3;
    const cp1y = p0.y + t0.y / 3;
    const cp2x = p1.x - t1.x / 3;
    const cp2y = p1.y - t1.y / 3;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  let areaD = "";
  if (heightForArea !== undefined) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${heightForArea} L ${points[0].x} ${heightForArea} Z`;
  }

  return { pathD, areaD };
}

// --- 2D Physics & Boundary Checks ---

/**
 * Checks if the bottom of a beam/bounding box has intersected or crossed the top of a container.
 */
export function checkBeamContainerCollision(
  beamRect: Rect,
  containerRect: Rect
): boolean {
  return beamRect.bottom >= containerRect.top;
}

/**
 * Calculates relative coordinates of the collision point with respect to a parent container.
 */
export function calculateCollisionPoint(
  beamRect: Rect,
  parentRect: Rect
): Point2D {
  const relativeX = beamRect.left - parentRect.left + beamRect.width / 2;
  const relativeY = beamRect.bottom - parentRect.top;
  return { x: relativeX, y: relativeY };
}

/**
 * Generates randomized trajectory profiles for particle explosion vectors.
 */
export function generateExplosionTrajectories(
  count: number,
  minX: number = -40,
  maxX: number = 40,
  minY: number = -60,
  maxY: number = -10,
  minDuration: number = 0.4,
  maxDuration: number = 1.6
): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const directionX = Math.floor(Math.random() * (maxX - minX) + minX);
    const directionY = Math.floor(Math.random() * (maxY - minY) + minY);
    const duration = Math.random() * (maxDuration - minDuration) + minDuration;
    return {
      id: index,
      initialX: 0,
      initialY: 0,
      directionX,
      directionY,
      duration,
    };
  });
}

/**
 * Trajectory calculation formula.
 * Computes current position of a particle at a given time ratio under trajectory velocity.
 */
export function calculateParticleTrajectory(
  initial: Point2D,
  velocity: Point2D,
  gravity: number,
  time: number
): Point2D {
  return {
    x: initial.x + velocity.x * time,
    y: initial.y + velocity.y * time + 0.5 * gravity * time * time,
  };
}
