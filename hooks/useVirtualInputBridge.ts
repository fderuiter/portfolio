"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  sharedInputBridge,
  VirtualInputBridge,
  VirtualInputDirection,
  VirtualInputAction,
  VirtualPointerPoint,
  isolateTouchGestures,
} from "@/lib/virtual-input-bridge";

export interface UseVirtualInputBridgeOptions {
  bridge?: VirtualInputBridge;
  canvasRef?: React.RefObject<HTMLElement | null>;
  onDirectionPress?: (direction: VirtualInputDirection) => void;
  onDirectionRelease?: (direction: VirtualInputDirection) => void;
  onActionPress?: (actionId: VirtualInputAction) => void;
  onActionRelease?: (actionId: VirtualInputAction) => void;
  onPointerDrag?: (point: VirtualPointerPoint) => void;
}

export function useVirtualInputBridge(options: UseVirtualInputBridgeOptions = {}) {
  const {
    bridge = sharedInputBridge,
    canvasRef,
    onDirectionPress,
    onDirectionRelease,
    onActionPress,
    onActionRelease,
    onPointerDrag,
  } = options;

  const onDirectionPressRef = useRef(onDirectionPress);
  const onDirectionReleaseRef = useRef(onDirectionRelease);
  const onActionPressRef = useRef(onActionPress);
  const onActionReleaseRef = useRef(onActionRelease);
  const onPointerDragRef = useRef(onPointerDrag);

  useEffect(() => {
    onDirectionPressRef.current = onDirectionPress;
    onDirectionReleaseRef.current = onDirectionRelease;
    onActionPressRef.current = onActionPress;
    onActionReleaseRef.current = onActionRelease;
    onPointerDragRef.current = onPointerDrag;
  });

  // Isolate touch gestures on canvas
  useEffect(() => {
    if (!canvasRef?.current) return;
    const cleanup = isolateTouchGestures(canvasRef.current);
    return () => cleanup();
  }, [canvasRef]);

  // Subscribe to bridge events
  useEffect(() => {
    const unsubDirPress = bridge.onDirectionPress((dir) => {
      onDirectionPressRef.current?.(dir);
    });
    const unsubDirRelease = bridge.onDirectionRelease((dir) => {
      onDirectionReleaseRef.current?.(dir);
    });
    const unsubActPress = bridge.onActionPress((act) => {
      onActionPressRef.current?.(act);
    });
    const unsubActRelease = bridge.onActionRelease((act) => {
      onActionReleaseRef.current?.(act);
    });
    const unsubDrag = bridge.onPointerDrag((point) => {
      onPointerDragRef.current?.(point);
    });

    return () => {
      unsubDirPress();
      unsubDirRelease();
      unsubActPress();
      unsubActRelease();
      unsubDrag();
    };
  }, [bridge]);

  const emitDirectionPress = useCallback(
    (direction: VirtualInputDirection, feedback = true) => {
      bridge.emitDirectionPress(direction, feedback);
    },
    [bridge]
  );

  const emitDirectionRelease = useCallback(
    (direction: VirtualInputDirection) => {
      bridge.emitDirectionRelease(direction);
    },
    [bridge]
  );

  const emitActionPress = useCallback(
    (actionId: VirtualInputAction, feedback = true) => {
      bridge.emitActionPress(actionId, feedback);
    },
    [bridge]
  );

  const emitActionRelease = useCallback(
    (actionId: VirtualInputAction) => {
      bridge.emitActionRelease(actionId);
    },
    [bridge]
  );

  const emitPointerDrag = useCallback(
    (point: VirtualPointerPoint) => {
      bridge.emitPointerDrag(point);
    },
    [bridge]
  );

  return {
    emitDirectionPress,
    emitDirectionRelease,
    emitActionPress,
    emitActionRelease,
    emitPointerDrag,
    bridge,
  };
}
