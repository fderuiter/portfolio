import { ArcadeEngine } from "./engine";

export interface ArcadeGameLoopOptions {
  /** Fixed physics delta time in seconds. Defaults to 1/60 (approx 0.016666s). */
  fixedDt?: number;
  /** Maximum time accumulator can hold to prevent spiral of death. Defaults to 0.25s. */
  maxAccumulatorSec?: number;
}

/**
 * Deterministic Game Loop utilizing requestAnimationFrame, fixed physics timestep,
 * accumulator clamping against frame spikes, and sub-frame alpha render interpolation.
 */
export class ArcadeGameLoop {
  private readonly engine: ArcadeEngine<unknown, unknown>;
  private readonly getContext: () => CanvasRenderingContext2D | null;
  private readonly fixedDt: number;
  private readonly maxAccumulatorSec: number;

  private running = false;
  private paused = false;
  private lastTimestamp = 0;
  private accumulator = 0;
  private animFrameId: number | null = null;

  constructor(
    engine: ArcadeEngine<unknown, unknown>,
    getContext: () => CanvasRenderingContext2D | null,
    options?: ArcadeGameLoopOptions
  ) {
    this.engine = engine;
    this.getContext = getContext;
    this.fixedDt = options?.fixedDt ?? 1 / 60;
    this.maxAccumulatorSec = options?.maxAccumulatorSec ?? 0.25;
  }

  /**
   * Starts the game loop and invokes engine.init().
   */
  public start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTimestamp = 0;
    this.accumulator = 0;

    this.engine.init();

    if (typeof window !== "undefined" && typeof requestAnimationFrame === "function") {
      this.animFrameId = requestAnimationFrame(this.onFrame);
    }
  }

  /**
   * Stops the game loop and cancels active requestAnimationFrames.
   */
  public stop(): void {
    this.running = false;
    this.paused = false;
    if (this.animFrameId !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Pauses simulation updates without tearing down the loop.
   */
  public pause(): void {
    this.paused = true;
  }

  /**
   * Resumes simulation updates and resets frame timestamps to prevent jump spikes.
   */
  public resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.lastTimestamp = 0;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public isPaused(): boolean {
    return this.paused;
  }

  /**
   * Manually steps the simulation forward by 1 frame (useful for debugging and tests).
   */
  public stepOnce(): void {
    this.engine.update(this.fixedDt);
    const ctx = this.getContext();
    if (ctx) {
      this.engine.render(ctx, 1.0);
    }
  }

  /**
   * Drives the accumulator and update steps by an explicit delta time in milliseconds.
   */
  public tick(deltaMs: number): void {
    if (!this.running || this.paused) return;

    const deltaSec = Math.max(0, deltaMs / 1000);
    this.accumulator += deltaSec;

    // Clamp accumulator to prevent spiral of death during slow frames or background tabs
    if (this.accumulator > this.maxAccumulatorSec) {
      this.accumulator = this.maxAccumulatorSec;
    }

    // Step physics at fixed delta time
    while (this.accumulator >= this.fixedDt) {
      this.engine.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    // Calculate sub-frame alpha interpolation fraction [0, 1)
    const alpha = this.accumulator / this.fixedDt;

    const ctx = this.getContext();
    if (ctx) {
      this.engine.render(ctx, alpha);
    }
  }

  private onFrame = (timestamp: number): void => {
    if (!this.running) return;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.tick(deltaMs);

    if (this.running && typeof requestAnimationFrame === "function") {
      this.animFrameId = requestAnimationFrame(this.onFrame);
    }
  };
}
