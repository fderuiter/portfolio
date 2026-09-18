import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PatrolShiftContainer } from "@/components/patrol/PatrolShiftContainer";
import { MountainMap } from "@/components/patrol/MountainMap";
import { OetCanvas } from "@/components/patrol/OetCanvas";
import { DebriefDimensionMeter } from "@/components/patrol/DebriefDimensionMeter";
import { AmbientEventToast } from "@/components/patrol/AmbientEventToast";
import { MedicalDisclaimerBanner } from "@/components/patrol/MedicalDisclaimerBanner";
import {
  DEBRIEF_DIMENSION_ORDER,
  DESCENT_COMMIT_FPS_MOBILE,
  getDescentCommitIntervalMs,
  type PatrolScenario,
} from "@/lib/patrol";
import { safeStorage } from "@/lib/safe-storage";

/**
 * Suite for the M10 closing quality gate (Issue #756): accessibility,
 * mobile/touch parity, and reduced-motion behaviour across Patrol Shift.
 *
 * The Playwright axe-core sweep and the multi-viewport overflow matrix live in
 * `__tests__/e2e/`; this suite covers the invariants that are assertable in
 * JSDOM so regressions fail fast in the unit gate.
 */

const scenarioFixture: PatrolScenario = {
  id: "wrist-injury-lower-park",
  title: "Lower Park FOOSH Wrist Injury",
  actions: [],
  debriefRules: [],
};

function mockMatchMedia(matcher: (query: string) => boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: matcher(query),
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

beforeEach(() => {
  window.localStorage.clear();
  safeStorage.clearCache?.();
  mockMatchMedia(() => false);
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  safeStorage.clearCache?.();
  vi.restoreAllMocks();
});

describe("Patrol Shift — M10 accessibility invariants", () => {
  it("announces shift phase changes through a polite live region", () => {
    render(<PatrolShiftContainer />);

    const container = screen.getByTestId("patrol-shift-container");
    const liveRegion = container.querySelector('[aria-live="polite"]');

    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.getAttribute("aria-atomic")).toBe("true");
    expect(liveRegion?.textContent).toMatch(/Current shift phase/i);
  });

  it("traps focus in the field manual and restores it to the trigger on Escape", () => {
    render(<PatrolShiftContainer />);

    const trigger = screen.getByRole("button", {
      name: /Open Field Manual for Patrol Shift/i,
    });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("gives the responsibility-code modal a labelled, modal dialog role", () => {
    render(
      <MountainMap
        incidentsCompleted={0}
        onAwaitDispatch={vi.fn()}
        onCompleteShift={vi.fn()}
      />
    );

    const openers = screen.getAllByRole("button", {
      name: /Responsibility Code/i,
    });
    fireEvent.click(openers[0]);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const labelId = dialog.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toMatch(
      /Responsibility Code/i
    );
  });

  it("exposes the medical disclaimer as a named landmark, not colour alone", () => {
    render(<MedicalDisclaimerBanner />);

    const note = screen.getByRole("note");
    expect(note.getAttribute("aria-label")).toMatch(/Medical/i);
    // The warning is carried by text, so it survives forced-colors and
    // greyscale rendering where the amber accent does not.
    expect(note.textContent).toMatch(/not.*medical|educational|disclaimer/i);
  });

  it("does not use colour as the sole indicator on debrief meters", () => {
    const ratings = [
      { rating: "exemplary" as const, score: 9, badge: "Exemplary" },
      { rating: "proficient" as const, score: 7, badge: "Proficient" },
      { rating: "developing" as const, score: 4, badge: "Developing" },
      {
        rating: "needs-attention" as const,
        score: 2,
        badge: "Needs Attention",
      },
    ];

    for (const dimension of DEBRIEF_DIMENSION_ORDER) {
      for (const { rating, score, badge } of ratings) {
        const { unmount } = render(
          <DebriefDimensionMeter
            dimension={dimension}
            dimensionScore={{
              label: `${dimension} label`,
              rating,
              score,
              feedback: "Observation text.",
            }}
          />
        );

        const meter = screen.getByRole("progressbar");
        expect(meter.getAttribute("aria-valuenow")).toBe(String(score));
        expect(meter.getAttribute("aria-valuemin")).toBe("0");
        expect(meter.getAttribute("aria-valuemax")).toBe("10");
        expect(meter.getAttribute("aria-label")).toMatch(
          new RegExp(`${score} out of 10`)
        );
        // The band name reaches assistive tech AND is rendered as visible text,
        // so the amber/emerald/red accent is redundant, never load-bearing.
        expect(meter.getAttribute("aria-label")).toContain(badge);
        expect(screen.getByText(new RegExp(`${score}/10`))).toBeDefined();
        expect(screen.getAllByText(new RegExp(badge)).length).toBeGreaterThan(
          0
        );

        unmount();
      }
    }
  });

  it("labels ambient event prompts with their own accessible region name", () => {
    render(
      <AmbientEventToast
        event={{
          id: "rope-duck",
          title: "Skier Under the Rope",
          location: "Bronco Ridge",
          sector: "Main Face",
          coordinates: { x: 1100, y: 700, zone: "main" },
          prompt: "A skier ducks a closure rope ahead of you.",
          options: [
            {
              id: "stop",
              label: "Stop and talk to them",
              consequenceText: "You explain the closure and they ski on.",
            },
            {
              id: "radio",
              label: "Radio it in",
              consequenceText: "Dispatch logs the closure breach.",
            },
          ],
        }}
        onResolveOption={vi.fn()}
        onDismiss={vi.fn()}
      />
    );

    const region = screen.getByRole("region", {
      name: /Patrol Encounter: Skier Under the Rope/i,
    });
    expect(region).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Stop and talk/i })
    ).toBeDefined();
  });
});

