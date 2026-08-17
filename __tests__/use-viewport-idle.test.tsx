import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewportIdle } from "@/hooks/useViewportIdle";

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.elements.add(target);
    // Fire callback initially with true intersecting state to simulate element visibility
    this.trigger([{ target, isIntersecting: true } as unknown as IntersectionObserverEntry]);
  }

  unobserve(target: Element): void {
    this.elements.delete(target);
  }

  disconnect(): void {
    this.elements.clear();
  }

  trigger(entries: IntersectionObserverEntry[]): void {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

describe("useViewportIdle Hook", () => {
  let originalIntersectionObserver: unknown;
  let activeObservers: MockIntersectionObserver[] = [];
  let visibilityState: "visible" | "hidden" = "visible";

  beforeEach(() => {
    originalIntersectionObserver = (globalThis as Record<string, unknown>).IntersectionObserver;
    activeObservers = [];
    (globalThis as Record<string, unknown>).IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
        const obs = new MockIntersectionObserver(cb, opts);
        activeObservers.push(obs);
        return obs;
      }
    };

    visibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).IntersectionObserver = originalIntersectionObserver;
    vi.restoreAllMocks();
  });

  it("should initialize with isVisibleRef as true", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };
    const { result } = renderHook(() => useViewportIdle(elementRef));

    expect(result.current.current).toBe(true);
  });

  it("should set isVisibleRef to false when IntersectionObserver entry is not intersecting", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };
    const { result } = renderHook(() => useViewportIdle(elementRef));

    // Force element to be out of viewport
    act(() => {
      activeObservers[0].trigger([
        { target: element, isIntersecting: false } as unknown as IntersectionObserverEntry,
      ]);
    });

    expect(result.current.current).toBe(false);
  });

  it("should fire onVisible callback when transitioning from offscreen to onscreen", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };
    const onVisible = vi.fn();
    const { result } = renderHook(() => useViewportIdle(elementRef, onVisible));

    // First go offscreen
    act(() => {
      activeObservers[0].trigger([
        { target: element, isIntersecting: false } as unknown as IntersectionObserverEntry,
      ]);
    });
    expect(result.current.current).toBe(false);
    expect(onVisible).not.toHaveBeenCalled();

    // Now go onscreen
    act(() => {
      activeObservers[0].trigger([
        { target: element, isIntersecting: true } as unknown as IntersectionObserverEntry,
      ]);
    });
    expect(result.current.current).toBe(true);
    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it("should handle document visibilitychange events", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };
    const onVisible = vi.fn();
    const { result } = renderHook(() => useViewportIdle(elementRef, onVisible));

    // Tab hidden
    visibilityState = "hidden";
    act(() => {
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    });
    expect(result.current.current).toBe(false);

    // Tab visible
    visibilityState = "visible";
    act(() => {
      const event = new Event("visibilitychange");
      document.dispatchEvent(event);
    });
    expect(result.current.current).toBe(true);
    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it("should clean up event listeners and observers on unmount", () => {
    const element = document.createElement("div");
    const elementRef = { current: element };
    const addListenerSpy = vi.spyOn(document, "addEventListener");
    const removeListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useViewportIdle(elementRef));

    expect(addListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});
