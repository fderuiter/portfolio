/**
 * Arcade Viewport & Coordinate Transformation Engine.
 * Manages DPR scaling, Safe Zone matrix centering with bleed, integer letterboxing,
 * and defensive coordinate inverse math with zero division-by-zero risk.
 */

export type ViewportMode = "safe-zone" | "integer-letterbox";

export interface ViewportConfig {
  mode: ViewportMode;
  baseWidth: number;
  baseHeight: number;
  maxDpr?: number;
}

export interface ViewportMetrics {
  dpr: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  internalWidth: number;
  internalHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  bleedWidth: number;
  bleedHeight: number;
}

export interface GamePoint {
  x: number;
  y: number;
}

export class ArcadeViewport {
  private readonly mode: ViewportMode;
  private readonly baseWidth: number;
  private readonly baseHeight: number;
  private readonly maxDpr: number;

  constructor(config: ViewportConfig) {
    this.mode = config.mode;
    this.baseWidth = Math.max(1, config.baseWidth);
    this.baseHeight = Math.max(1, config.baseHeight);
    this.maxDpr = config.maxDpr ?? 2.0;
  }

  /**
   * Calculates viewport metrics based on container dimensions and physical pixel ratio.
   */
  public calculateMetrics(containerWidth: number, containerHeight: number, rawDpr = 1.0): ViewportMetrics {
    const dpr = Math.max(1.0, Math.min(rawDpr || 1.0, this.maxDpr));
    const width = Math.max(1, containerWidth);
    const height = Math.max(1, containerHeight);

    if (this.mode === "integer-letterbox") {
      const scale = Math.max(1, Math.floor(Math.min(width / this.baseWidth, height / this.baseHeight)));
      const canvasWidth = this.baseWidth * scale;
      const canvasHeight = this.baseHeight * scale;
      const offsetX = Math.max(0, (width - canvasWidth) / 2);
      const offsetY = Math.max(0, (height - canvasHeight) / 2);

      return {
        dpr,
        scale,
        offsetX,
        offsetY,
        internalWidth: canvasWidth * dpr,
        internalHeight: canvasHeight * dpr,
        canvasWidth,
        canvasHeight,
        bleedWidth: this.baseWidth,
        bleedHeight: this.baseHeight,
      };
    }

    // Safe Zone with dynamic bleed
    const scale = Math.min(width / this.baseWidth, height / this.baseHeight);
    const offsetX = Math.max(0, (width - this.baseWidth * scale) / 2);
    const offsetY = Math.max(0, (height - this.baseHeight * scale) / 2);

    const bleedWidth = width / Math.max(0.0001, scale);
    const bleedHeight = height / Math.max(0.0001, scale);

    return {
      dpr,
      scale,
      offsetX,
      offsetY,
      internalWidth: width * dpr,
      internalHeight: height * dpr,
      canvasWidth: width,
      canvasHeight: height,
      bleedWidth,
      bleedHeight,
    };
  }

  /**
   * Applies the transformation matrix to a 2D canvas context.
   */
  public applyTransform(ctx: CanvasRenderingContext2D, metrics: ViewportMetrics): void {
    if (!ctx || typeof ctx.setTransform !== "function") return;

    if (this.mode === "integer-letterbox") {
      ctx.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
      return;
    }

    ctx.setTransform(
      metrics.scale * metrics.dpr,
      0,
      0,
      metrics.scale * metrics.dpr,
      metrics.offsetX * metrics.dpr,
      metrics.offsetY * metrics.dpr
    );
  }
}

/**
 * Defensively translates client mouse/pointer coordinates to logical game safe zone coordinates.
 */
export function screenToGameCoords(
  clientX: number,
  clientY: number,
  rect: DOMRect | { left: number; top: number; width: number; height: number },
  metrics: ViewportMetrics
): GamePoint {
  const safeScale = Math.max(0.0001, metrics.scale);
  const rawX = clientX - (rect.left || 0);
  const rawY = clientY - (rect.top || 0);

  const gameX = (rawX - metrics.offsetX) / safeScale;
  const gameY = (rawY - metrics.offsetY) / safeScale;

  return {
    x: Number.isFinite(gameX) ? gameX : 0,
    y: Number.isFinite(gameY) ? gameY : 0,
  };
}
