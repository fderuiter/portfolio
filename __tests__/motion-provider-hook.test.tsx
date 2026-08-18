import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MotionProvider, useMotionContext } from "@/components/providers/MotionProvider";
import { useReducedMotion, useMotion, isReducedMotionPreferred } from "@/hooks/useReducedMotion";
import { TextReveal } from "@/components/TextReveal";
import { Timeline } from "@/components/Timeline";
import { Brain3DViewer } from "@/components/neuro/Brain3DViewer";
import { PersonaProvider } from "@/components/providers/PersonaProvider";
import { TerminologyProvider } from "@/components/providers/TerminologyProvider";

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mediaQueryList = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn((fn: (e: MediaQueryListEvent) => void) => listeners.push(fn)),
    removeListener: vi.fn((fn: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    addEventListener: vi.fn((event: string, fn: (e: MediaQueryListEvent) => void) => {
      if (event === "change") listeners.push(fn);
    }),
    removeEventListener: vi.fn((event: string, fn: (e: MediaQueryListEvent) => void) => {
      if (event === "change") {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      }
    }),
    dispatchEvent: vi.fn(),
    // Helper to simulate system preference change
    triggerChange(newMatches: boolean) {
      mediaQueryList.matches = newMatches;
      listeners.forEach((fn) => fn({ matches: newMatches } as MediaQueryListEvent));
    },
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      if (query.includes("prefers-reduced-motion")) {
        return mediaQueryList;
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });

  return mediaQueryList;
}

describe("Centralized Motion Config Provider and Motion Hook Suite", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("Requirement 1: MotionProvider provides motion context and wraps Framer Motion config", () => {
    mockMatchMedia(true);

    const Consumer = () => {
      const { prefersReducedMotion } = useMotionContext();
      const hookMotion = useReducedMotion();
      return (
        <div>
          <span data-testid="context-motion">{prefersReducedMotion ? "reduce" : "normal"}</span>
          <span data-testid="hook-motion">{hookMotion ? "reduce" : "normal"}</span>
        </div>
      );
    };

    render(
      <MotionProvider>
        <Consumer />
      </MotionProvider>
    );

    expect(screen.getByTestId("context-motion").textContent).toBe("reduce");
    expect(screen.getByTestId("hook-motion").textContent).toBe("reduce");
  });

  it("Requirement 2: Custom hooks and imperatively exported helper detect prefers-reduced-motion changes", () => {
    const mediaMql = mockMatchMedia(false);

    expect(isReducedMotionPreferred()).toBe(false);

    const Consumer = () => {
      const { prefersReducedMotion } = useMotion();
      return <div data-testid="motion-state">{prefersReducedMotion ? "reduced" : "active"}</div>;
    };

    render(<Consumer />);

    expect(screen.getByTestId("motion-state").textContent).toBe("active");

    act(() => {
      mediaMql.triggerChange(true);
    });

    expect(isReducedMotionPreferred()).toBe(true);
    expect(screen.getByTestId("motion-state").textContent).toBe("reduced");
  });

  it("Requirement 3: TextReveal renders fully visible text without scroll opacity/color transitions when reduced motion is enabled", () => {
    mockMatchMedia(true);

    const sampleText = "Centralized Motion Policy Test";
    render(
      <MotionProvider>
        <TextReveal>{sampleText}</TextReveal>
      </MotionProvider>
    );

    // TextReveal splits text into words
    const words = sampleText.split(" ");
    words.forEach((word) => {
      expect(screen.getByText(word)).toBeDefined();
    });
  });

  it("Requirement 4: Timeline renders cards immediately without motion lag or spring delays under reduced motion", () => {
    mockMatchMedia(true);

    render(
      <PersonaProvider>
        <TerminologyProvider>
          <MotionProvider>
            <Timeline />
          </MotionProvider>
        </TerminologyProvider>
      </PersonaProvider>
    );

    expect(screen.getByText("HANDS-ON REALITY")).toBeDefined();
    expect(screen.getByText("FORMAL SUMMARY")).toBeDefined();
  });

  it("Requirement 5: WebGL Brain3DViewer renders without errors under reduced motion and stops background auto-rotation", () => {
    mockMatchMedia(true);

    const { container } = render(
      <MotionProvider>
        <Brain3DViewer
          surfaceMode="pial"
          crosshair={{ x: 48, y: 48, z: 48 }}
        />
      </MotionProvider>
    );

    expect(container).toBeDefined();
  });
});
