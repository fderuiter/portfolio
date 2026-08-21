import React, { act, useRef } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { fromPartial } from "@total-typescript/shoehorn";
import { Brain3DViewer } from "@/components/neuro/Brain3DViewer";

import { useWebGLContextLoss } from "@/hooks/useWebGLContextLoss";
import { A11yProvider } from "@/components/providers/A11yProvider";

// Mock Three.js WebGL and Canvas 2D context
class MockWebGLRenderer {
  domElement: HTMLCanvasElement;
  setSize = vi.fn();
  setPixelRatio = vi.fn();
  render = vi.fn();
  dispose = vi.fn();

  constructor() {
    this.domElement = document.createElement("canvas");
  }
}

vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(function (this: unknown) {
      return new MockWebGLRenderer();
    }),
  };
});

// Test Harness Component for useWebGLContextLoss
const HookTestHarness: React.FC<{
  onLost?: () => void;
  onRestored?: () => void;
}> = ({ onLost, onRestored }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { status, isLost, recoveryCount, triggerSimulation } =
    useWebGLContextLoss({
      canvasRef,
      label: "3D Viewport",
      onContextLost: onLost,
      onContextRestored: onRestored,
      autoResetIdleDelayMs: 1000,
    });

  return (
    <div>
      <canvas ref={canvasRef} data-testid="test-canvas" />
      <span data-testid="status">{status}</span>
      <span data-testid="is-lost">{isLost ? "true" : "false"}</span>
      <span data-testid="recovery-count">{recoveryCount}</span>
      <button data-testid="sim-btn" onClick={() => triggerSimulation(500)}>
        Simulate
      </button>
    </div>
  );
};

describe("WebGL Context Loss & Restoration Recovery Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.useFakeTimers();

    // Canvas 2D mock context for any 2D canvas calls
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (contextId) => {
        if (contextId === "2d") {
          return fromPartial<CanvasRenderingContext2D>({
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 1,
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
            roundRect: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            setLineDash: vi.fn(),
            measureText: vi.fn().mockReturnValue({ width: 50 }),
            quadraticCurveTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            arcTo: vi.fn(),
          });
        }

        return null;
      }
    );
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("1. useWebGLContextLoss Hook Lifecycle", () => {
    it("handles webglcontextlost and webglcontextrestored events with status transitions", async () => {
      const onLost = vi.fn();
      const onRestored = vi.fn();

      await act(async () => {
        root = createRoot(container);
        root.render(
          <A11yProvider>
            <HookTestHarness onLost={onLost} onRestored={onRestored} />
          </A11yProvider>
        );
      });

      const canvas = container.querySelector(
        '[data-testid="test-canvas"]'
      ) as HTMLCanvasElement;
      expect(
        container.querySelector('[data-testid="status"]')?.textContent
      ).toBe("idle");
      expect(
        container.querySelector('[data-testid="is-lost"]')?.textContent
      ).toBe("false");

      // 1. Dispatch webglcontextlost
      await act(async () => {
        const lostEvt = new Event("webglcontextlost", { cancelable: true });
        canvas.dispatchEvent(lostEvt);
      });

      expect(onLost).toHaveBeenCalledTimes(1);
      expect(
        container.querySelector('[data-testid="status"]')?.textContent
      ).toBe("lost");
      expect(
        container.querySelector('[data-testid="is-lost"]')?.textContent
      ).toBe("true");

      // 2. Dispatch webglcontextrestored
      await act(async () => {
        const restoredEvt = new Event("webglcontextrestored", {
          cancelable: true,
        });
        canvas.dispatchEvent(restoredEvt);
      });

      expect(onRestored).toHaveBeenCalledTimes(1);
      expect(
        container.querySelector('[data-testid="status"]')?.textContent
      ).toBe("restored");
      expect(
        container.querySelector('[data-testid="recovery-count"]')?.textContent
      ).toBe("1");

      // 3. Advances to idle
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(
        container.querySelector('[data-testid="status"]')?.textContent
      ).toBe("idle");
      expect(
        container.querySelector('[data-testid="is-lost"]')?.textContent
      ).toBe("false");
    });

    it("triggers simulated context loss through triggerSimulation", async () => {
      const onLost = vi.fn();
      const onRestored = vi.fn();

      await act(async () => {
        root = createRoot(container);
        root.render(
          <A11yProvider>
            <HookTestHarness onLost={onLost} onRestored={onRestored} />
          </A11yProvider>
        );
      });

      const simBtn = container.querySelector(
        '[data-testid="sim-btn"]'
      ) as HTMLButtonElement;

      await act(async () => {
        simBtn.click();
      });

      expect(onLost).toHaveBeenCalledTimes(1);
      expect(
        container.querySelector('[data-testid="status"]')?.textContent
      ).toBe("lost");

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(onRestored).toHaveBeenCalledTimes(1);
      expect(
        container.querySelector('[data-testid="status"]')?.textContent
      ).toBe("restored");
    });
  });

  describe("2. Brain3DViewer WebGL Resilience Integration", () => {
    it("renders Brain3DViewer with HUD and GPU Test trigger button", async () => {
      await act(async () => {
        root = createRoot(container);
        root.render(
          <A11yProvider>
            <Brain3DViewer
              surfaceMode="pial"
              crosshair={{ x: 48, y: 48, z: 48 }}
              wireframe={false}
            />
          </A11yProvider>
        );
        await Promise.resolve();
      });

      expect(container.textContent).toContain("Pial Surface");
      expect(container.textContent).toContain("GPU Test");
      expect(container.textContent).toContain("VOXEL: (48, 48, 48)");

      // Find canvas created by MockWebGLRenderer
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeDefined();

      // Trigger webglcontextlost on the viewer's canvas
      await act(async () => {
        canvas?.dispatchEvent(
          new Event("webglcontextlost", { cancelable: true })
        );
      });

      // Verify HUD banner appears indicating recovery in progress
      expect(container.textContent).toContain(
        "GPU Context Interrupted — Re-instantiating buffers..."
      );

      // Trigger webglcontextrestored
      await act(async () => {
        canvas?.dispatchEvent(
          new Event("webglcontextrestored", { cancelable: true })
        );
      });

      // Verify restored banner appears
      expect(container.textContent).toContain("GPU Context Restored");

      // Verify voxel coordinate and surface mode are preserved
      expect(container.textContent).toContain("VOXEL: (48, 48, 48)");
      expect(container.textContent).toContain("Pial Surface");
    });

    it("triggers GPU recovery simulation via the GPU Test button", async () => {
      await act(async () => {
        root = createRoot(container);
        root.render(
          <A11yProvider>
            <Brain3DViewer
              surfaceMode="aparc"
              crosshair={{ x: 60, y: 40, z: 50 }}
              wireframe={true}
            />
          </A11yProvider>
        );
        await Promise.resolve();
      });

      const buttons = Array.from(container.querySelectorAll("button"));
      const gpuTestBtn = buttons.find((btn) =>
        btn.textContent?.includes("GPU Test")
      );
      expect(gpuTestBtn).toBeDefined();

      await act(async () => {
        gpuTestBtn?.click();
      });

      expect(container.textContent).toContain(
        "GPU Context Interrupted — Re-instantiating buffers..."
      );

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(container.textContent).toContain("GPU Context Restored");
      expect(container.textContent).toContain("VOXEL: (60, 40, 50)");
    });
  });
});
