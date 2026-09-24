/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  AssetDistributionViewer,
  AssetDistributionHub,
  VectorComparisonTool,
  VectorComparisonViewer,
} from "@/components/laser-loon";

describe("Laser Loon Subcomponents Test Suite", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mockCtx: Record<string, any>;

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      setLineDash: vi.fn(),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
      if (contextId === "2d") return mockCtx as any;
      return null;
    });

    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 720,
      height: 80,
      right: 720,
      bottom: 80,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  describe("Requirement 1: AssetDistributionViewer", () => {
    it("should mount AssetDistributionViewer and export aliases consistently", () => {
      expect(AssetDistributionViewer).toBe(AssetDistributionHub);
    });

    it("should mount AssetDistributionViewer and assert canvas rendering properties", async () => {
      await act(async () => {
        root.render(<AssetDistributionViewer />);
      });

      const canvas = container.querySelector(
        '[data-testid="asset-distribution-canvas"]'
      ) as HTMLCanvasElement;

      expect(canvas).not.toBeNull();
      expect(canvas.tagName).toBe("CANVAS");
      expect(canvas.width).toBe(720);
      expect(canvas.height).toBe(80);

      // Verify canvas 2D rendering pipeline context interactions
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");
      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 720, 80);
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it("should render all asset categories, download links, and CC license information", async () => {
      await act(async () => {
        root.render(<AssetDistributionViewer />);
      });

      expect(container.textContent).toContain("Get the Laser Loon Artwork");
      expect(container.textContent).toContain("Download All Files (ZIP)");
      expect(container.textContent).toContain("Vector Print & Source Formats");
      expect(container.textContent).toContain("Laser_loon.ai");
      expect(container.textContent).toContain("Laser_loon.svg");
      expect(container.textContent).toContain("Laser_loon.psd");
      expect(container.textContent).toContain("Creative Commons CC BY 4.0");

      const zipDownloadBtn = container.querySelector(
        'a[href="/files/laser-loon-assets.zip"]'
      ) as HTMLAnchorElement;
      expect(zipDownloadBtn).not.toBeNull();
      expect(zipDownloadBtn.getAttribute("download")).toBe(
        "laser-loon-assets.zip"
      );
    });

    it("should copy link to clipboard when Share button is clicked", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      await act(async () => {
        root.render(<AssetDistributionViewer />);
      });

      const shareBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Share Assets")
      );
      expect(shareBtn).toBeDefined();

      await act(async () => {
        shareBtn?.click();
      });

      expect(writeTextMock).toHaveBeenCalled();
      expect(container.textContent).toContain("Link Copied!");
    });
  });

  describe("Requirement 2: VectorComparisonTool Slider & Mode Interactions", () => {
    it("should mount VectorComparisonTool and export aliases consistently", () => {
      expect(VectorComparisonTool).toBe(VectorComparisonViewer);
    });

    it("should mount VectorComparisonTool with default slider position and render split slider", async () => {
      await act(async () => {
        root.render(<VectorComparisonTool />);
      });

      expect(container.textContent).toContain("A Closer Look:");
      expect(container.textContent).toContain("The Bird and the Lasers");

      const slider = container.querySelector(
        'input[type="range"]'
      ) as HTMLInputElement;
      expect(slider).not.toBeNull();
      expect(slider.value).toBe("50");

      const clippedOverlay = container.querySelector(
        'div[style*="width: 50%"]'
      );
      expect(clippedOverlay).not.toBeNull();
    });

    it("should handle slider drag/change interactions and update overlay width", async () => {
      await act(async () => {
        root.render(<VectorComparisonTool />);
      });

      const slider = container.querySelector(
        'input[type="range"]'
      ) as HTMLInputElement;
      expect(slider).not.toBeNull();

      await act(async () => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(slider, "75");
        slider.dispatchEvent(new Event("change", { bubbles: true }));
      });

      expect(slider.value).toBe("75");
      const updatedOverlay = container.querySelector(
        'div[style*="width: 75%"]'
      );
      expect(updatedOverlay).not.toBeNull();
    });

    it("should switch view modes between Split Slider, Side-By-Side, and Pass Toggle", async () => {
      await act(async () => {
        root.render(<VectorComparisonTool />);
      });

      const sideBySideBtn = Array.from(
        container.querySelectorAll("button")
      ).find((b) => b.textContent?.includes("Side-By-Side"));
      expect(sideBySideBtn).toBeDefined();

      await act(async () => {
        sideBySideBtn?.click();
      });

      expect(container.textContent).toContain("Pass 1: Silhouette Vector");
      expect(container.textContent).toContain("Pass 2: Laser Optics & Rays");

      const passToggleBtn = Array.from(
        container.querySelectorAll("button")
      ).find((b) => b.textContent?.includes("Pass Toggle"));
      expect(passToggleBtn).toBeDefined();

      await act(async () => {
        passToggleBtn?.click();
      });

      expect(container.textContent).toContain("Active Render Pass:");
      expect(container.textContent).toContain("Pass 1: Silhouette Only");
      expect(container.textContent).toContain("Pass 2: Laser Optics Only");
      expect(container.textContent).toContain("Combined Output");
    });

    it("should toggle active render passes in Pass Toggle view mode", async () => {
      await act(async () => {
        root.render(<VectorComparisonTool />);
      });

      const passToggleModeBtn = Array.from(
        container.querySelectorAll("button")
      ).find((b) => b.textContent?.includes("Pass Toggle"));

      await act(async () => {
        passToggleModeBtn?.click();
      });

      const laserPassBtn = Array.from(
        container.querySelectorAll("button")
      ).find((b) => b.textContent?.includes("Pass 2: Laser Optics Only"));
      expect(laserPassBtn).toBeDefined();

      await act(async () => {
        laserPassBtn?.click();
      });

      expect(laserPassBtn?.className).toContain("bg-red-500/20");

      const silhouettePassBtn = Array.from(
        container.querySelectorAll("button")
      ).find((b) => b.textContent?.includes("Pass 1: Silhouette Only"));

      await act(async () => {
        silhouettePassBtn?.click();
      });

      expect(silhouettePassBtn?.className).toContain("bg-cyan-500/20");
    });
  });
});
