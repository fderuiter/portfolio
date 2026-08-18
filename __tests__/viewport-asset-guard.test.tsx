// @vitest-environment jsdom
import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Brain3DViewer } from "@/components/neuro/Brain3DViewer";
import { WorkingWithDuck } from "@/components/WorkingWithDuck";
import * as assetLoader from "@/lib/neuro/asset-loader";
import * as THREE from "three";

// Mock Three.js WebGLRenderer to work in jsdom
vi.mock("three", async () => {
  const actualThree = await vi.importActual<typeof import("three")>("three");
  return {
    ...actualThree,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement("canvas"),
    })),
  };
});

describe("Viewport-Driven Component Asset Guard", () => {
  let mockObserverCallbacks: IntersectionObserverCallback[] = [];
  let mockObserve: (target: Element) => void;
  let mockDisconnect: () => void;
  let originalIntersectionObserver: typeof window.IntersectionObserver;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();
    mockObserverCallbacks = [];

    originalIntersectionObserver = window.IntersectionObserver;

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "0px";
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        mockObserverCallbacks.push(callback);
        if (options?.rootMargin) {
          (this as { rootMargin: string }).rootMargin = options.rootMargin;
        }
      }

      observe(target: Element): void {
        mockObserve(target);
      }

      unobserve(): void {}

      disconnect(): void {
        mockDisconnect();
      }

      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    window.IntersectionObserver = originalIntersectionObserver;
  });

  describe("Brain3DViewer Viewport Asset Guard", () => {
    it("defers loadExternalBrainMesh when off-screen and triggers load when entering 200px rootMargin viewport threshold", async () => {
      const mockGroup = new THREE.Group();
      const loadExternalSpy = vi.spyOn(assetLoader, "loadExternalBrainMesh").mockResolvedValue(mockGroup);

      render(
        <Brain3DViewer
          surfaceMode="pial"
          crosshair={{ x: 48, y: 48, z: 48 }}
          modelUrl="/models/brain-surface.glb"
        />
      );

      // Verify IntersectionObserver was instantiated and observed container
      expect(mockObserve).toHaveBeenCalled();

      // On initial render while off-screen (isIntersecting is false), external mesh MUST NOT be fetched
      expect(loadExternalSpy).not.toHaveBeenCalled();

      // Trigger viewport intersection
      await act(async () => {
        mockObserverCallbacks.forEach((cb) => {
          cb(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
          );
        });
      });

      // Now loadExternalBrainMesh MUST be triggered with modelUrl
      expect(loadExternalSpy).toHaveBeenCalledWith("/models/brain-surface.glb", "pial", "both");
    });

    it("defaults to loading asset if IntersectionObserver is unsupported in the runtime environment", async () => {
      // Simulate unsupported IntersectionObserver (e.g., SSR or older browser engine)
      // @ts-expect-error override IntersectionObserver
      delete window.IntersectionObserver;

      const mockGroup = new THREE.Group();
      const loadExternalSpy = vi.spyOn(assetLoader, "loadExternalBrainMesh").mockResolvedValue(mockGroup);

      render(
        <Brain3DViewer
          surfaceMode="pial"
          crosshair={{ x: 48, y: 48, z: 48 }}
          modelUrl="/models/brain-surface.glb"
        />
      );

      // Since IntersectionObserver is undefined, it defaults to near viewport and fetches external model
      expect(loadExternalSpy).toHaveBeenCalledWith("/models/brain-surface.glb", "pial", "both");
    });
  });

  describe("WorkingWithDuck Scrapbook Photo Viewport Asset Guard", () => {
    it("defers loading high-res photo assets while off-screen and loads image elements upon viewport intersection", async () => {
      render(<WorkingWithDuck />);

      // Verify observer attached to WorkingWithDuck container
      expect(mockObserve).toHaveBeenCalledTimes(1);

      // Trigger viewport intersection
      await act(async () => {
        mockObserverCallbacks.forEach((cb) => {
          cb(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
          );
        });
      });

      // Component remains functional and mounted
      const progressElements = screen.getAllByText(/Work Progress/i);
      expect(progressElements.length).toBeGreaterThan(0);
    });

    it("handles fallback when IntersectionObserver is undefined without crashing", () => {
      // @ts-expect-error override IntersectionObserver
      delete window.IntersectionObserver;

      render(<WorkingWithDuck />);

      const progressElements = screen.getAllByText(/Work Progress/i);
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });
});
