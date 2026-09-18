import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  IntroScreen,
  PATROL_INTRO_SEEN_KEY,
} from "@/components/patrol/IntroScreen";
import { safeStorage } from "@/lib/safe-storage";

/**
 * Suite for the M9 intro/orientation persistence work (Issue #755): the
 * explainer is skippable, the skip is remembered across remounts, and the
 * screen renders identically under `prefers-reduced-motion: reduce`.
 */

function seedMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe("Patrol Shift — M9 intro orientation & skip persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    safeStorage.clearCache?.();
    seedMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    safeStorage.clearCache?.();
  });

  it("renders the full orientation on a first visit with both skip and briefing paths", () => {
    const onStartShift = vi.fn();
    const onSkipIntro = vi.fn();

    render(
      <IntroScreen onStartShift={onStartShift} onSkipIntro={onSkipIntro} />
    );

    const root = screen.getByTestId("patrol-intro-screen");
    expect(root.getAttribute("data-intro-mode")).toBe("first-visit");

    // Full explainer is visible inline, not hidden behind a disclosure.
    expect(screen.getByText(/Outdoor Emergency Care/i)).toBeDefined();
    expect(screen.getByText(/Toboggan Handling \(OET\)/i)).toBeDefined();
    expect(screen.getByText(/Sweep & Hill Safety/i)).toBeDefined();
    expect(root.querySelector("details")).toBeNull();

    expect(screen.getByText("Skip Intro")).toBeDefined();
    expect(screen.getByText("Begin Shift Briefing")).toBeDefined();
  });

  it("is skippable and forwards the skip to the shift engine", () => {
    const onStartShift = vi.fn();
    const onSkipIntro = vi.fn();

    render(
      <IntroScreen onStartShift={onStartShift} onSkipIntro={onSkipIntro} />
    );

    fireEvent.click(screen.getByText("Skip Intro"));

    expect(onSkipIntro).toHaveBeenCalledTimes(1);
    expect(onStartShift).not.toHaveBeenCalled();
  });

  it("persists the skip so a remount renders the condensed returning-patroller view", () => {
    const { unmount } = render(
      <IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />
    );

    fireEvent.click(screen.getByText("Skip Intro"));
    unmount();

    render(<IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />);

    const root = screen.getByTestId("patrol-intro-screen");
    expect(root.getAttribute("data-intro-mode")).toBe("returning");
    expect(screen.getByText("Resume Shift")).toBeDefined();
    expect(screen.getByText("Start with Briefing")).toBeDefined();
  });

  it("persists via Begin Shift Briefing too, not only via Skip", () => {
    const { unmount } = render(
      <IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />
    );

    fireEvent.click(screen.getByText("Begin Shift Briefing"));
    unmount();

    render(<IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />);
    expect(
      screen.getByTestId("patrol-intro-screen").getAttribute("data-intro-mode")
    ).toBe("returning");
  });

  it("writes the seen flag under the documented localStorage key", () => {
    render(<IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />);
    fireEvent.click(screen.getByText("Skip Intro"));

    expect(safeStorage.getItem<boolean>(PATROL_INTRO_SEEN_KEY, false)).toBe(
      true
    );
  });

  it("keeps the full orientation reachable for returning patrollers behind a disclosure", () => {
    safeStorage.setItem(PATROL_INTRO_SEEN_KEY, true);

    render(<IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />);

    const details = screen
      .getByTestId("patrol-intro-screen")
      .querySelector("details");
    expect(details).not.toBeNull();
    expect(screen.getByText(/Review full orientation/i)).toBeDefined();

    // Content is present in the DOM (collapsed, not destroyed), so a returning
    // patroller can re-read it without clearing storage.
    expect(screen.getByText(/Toboggan Handling \(OET\)/i)).toBeDefined();
  });

  it("renders the same content under prefers-reduced-motion: reduce", () => {
    seedMatchMedia(true);

    render(<IntroScreen onStartShift={vi.fn()} onSkipIntro={vi.fn()} />);

    expect(screen.getByTestId("patrol-intro-screen")).toBeDefined();
    expect(screen.getByText(/Outdoor Emergency Care/i)).toBeDefined();
    expect(screen.getByText("Begin Shift Briefing")).toBeDefined();
  });

  it("degrades gracefully when localStorage is unavailable", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    safeStorage.clearCache?.();

    const onSkipIntro = vi.fn();
    expect(() =>
      render(<IntroScreen onStartShift={vi.fn()} onSkipIntro={onSkipIntro} />)
    ).not.toThrow();

    fireEvent.click(screen.getByText("Skip Intro"));
    expect(onSkipIntro).toHaveBeenCalledTimes(1);

    if (original) {
      Object.defineProperty(window, "localStorage", original);
    }
    safeStorage.clearCache?.();
  });
});
