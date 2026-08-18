// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { AdaptiveBrain3DViewer } from "@/components/neuro/AdaptiveBrain3DViewer";
import { setMockDeviceCapabilities } from "@/lib/adaptive-resource";

// Mock loadExternalBrainMesh from asset-loader to spy asset fetch calls
const mockLoadExternalBrainMesh = vi.fn().mockResolvedValue({
  type: "Group",
  children: [],
  traverse: vi.fn(),
});

vi.mock("@/lib/neuro/asset-loader", () => ({
  loadExternalBrainMesh: (...args: unknown[]) => mockLoadExternalBrainMesh(...args),
}));

describe("On-Demand 3D Delivery & Mobile Poster Integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    setMockDeviceCapabilities(null);

    // Canvas 2D / WebGL Mock Context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      getExtension: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    setMockDeviceCapabilities(null);
  });

  it("displays 2D static poster without requesting 3D model assets on mobile viewports initially", async () => {
    setMockDeviceCapabilities({
      isMobileViewport: true,
      hasTouch: true,
      isCoarsePointer: true,
      shouldDefer3D: true,
      connection: {
        effectiveType: "3g",
        saveData: false,
        downlink: 1.5,
        rtt: 250,
        isCellularOrConstrained: true,
      },
    });

    await act(async () => {
      root.render(
        <AdaptiveBrain3DViewer
          surfaceMode="pial"
          crosshair={{ x: 48, y: 48, z: 48 }}
          modelUrl="/models/brain-surface.glb"
        />
      );
    });

    // Poster is present
    const poster = container.querySelector('[data-testid="brain-3d-poster"]');
    expect(poster).not.toBeNull();
    expect(container.textContent).toContain("2D Preview Poster");
    expect(container.textContent).toContain("Tap to Load 3D WebGL Scene");

    // Asset loader was NOT called during initial load
    expect(mockLoadExternalBrainMesh).not.toHaveBeenCalled();
  });

  it("triggers download and rendering of full WebGL 3D scene when user taps 2D preview poster", async () => {
    setMockDeviceCapabilities({
      isMobileViewport: true,
      hasTouch: true,
      isCoarsePointer: true,
      shouldDefer3D: true,
      connection: {
        effectiveType: "3g",
        saveData: false,
        downlink: 1.5,
        rtt: 250,
        isCellularOrConstrained: true,
      },
    });

    await act(async () => {
      root.render(
        <AdaptiveBrain3DViewer
          surfaceMode="pial"
          crosshair={{ x: 48, y: 48, z: 48 }}
          modelUrl="/models/brain-surface.glb"
        />
      );
    });

    const activateBtn = container.querySelector('[data-testid="activate-3d-button"]') as HTMLButtonElement;
    expect(activateBtn).not.toBeNull();

    await act(async () => {
      activateBtn.click();
    });

    // Poster is replaced by activated WebGL 3D view
    const poster = container.querySelector('[data-testid="brain-3d-poster"]');
    expect(poster).toBeNull();

    // 3D model load requested on demand
    expect(mockLoadExternalBrainMesh).toHaveBeenCalledWith("/models/brain-surface.glb", "pial", "both");
  });

  it("maintains immediate 3D scene rendering on desktop viewports without requiring taps", async () => {
    setMockDeviceCapabilities({
      isMobileViewport: false,
      hasTouch: false,
      isCoarsePointer: false,
      shouldDefer3D: false,
      connection: {
        effectiveType: "4g",
        saveData: false,
        downlink: 10,
        rtt: 40,
        isCellularOrConstrained: false,
      },
    });

    await act(async () => {
      root.render(
        <AdaptiveBrain3DViewer
          surfaceMode="pial"
          crosshair={{ x: 48, y: 48, z: 48 }}
          modelUrl="/models/brain-surface.glb"
        />
      );
    });

    // Poster is NOT shown on desktop
    const poster = container.querySelector('[data-testid="brain-3d-poster"]');
    expect(poster).toBeNull();

    // 3D asset loader is triggered immediately on desktop
    expect(mockLoadExternalBrainMesh).toHaveBeenCalledWith("/models/brain-surface.glb", "pial", "both");
  });
});
