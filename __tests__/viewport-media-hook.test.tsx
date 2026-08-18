import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewportMedia } from "../hooks/useViewportMedia";
import { mediaScheduler, MEDIA_PRIORITY } from "../lib/media-scheduler";

describe("useViewportMedia Hook Suite", () => {
  beforeEach(() => {
    mediaScheduler.clearQueue();

    // Mock IntersectionObserver
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      private callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element): void {
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              target,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            },
          ],
          this
        );
      }

      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with above-the-fold priority and loads immediately", async () => {
    const customLoader = vi.fn().mockResolvedValue("loaded-image-data");

    const { result } = renderHook(() =>
      useViewportMedia<string>("https://example.com/test.jpg", {
        isAboveTheFold: true,
        priority: MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD,
        loadFn: customLoader,
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.data).toBe("loaded-image-data");
  });

  it("handles loading failure gracefully and provides error state", async () => {
    const failingLoader = vi.fn().mockRejectedValue(new Error("Network Error 500"));

    const { result } = renderHook(() =>
      useViewportMedia<string>("https://example.com/failing.jpg", {
        isAboveTheFold: true,
        loadFn: failingLoader,
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.status).toBe("FAILED");
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("Network Error 500");
  });
});
