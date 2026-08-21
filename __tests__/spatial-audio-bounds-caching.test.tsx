/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, act, cleanup, fireEvent } from "@testing-library/react";
import { useSpatialAudioBounds, updateAllSpatialAudioBounds } from "@/hooks/useSpatialAudioBounds";
import { Navbar } from "@/components/Navbar";

let observerCallback: ((entries: any[]) => void) | null = null;
const mockDisconnect = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();

class MockResizeObserver {
  constructor(cb: any) {
    observerCallback = cb;
  }
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

globalThis.ResizeObserver = MockResizeObserver as any;

const mockPlayHover = vi.fn();
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playHover: mockPlayHover,
    playSuccess: vi.fn(),
    muted: false,
    volume: 0.3,
    profile: "8-bit",
  }),
  registerAudioCleanup: vi.fn(() => vi.fn()),
  cleanupGovernedAudio: vi.fn(),
  useAudioCleanup: vi.fn(),
}));

vi.mock("@/components/providers/SearchProvider", () => ({
  useSearch: () => ({
    openSearch: vi.fn(),
  }),
}));

vi.mock("@/components/providers/PersonaProvider", () => ({
  usePersona: () => ({
    persona: "general",
    setPersona: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

function TestNavComponent() {
  const { containerRef, registerNavElement, handleHover } = useSpatialAudioBounds<HTMLDivElement>();

  return (
    <div ref={containerRef} data-testid="nav-container">
      <a
        ref={registerNavElement}
        href="/link1"
        data-testid="link-1"
        onMouseEnter={handleHover}
        style={{ width: "100px", left: "100px" }}
      >
        Link 1
      </a>
      <a
        ref={registerNavElement}
        href="/link2"
        data-testid="link-2"
        onMouseEnter={handleHover}
        style={{ width: "100px", left: "300px" }}
      >
        Link 2
      </a>
    </div>
  );
}

describe("Spatial Audio Bounds Caching & Observer Hooks", () => {
  beforeEach(() => {
    observerCallback = null;
    mockDisconnect.mockClear();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockPlayHover.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("pre-caches navigation link bounds and computes panning without calling getBoundingClientRect on hover", async () => {
    const spyGetRect = vi.spyOn(HTMLAnchorElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 100,
      right: 200,
      top: 0,
      bottom: 50,
      width: 100,
      height: 50,
      x: 100,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    const { getByTestId } = render(<TestNavComponent />);
    const link1 = getByTestId("link-1");

    // Initial registration measured the rect
    expect(spyGetRect).toHaveBeenCalled();

    // Wait for batched observer update frame/microtask to complete
    await act(async () => {});
    spyGetRect.mockClear();

    // Trigger hover event
    fireEvent.mouseEnter(link1);

    // Verify playHover was called with computed panning
    expect(mockPlayHover).toHaveBeenCalledTimes(1);
    const panArg = mockPlayHover.mock.calls[0][0];
    expect(typeof panArg).toBe("number");

    // IMPORTANT: getBoundingClientRect was NOT called during the hover event itself!
    expect(spyGetRect).not.toHaveBeenCalled();
    spyGetRect.mockRestore();
  });

  it("automatically updates cached bounds when ResizeObserver fires for element resize", async () => {
    const { getByTestId } = render(<TestNavComponent />);
    const link2 = getByTestId("link-2");

    const spyGetRect = vi.spyOn(link2, "getBoundingClientRect").mockReturnValue({
      left: 400,
      right: 600,
      top: 0,
      bottom: 50,
      width: 200,
      height: 50,
      x: 400,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    // Trigger ResizeObserver callback
    await act(async () => {
      if (observerCallback) {
        observerCallback([{ target: link2 }]);
      } else {
        updateAllSpatialAudioBounds();
      }
    });

    spyGetRect.mockClear();

    // Hover over link2
    await act(async () => {
      fireEvent.mouseEnter(link2);
    });

    expect(mockPlayHover).toHaveBeenCalledTimes(1);
    expect(spyGetRect).not.toHaveBeenCalled();
  });

  it("renders Navbar cleanly with zero direct window scroll listeners", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    render(<Navbar />);

    // Check that window.addEventListener was NOT called for scroll or resize
    const scrollCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === "scroll");
    const resizeCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === "resize");

    expect(scrollCalls.length).toBe(0);
    expect(resizeCalls.length).toBe(0);

    addEventListenerSpy.mockRestore();
  });
});
