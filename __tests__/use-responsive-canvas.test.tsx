// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas";

function renderHookHelper<T>(useHook: () => T) {
  const result = { current: null as unknown as T };
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  function TestComponent() {
    result.current = useHook();
    return null;
  }

  act(() => {
    root.render(<TestComponent />);
  });

  return {
    result,
    rerender: () => {
      act(() => {
        root.render(<TestComponent />);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    },
  };
}

describe("useResponsiveCanvas Hook - TDD Suite", () => {
  let canvas: HTMLCanvasElement;
  let canvasRef: React.RefObject<HTMLCanvasElement | null>;
  let unmountCurrent: (() => void) | null = null;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    document.body.appendChild(canvas);
    canvasRef = { current: canvas };

    // Mock getBoundingClientRect
    canvas.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100,
      top: 50,
      width: 400,
      height: 250,
      right: 500,
      bottom: 300,
    });
  });

  afterEach(() => {
    if (unmountCurrent) {
      unmountCurrent();
      unmountCurrent = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  it("calculates clamped device pixel ratio and internal dimensions", () => {
    const { result, unmount } = renderHookHelper(() =>
      useResponsiveCanvas({
        canvasRef,
        internalWidth: 800,
        internalHeight: 500,
        maxDpr: 2.0,
      })
    );
    unmountCurrent = unmount;

    expect(result.current.dpr).toBeLessThanOrEqual(2.0);
    expect(result.current.dimensions.width).toBe(800);
    expect(result.current.dimensions.height).toBe(500);
    expect(result.current.isContextLost).toBe(false);
  });

  it("normalizes client coordinates to internal game space without division-by-zero", () => {
    const { result, unmount } = renderHookHelper(() =>
      useResponsiveCanvas({
        canvasRef,
        internalWidth: 800,
        internalHeight: 500,
      })
    );
    unmountCurrent = unmount;

    // Click in center of displayed canvas (clientX: 300 = left 100 + 200 (half width), clientY: 175 = top 50 + 125 (half height))
    const coords = result.current.toGameCoordinates(300, 175);
    expect(coords.x).toBeCloseTo(400, 1);
    expect(coords.y).toBeCloseTo(250, 1);
    expect(coords.inBounds).toBe(true);

    // Click outside canvas bounds
    const outsideCoords = result.current.toGameCoordinates(50, 20);
    expect(outsideCoords.x).toBeLessThan(0);
    expect(outsideCoords.inBounds).toBe(false);
  });

  it("handles zero-width bounding client rect defensively without NaN", () => {
    canvas.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      right: 0,
      bottom: 0,
    });

    const { result, unmount } = renderHookHelper(() =>
      useResponsiveCanvas({
        canvasRef,
        internalWidth: 800,
        internalHeight: 500,
      })
    );
    unmountCurrent = unmount;

    const coords = result.current.toGameCoordinates(10, 10);
    expect(Number.isNaN(coords.x)).toBe(false);
    expect(Number.isNaN(coords.y)).toBe(false);
    expect(Number.isFinite(coords.x)).toBe(true);
    expect(Number.isFinite(coords.y)).toBe(true);
  });

  it("intercepts context lost and restored events gracefully", () => {
    const onLost = vi.fn();
    const onRestored = vi.fn();

    const { result, unmount } = renderHookHelper(() =>
      useResponsiveCanvas({
        canvasRef,
        internalWidth: 800,
        internalHeight: 500,
        onContextLost: onLost,
        onContextRestored: onRestored,
      })
    );
    unmountCurrent = unmount;

    // Simulate contextlost event
    const lostEvent = new Event("contextlost", { cancelable: true });
    act(() => {
      canvas.dispatchEvent(lostEvent);
    });

    expect(result.current.isContextLost).toBe(true);
    expect(onLost).toHaveBeenCalledTimes(1);

    // Simulate contextrestored event
    const restoredEvent = new Event("contextrestored");
    act(() => {
      canvas.dispatchEvent(restoredEvent);
    });

    expect(result.current.isContextLost).toBe(false);
    expect(result.current.recoveryCount).toBe(1);
    expect(onRestored).toHaveBeenCalledTimes(1);
  });
});
