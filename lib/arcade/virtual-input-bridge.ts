"use client";

import { useCallback, useRef, useState, useEffect } from "react";

export type VirtualDirection = "up" | "down" | "left" | "right";

export interface VirtualInputBridgeOptions {
  onDirectionPress?: (direction: VirtualDirection) => void;
  onDirectionRelease?: (direction: VirtualDirection) => void;
  onActionAPress?: () => void;
  onActionARelease?: () => void;
  onActionBPress?: () => void;
  onActionBRelease?: () => void;
  onActionCPress?: () => void;
  onActionCRelease?: () => void;
  onPointerDrag?: (x: number, y: number, isDragging: boolean) => void;
  enableHaptics?: boolean;
  enableAudio?: boolean;
}

export interface VirtualInputState {
  directions: Record<VirtualDirection, boolean>;
  actions: {
    actionA: boolean;
    actionB: boolean;
    actionC: boolean;
  };
  isDragging: boolean;
  dragPos: { x: number; y: number };
}

/**
 * Safely triggers haptic vibration feedback on supported hardware.
 */
export function triggerHapticFeedback(pattern: number | number[] = 15): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  try {
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      return navigator.vibrate(pattern);
    }
  } catch {
    // Ignore permissions or hardware restriction errors
  }
  return false;
}

/**
 * Synthesizes short Web Audio sound effect feedback for touch interactions.
 */
export function triggerAudioFeedback(
  frequency = 880,
  duration = 0.02,
  type: OscillatorType = "sine"
): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Fall back silently if Web Audio is blocked or unsupported
  }
}

/**
 * Enforces gesture isolation to suppress native browser touch scrolling, zooming, and refresh.
 */
export function isolateGesture(e: React.SyntheticEvent | Event): void {
  if (e.cancelable) {
    e.preventDefault();
  }
  e.stopPropagation();
}

/**
 * Shared Virtual Input Bridge hook managing touch interactions across all arcade titles.
 */
export function useVirtualInputBridge(options: VirtualInputBridgeOptions = {}) {
  const {
    onDirectionPress,
    onDirectionRelease,
    onActionAPress,
    onActionARelease,
    onActionBPress,
    onActionBRelease,
    onActionCPress,
    onActionCRelease,
    onPointerDrag,
    enableHaptics = true,
    enableAudio = true,
  } = options;

  const [inputState, setInputState] = useState<VirtualInputState>({
    directions: { up: false, down: false, left: false, right: false },
    actions: { actionA: false, actionB: false, actionC: false },
    isDragging: false,
    dragPos: { x: 0, y: 0 },
  });

  const activePointerIdRef = useRef<number | null>(null);

  const handleDirectionPress = useCallback(
    (direction: VirtualDirection, e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);
      if (enableHaptics) triggerHapticFeedback(15);
      if (enableAudio) triggerAudioFeedback(880, 0.02);

      setInputState((prev) => ({
        ...prev,
        directions: { ...prev.directions, [direction]: true },
      }));

      onDirectionPress?.(direction);
    },
    [onDirectionPress, enableHaptics, enableAudio]
  );

  const handleDirectionRelease = useCallback(
    (direction: VirtualDirection, e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);

      setInputState((prev) => ({
        ...prev,
        directions: { ...prev.directions, [direction]: false },
      }));

      onDirectionRelease?.(direction);
    },
    [onDirectionRelease]
  );

  const handleActionPress = useCallback(
    (actionKey: "actionA" | "actionB" | "actionC", e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);
      if (enableHaptics) triggerHapticFeedback(20);
      if (enableAudio) triggerAudioFeedback(1050, 0.03);

      setInputState((prev) => ({
        ...prev,
        actions: { ...prev.actions, [actionKey]: true },
      }));

      if (actionKey === "actionA") onActionAPress?.();
      if (actionKey === "actionB") onActionBPress?.();
      if (actionKey === "actionC") onActionCPress?.();
    },
    [onActionAPress, onActionBPress, onActionCPress, enableHaptics, enableAudio]
  );

  const handleActionRelease = useCallback(
    (actionKey: "actionA" | "actionB" | "actionC", e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);

      setInputState((prev) => ({
        ...prev,
        actions: { ...prev.actions, [actionKey]: false },
      }));

      if (actionKey === "actionA") onActionARelease?.();
      if (actionKey === "actionB") onActionBRelease?.();
      if (actionKey === "actionC") onActionCRelease?.();
    },
    [onActionARelease, onActionBRelease, onActionCRelease]
  );

  const handleDragStart = useCallback(
    (x: number, y: number, pointerId?: number, e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);
      if (pointerId !== undefined) activePointerIdRef.current = pointerId;
      if (enableHaptics) triggerHapticFeedback(10);

      setInputState((prev) => ({
        ...prev,
        isDragging: true,
        dragPos: { x, y },
      }));

      onPointerDrag?.(x, y, true);
    },
    [onPointerDrag, enableHaptics]
  );

  const handleDragMove = useCallback(
    (x: number, y: number, e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);

      setInputState((prev) => ({
        ...prev,
        dragPos: { x, y },
      }));

      onPointerDrag?.(x, y, true);
    },
    [onPointerDrag]
  );

  const handleDragEnd = useCallback(
    (e?: React.SyntheticEvent | Event) => {
      if (e) isolateGesture(e);
      activePointerIdRef.current = null;

      setInputState((prev) => ({
        ...prev,
        isDragging: false,
      }));

      onPointerDrag?.(inputState.dragPos.x, inputState.dragPos.y, false);
    },
    [onPointerDrag, inputState.dragPos]
  );

  return {
    inputState,
    handleDirectionPress,
    handleDirectionRelease,
    handleActionPress,
    handleActionRelease,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