describe("Patrol Shift — M10 OET alternative input paths", () => {
  it("offers a step-through mode as a real alternative to the real-time descent", () => {
    render(
      <OetCanvas
        scenario={scenarioFixture}
        onRecordEvent={vi.fn()}
        onArriveAtBase={vi.fn()}
      />
    );

    const toggle = screen.getByRole("button", { name: /Step-Through Mode/i });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(toggle);

    expect(screen.getByTestId("oet-a11y-step-controls")).toBeDefined();
    expect(
      screen
        .getByRole("button", { name: /A11y Step-Through: ON/i })
        .getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("keeps the touch control dock at or above the 48px minimum target size", () => {
    render(
      <OetCanvas
        scenario={scenarioFixture}
        onRecordEvent={vi.fn()}
        onArriveAtBase={vi.fn()}
      />
    );

    const dock = screen.getByTestId("oet-touch-control-dock");
    const buttons = Array.from(dock.querySelectorAll("button"));
    expect(buttons.length).toBeGreaterThan(0);

    for (const button of buttons) {
      const className = button.className;
      expect(className).toMatch(/min-h-\[48px\]/);
      expect(className).toMatch(/min-w-\[48px\]/);
      // touch-action: none, so a drag on the dock never scrolls the page.
      expect(className).toMatch(/touch-none/);
    }
  });
});

describe("Patrol Shift — M10 mobile runtime budgets (AGENTS.md section 16)", () => {
  it("suppresses overlapping backdrop-blur layers below the 768px breakpoint", () => {
    const { container } = render(
      <MountainMap
        incidentsCompleted={0}
        onAwaitDispatch={vi.fn()}
        onCompleteShift={vi.fn()}
      />
    );

    const blurred = Array.from(
      container.querySelectorAll('[class*="backdrop-blur"]')
    );
    expect(blurred.length).toBeGreaterThan(0);

    for (const el of blurred) {
      const className =
        typeof el.className === "string"
          ? el.className
          : (el.getAttribute("class") ?? "");
      const filters = className
        .split(/\s+/)
        .filter((c) => c.includes("backdrop-blur"));
      for (const filter of filters) {
        expect(
          filter,
          `"${filter}" applies a GPU blur on mobile; gate it behind md:`
        ).toMatch(/^(sm|md|lg|xl):/);
      }
    }
  });

  it("throttles descent state commits to 30fps on mobile and leaves desktop uncapped", () => {
    expect(getDescentCommitIntervalMs(true)).toBeCloseTo(
      1000 / DESCENT_COMMIT_FPS_MOBILE,
      5
    );
    expect(getDescentCommitIntervalMs(true)).toBeGreaterThan(1000 / 60);
    expect(getDescentCommitIntervalMs(false)).toBe(0);
  });

  it("schedules no animation-frame loop while the hub sits idle", () => {
    mockMatchMedia((query) => query.includes("max-width: 767px"));

    const rafSpy = vi.spyOn(window, "requestAnimationFrame");

    const { unmount } = render(
      <MountainMap
        incidentsCompleted={0}
        onAwaitDispatch={vi.fn()}
        onCompleteShift={vi.fn()}
      />
    );

    // No descent is running, so the hub must not schedule a per-frame state
    // loop just by being on screen (AGENTS.md section 16).
    expect(rafSpy).not.toHaveBeenCalled();

    unmount();
    expect(rafSpy).not.toHaveBeenCalled();
  });
});

describe("Patrol Shift — M10 reduced motion", () => {
  it("renders every shift entry surface under prefers-reduced-motion: reduce", () => {
    mockMatchMedia((query) => query.includes("prefers-reduced-motion"));

    expect(() => render(<PatrolShiftContainer />)).not.toThrow();
    expect(screen.getByTestId("patrol-shift-container")).toBeDefined();
    expect(screen.getByTestId("patrol-intro-screen")).toBeDefined();
  });
});
