/**
 * Shared Virtual Input Bridge for Unified Floating HUD Overlays across Arcade Titles.
 * Handles directional pad presses, action button taps, and pointer drag events uniformly
 * with touch gesture isolation, haptic vibration, and Web Audio feedback.
 */

export type VirtualInputDirection = "up" | "down" | "left" | "right";
export type VirtualInputAction = "actionA" | "actionB" | "actionC" | "actionD" | string;

export interface VirtualPointerPoint {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  target?: string;
}

export type DirectionListener = (direction: VirtualInputDirection) => void;
export type ActionListener = (actionId: VirtualInputAction) => void;
export type PointerDragListener = (point: VirtualPointerPoint) => void;

let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      try {
        sharedAudioCtx = new AudioCtx();
      } catch {
        sharedAudioCtx = null;
      }
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Triggers haptic vibration feedback on supported hardware.
 */
export function triggerHapticFeedback(durationMs = 15): void {
  if (typeof window === "undefined") return;
  try {
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(durationMs);
    }
  } catch {
    // Fallback gracefully if vibration is blocked or unsupported
  }
}

/**
 * Plays synthesized Web Audio sound effect for registered touch interactions.
 */
export function playSynthesizedAudio(
  frequency = 880,
  duration = 0.03,
  type: OscillatorType = "sine",
  gainValue = 0.08
): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Fallback gracefully if Web Audio is suspended or unsupported
  }
}

/**
 * Blocks native browser scrolling, zooming, and pull-to-refresh gestures on canvas touch zones.
 */
export function isolateTouchGestures(element: HTMLElement | null): () => void {
  if (!element || typeof window === "undefined") return () => {};

  element.style.touchAction = "none";

  const handleTouch = (e: TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  element.addEventListener("touchstart", handleTouch, { passive: false });
  element.addEventListener("touchmove", handleTouch, { passive: false });
  element.addEventListener("touchend", handleTouch, { passive: false });
  element.addEventListener("touchcancel", handleTouch, { passive: false });

  return () => {
    element.removeEventListener("touchstart", handleTouch);
    element.removeEventListener("touchmove", handleTouch);
    element.removeEventListener("touchend", handleTouch);
    element.removeEventListener("touchcancel", handleTouch);
  };
}

/**
 * Shared Virtual Input Bridge Class.
 */
export class VirtualInputBridge {
  private directionPressListeners: Set<DirectionListener> = new Set();
  private directionReleaseListeners: Set<DirectionListener> = new Set();
  private actionPressListeners: Set<ActionListener> = new Set();
  private actionReleaseListeners: Set<ActionListener> = new Set();
  private pointerDragListeners: Set<PointerDragListener> = new Set();

  onDirectionPress(listener: DirectionListener): () => void {
    this.directionPressListeners.add(listener);
    return () => this.directionPressListeners.delete(listener);
  }

  onDirectionRelease(listener: DirectionListener): () => void {
    this.directionReleaseListeners.add(listener);
    return () => this.directionReleaseListeners.delete(listener);
  }

  onActionPress(listener: ActionListener): () => void {
    this.actionPressListeners.add(listener);
    return () => this.actionPressListeners.delete(listener);
  }

  onActionRelease(listener: ActionListener): () => void {
    this.actionReleaseListeners.add(listener);
    return () => this.actionReleaseListeners.delete(listener);
  }

  onPointerDrag(listener: PointerDragListener): () => void {
    this.pointerDragListeners.add(listener);
    return () => this.pointerDragListeners.delete(listener);
  }

  emitDirectionPress(direction: VirtualInputDirection, feedback = true): void {
    if (feedback) {
      triggerHapticFeedback(15);
      playSynthesizedAudio(880, 0.025, "sine", 0.08);
    }
    this.directionPressListeners.forEach((fn) => fn(direction));
  }

  emitDirectionRelease(direction: VirtualInputDirection): void {
    this.directionReleaseListeners.forEach((fn) => fn(direction));
  }

  emitActionPress(actionId: VirtualInputAction, feedback = true): void {
    if (feedback) {
      triggerHapticFeedback(20);
      playSynthesizedAudio(1046.5, 0.035, "triangle", 0.1);
    }
    this.actionPressListeners.forEach((fn) => fn(actionId));
  }

  emitActionRelease(actionId: VirtualInputAction): void {
    this.actionReleaseListeners.forEach((fn) => fn(actionId));
  }

  emitPointerDrag(point: VirtualPointerPoint): void {
    this.pointerDragListeners.forEach((fn) => fn(point));
  }

  clear(): void {
    this.directionPressListeners.clear();
    this.directionReleaseListeners.clear();
    this.actionPressListeners.clear();
    this.actionReleaseListeners.clear();
    this.pointerDragListeners.clear();
  }
}

/**
 * Singleton instance of the Virtual Input Bridge.
 */
export const sharedInputBridge = new VirtualInputBridge();
