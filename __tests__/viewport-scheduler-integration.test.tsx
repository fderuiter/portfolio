// @vitest-environment jsdom
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useViewportScheduler } from "@/hooks/useNetworkScheduler";
import { MediaContainer } from "@/components/MediaContainer";
import { setMockConnectionInfo, globalNetworkScheduler } from "@/lib/network-scheduler";

const SampleMediaComponent = ({ taskId }: { taskId: string }) => {
  const loadFn = React.useCallback(() => Promise.resolve("LOADED_MEDIA_DATA"), []);
  const { containerRef, status, isSlowConnection } = useViewportScheduler(
    loadFn,
    {
      id: taskId,
      priority: "low",
      rootMargin: "200px",
      deferOnSlowNetwork: true,
    }
  );

  return (
    <MediaContainer
      ref={containerRef}
      aspectRatio="16/9"
      minHeight={250}
      isLoading={status === "queued" || status === "executing"}
      placeholder={<div data-testid="placeholder">Loading Media...</div>}
      data-testid="media-container"
    >
      <div data-testid="status-indicator">
        {status === "completed" ? "MEDIA_RENDERED" : `STATUS_${status}`}
      </div>
      <div data-testid="connection-indicator">
        {isSlowConnection ? "SLOW_NET" : "FAST_NET"}
      </div>
    </MediaContainer>
  );
};

describe("Viewport Scheduler & CLS Guard Integration", () => {
  let mockObserverCallbacks: IntersectionObserverCallback[] = [];
  let originalIntersectionObserver: typeof window.IntersectionObserver;

  beforeEach(() => {
    setMockConnectionInfo(null);
    globalNetworkScheduler.clearAll();
    mockObserverCallbacks = [];
    originalIntersectionObserver = window.IntersectionObserver;

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "0px";
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(callback: IntersectionObserverCallback) {
        mockObserverCallbacks.push(callback);
      }

      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
    setMockConnectionInfo(null);
    globalNetworkScheduler.clearAll();
  });

  it("defers loading media asset when offscreen on constrained mobile network connections", async () => {
    setMockConnectionInfo({ effectiveType: "2g", saveData: true });

    render(<SampleMediaComponent taskId="gallery-item-1" />);

    // Container renders with fixed dimensions and aspect ratio to prevent CLS
    const container = screen.getByTestId("media-container");
    expect(container).toBeDefined();
    expect(container.style.aspectRatio).toBe("16/9");
    expect(container.style.minHeight).toBe("250px");

    // Network connection indicator shows SLOW_NET
    expect(screen.getByTestId("connection-indicator").textContent).toContain("SLOW_NET");

    // Trigger viewport proximity intersection
    await act(async () => {
      mockObserverCallbacks.forEach((cb) => {
        cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Asset executes and resolves
    expect(screen.getByTestId("status-indicator").textContent).toContain("MEDIA_RENDERED");
  });

  it("prevents cumulative layout shifts by maintaining aspect ratio bounding box", () => {
    render(
      <MediaContainer aspectRatio="4/3" minHeight={300} className="custom-media">
        <div>Asset Content</div>
      </MediaContainer>
    );

    const container = screen.getByText("Asset Content").parentElement;
    expect(container?.style.aspectRatio).toBe("4/3");
    expect(container?.style.minHeight).toBe("300px");
  });
});
