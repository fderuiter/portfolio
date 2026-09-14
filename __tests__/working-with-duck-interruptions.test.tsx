/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
//
// Test suite for DUCK-01 (#602): Suspend gameplay during manual and reading interruptions.
// Drives the real <WorkingWithDuck /> component through its real RAF loop and engine.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

global.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

global.IntersectionObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

const mockCtx = {
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
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arcTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  roundRect: vi.fn(),
  rect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 40 })),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  setLineDash: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as any);
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 800,
  height: 500,
  right: 800,
  bottom: 500,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playSuccess: vi.fn(),
    playHover: vi.fn(),
    volume: 0.8,
    muted: true,
    profile: "8-bit",
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setProfile: vi.fn(),
  }),
  AudioProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn().mockResolvedValue(true),
  }),
}));

import { WorkingWithDuck } from "@/components/WorkingWithDuck";
import {
  createInitialDuckGameState,
  enterDogPark,
  enterBathtub,
} from "@/lib/working-with-duck-engine";

const storageStore: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => storageStore[k] || null,
    setItem: (k: string, v: string) => {
      storageStore[k] = String(v);
    },
    removeItem: (k: string) => {
      delete storageStore[k];
    },
    clear: () => {
      Object.keys(storageStore).forEach((k) => delete storageStore[k]);
    },
    key: () => null,
    length: 0,
  },
  writable: true,
});

async function clickByText(container: HTMLElement, text: string | RegExp) {
  const btn = Array.from(container.querySelectorAll("button")).find((b) =>
    typeof text === "string"
      ? b.textContent?.includes(text)
      : text.test(b.textContent || "")
  );
  expect(btn).toBeDefined();
  await act(async () => {
    btn!.focus();
    btn!.click();
  });
  return btn!;
}

function firstByTitle(container: HTMLElement, title: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[title="${title}"]`);
  expect(el).not.toBeNull();
  return el!;
}

async function clickEl(el: HTMLElement) {
  await act(async () => {
    el.focus();
    el.click();
  });
}

function readMeterPercent(container: HTMLElement, ariaLabel: string): number {
  const bar = container.querySelector(`[aria-label="${ariaLabel}"]`);
  expect(bar).not.toBeNull();
  return Number(bar!.getAttribute("aria-valuenow"));
}

function readWorkProgressPercent(container: HTMLElement): number {
  return readMeterPercent(container, "Work Progress");
}

function readBladderPercent(container: HTMLElement): number {
  return readMeterPercent(container, "Duck Bladder Clock Meter");
}

const FRAME_MS = 1000 / 60;

describe("Working With Duck - Interruption Suspension (DUCK-01)", () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  let rafCallback: { current: FrameRequestCallback | null };
  let originalRaf: typeof window.requestAnimationFrame;
  let originalCancelRaf: typeof window.cancelAnimationFrame;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.keys(storageStore).forEach((k) => delete storageStore[k]);
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.95);
    rafCallback = { current: null };
    originalRaf = window.requestAnimationFrame;
    originalCancelRaf = window.cancelAnimationFrame;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      rafCallback.current = cb;
      return 1;
    }) as any;
    window.cancelAnimationFrame = (() => {}) as any;

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    randomSpy.mockRestore();
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  async function advanceFrames(count: number, startTimestamp: number = 0) {
    let ts = startTimestamp;
    for (let i = 0; i < count; i++) {
      ts += i === 0 && startTimestamp === 0 ? 0 : FRAME_MS;
      const cb = rafCallback.current;
      expect(cb).not.toBeNull();
      await act(async () => {
        cb!(ts);
      });
    }
    return ts;
  }

  it("suspends simulation progress when scrapbook is opened during running play and resumes when closed", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // Open scrapbook
    const scrapbookBtn = firstByTitle(container, "Duck Scrapbook & Facts");
    await clickEl(scrapbookBtn);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    const progressAtOpen = readWorkProgressPercent(container);
    const bladderAtOpen = readBladderPercent(container);
    expect(progressAtOpen).toBeGreaterThan(0);
    expect(bladderAtOpen).toBeGreaterThan(0);

    // Advance 60 frames while scrapbook is open
    ts = await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBe(progressAtOpen);
    expect(readBladderPercent(container)).toBe(bladderAtOpen);

    // Close scrapbook dialog
    const closeBtn = container.querySelector(
      '[role="dialog"] button'
    ) as HTMLElement;
    expect(closeBtn).not.toBeNull();
    await clickEl(closeBtn);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    // Advance 60 frames after closing
    await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBeGreaterThan(progressAtOpen);
    expect(readBladderPercent(container)).toBeGreaterThan(bladderAtOpen);
  });

  it("suspends simulation progress when wardrobe is opened during running play and resumes when closed", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // Open wardrobe
    const wardrobeBtn = firstByTitle(container, "Duck Wardrobe & Accessories");
    await clickEl(wardrobeBtn);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    const progressAtOpen = readWorkProgressPercent(container);
    const bladderAtOpen = readBladderPercent(container);
    expect(progressAtOpen).toBeGreaterThan(0);
    expect(bladderAtOpen).toBeGreaterThan(0);

    // Advance 60 frames while wardrobe is open
    ts = await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBe(progressAtOpen);
    expect(readBladderPercent(container)).toBe(bladderAtOpen);

    // Close wardrobe dialog
    const closeBtn = container.querySelector(
      '[role="dialog"] button'
    ) as HTMLElement;
    expect(closeBtn).not.toBeNull();
    await clickEl(closeBtn);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    // Advance 60 frames after closing
    await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBeGreaterThan(progressAtOpen);
    expect(readBladderPercent(container)).toBeGreaterThan(bladderAtOpen);
  });

  it("toggles manual pause via keyboard shortcut 'P' and pause overlay with zero progress during pause", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // Ensure container has focus for keyboard shortcuts
    const gameContainer = container.querySelector<HTMLElement>(
      '[data-keyboard-boundary="true"]'
    )!;
    expect(gameContainer).not.toBeNull();
    gameContainer.focus();

    // Press 'P' to pause
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "p",
          bubbles: true,
          cancelable: true,
        })
      );
    });

    // Pause overlay should be displayed
    const pauseOverlay = container.querySelector(
      '[data-testid="duck-pause-overlay"]'
    );
    expect(pauseOverlay).not.toBeNull();

    const progressAtPause = readWorkProgressPercent(container);
    const bladderAtPause = readBladderPercent(container);

    // Advance 60 frames while paused
    ts = await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBe(progressAtPause);
    expect(readBladderPercent(container)).toBe(bladderAtPause);

    // Click Resume Sprint button on the pause overlay
    const resumeBtn = pauseOverlay!.querySelector("button")!;
    expect(resumeBtn).not.toBeNull();
    await clickEl(resumeBtn);

    // Pause overlay should now be dismissed
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).toBeNull();

    // Advance 60 frames after resuming
    await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBeGreaterThan(progressAtPause);
    expect(readBladderPercent(container)).toBeGreaterThan(bladderAtPause);
  });

  it("toggles manual pause via desktop and mobile header pause buttons", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // Desktop pause button
    const desktopPauseBtn = container.querySelector<HTMLElement>(
      'button[title="Pause Sprint (P)"]'
    );
    expect(desktopPauseBtn).not.toBeNull();
    await clickEl(desktopPauseBtn!);

    // Overlay is up and desktop button now says Resume
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).not.toBeNull();
    expect(
      container.querySelector('button[title="Resume Sprint (P)"]')
    ).not.toBeNull();

    const progressAtPause = readWorkProgressPercent(container);
    ts = await advanceFrames(60, ts);
    expect(readWorkProgressPercent(container)).toBe(progressAtPause);

    // Click Desktop Resume button
    const desktopResumeBtn = container.querySelector<HTMLElement>(
      'button[title="Resume Sprint (P)"]'
    )!;
    await clickEl(desktopResumeBtn);

    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).toBeNull();
    await advanceFrames(60, ts);
    expect(readWorkProgressPercent(container)).toBeGreaterThan(progressAtPause);
  });

  it("suspends play when document becomes hidden and resumes when visible", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // Simulate tab backgrounding
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    const progressAtHidden = readWorkProgressPercent(container);
    const bladderAtHidden = readBladderPercent(container);

    // Advance 60 frames while hidden
    ts = await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBe(progressAtHidden);
    expect(readBladderPercent(container)).toBe(bladderAtHidden);

    // Return to visible tab
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Advance 60 frames after returning
    await advanceFrames(60, ts);

    expect(readWorkProgressPercent(container)).toBeGreaterThan(
      progressAtHidden
    );
    expect(readBladderPercent(container)).toBeGreaterThan(bladderAtHidden);
  });

  it("handles overlapping interruption reasons: closing scrapbook does not override active manual pause", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // 1. Manually pause via button
    const pauseBtn = container.querySelector<HTMLElement>(
      'button[title="Pause Sprint (P)"]'
    )!;
    await clickEl(pauseBtn);
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).not.toBeNull();

    // 2. Open scrapbook while manually paused
    const scrapbookBtn = firstByTitle(container, "Duck Scrapbook & Facts");
    await clickEl(scrapbookBtn);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    const progressFrozen = readWorkProgressPercent(container);

    // 3. Close scrapbook: manual pause MUST persist!
    const closeBtn = container.querySelector(
      '[role="dialog"] button'
    ) as HTMLElement;
    await clickEl(closeBtn);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    // Pause overlay must still be active!
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).not.toBeNull();

    // Advance frames: simulation must stay frozen!
    ts = await advanceFrames(60, ts);
    expect(readWorkProgressPercent(container)).toBe(progressFrozen);

    // 4. Finally resume manual pause
    const resumeBtn = container.querySelector<HTMLElement>(
      'button[title="Resume Sprint (P)"]'
    )!;
    await clickEl(resumeBtn);
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).toBeNull();

    // Now play resumes
    await advanceFrames(60, ts);
    expect(readWorkProgressPercent(container)).toBeGreaterThan(progressFrozen);
  });

  it("handles overlapping interruption reasons: closing wardrobe does not override tab-hidden", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    let ts = await advanceFrames(60, 0);

    // 1. Open wardrobe
    const wardrobeBtn = firstByTitle(container, "Duck Wardrobe & Accessories");
    await clickEl(wardrobeBtn);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    // 2. Document hidden while reading wardrobe
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    const progressFrozen = readWorkProgressPercent(container);

    // 3. Close wardrobe while still hidden
    const closeBtn = container.querySelector(
      '[role="dialog"] button'
    ) as HTMLElement;
    await clickEl(closeBtn);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    // Still hidden: must NOT resume!
    ts = await advanceFrames(60, ts);
    expect(readWorkProgressPercent(container)).toBe(progressFrozen);

    // 4. Tab becomes visible: now all interruptions cleared!
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Resumes!
    await advanceFrames(60, ts);
    expect(readWorkProgressPercent(container)).toBeGreaterThan(progressFrozen);
  });

  it("preserves idle state: opening/closing dialogs during idle never transitions status to running", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    // Verify initially in idle
    expect(container.querySelector("button")?.textContent).toContain(
      "Start Sprint 1"
    );

    // Pause button is disabled during idle
    const pauseBtn = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Pause Sprint (P)"]'
    )!;
    expect(pauseBtn).not.toBeNull();
    expect(pauseBtn.disabled).toBe(true);

    // Open and close scrapbook from idle overlay
    const scrapbookBtn = firstByTitle(container, "Duck Scrapbook & Facts");
    await clickEl(scrapbookBtn);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    const closeBtn = container.querySelector(
      '[role="dialog"] button'
    ) as HTMLElement;
    await clickEl(closeBtn);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    // Status MUST remain idle! Start Sprint button still present!
    expect(container.querySelector("button")?.textContent).toContain(
      "Start Sprint 1"
    );
    expect(readWorkProgressPercent(container)).toBe(0);

    // Background and restore tab: still idle!
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(container.querySelector("button")?.textContent).toContain(
      "Start Sprint 1"
    );
  });

  it("preserves terminal states: opening/closing scrapbook during won or failed state never resumes", async () => {
    const wonState = createInitialDuckGameState(1, "campaign");
    wonState.status = "won";

    await act(async () => {
      root.render(<WorkingWithDuck initialState={wonState} />);
    });

    // Verify won screen is showing
    expect(container.textContent).toContain("Completed!");

    // Open scrapbook
    const scrapbookBtn = firstByTitle(container, "Duck Scrapbook & Facts");
    await clickEl(scrapbookBtn);
    expect(
      container.querySelectorAll('[role="dialog"]').length
    ).toBeGreaterThan(0);

    // Close scrapbook
    const closeBtn = Array.from(
      container.querySelectorAll('[role="dialog"] button')
    ).find((b) => b.querySelector("svg")) as HTMLElement;
    expect(closeBtn).not.toBeNull();
    await clickEl(closeBtn);

    // Won screen must still be present!
    expect(container.textContent).toContain("Completed!");
  });

  it("preserves Dog Park progress during interruption and resumes without resetting state", async () => {
    const state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    const parkState = enterDogPark(state);

    await act(async () => {
      root.render(<WorkingWithDuck initialState={parkState} />);
    });

    // Advance 30 frames in dog park
    const ts = await advanceFrames(30, 0);

    // Pause via keyboard
    const gameContainer = container.querySelector<HTMLElement>(
      '[data-keyboard-boundary="true"]'
    )!;
    gameContainer.focus();
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "p",
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).not.toBeNull();

    // Advance 60 frames while paused
    await advanceFrames(60, ts);

    // Resume
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "p",
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).toBeNull();

    // Verify we are still in the dog park (Whistle and Agility Jump buttons visible)
    expect(container.textContent).toContain("Agility Jump");
    expect(container.textContent).toContain("Whistle");
  });

  it("preserves Bathtub progress during interruption and resumes without resetting state", async () => {
    const state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    const bathState = enterBathtub(state);
    bathState.bathtubState.soapLather = 35;

    await act(async () => {
      root.render(<WorkingWithDuck initialState={bathState} />);
    });

    expect(container.textContent).toContain("Shower Rinse Spray");

    // Open scrapbook
    const sbBtn = firstByTitle(container, "Duck Scrapbook & Facts");
    await clickEl(sbBtn);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    // Close scrapbook
    const sbClose = container.querySelector(
      '[role="dialog"] button'
    ) as HTMLElement;
    await clickEl(sbClose);

    // Still in bathtub!
    expect(container.textContent).toContain("Shower Rinse Spray");
  });

  it("eliminates catch-up burst: resuming after a long wall-clock interruption advances by only one fixed step on the first frame", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);

    // Frame 1 primes the clock
    await act(async () => {
      rafCallback.current!(0);
    });
    const afterFirstFrame = readWorkProgressPercent(container);

    // Manually pause
    const pauseBtn = container.querySelector<HTMLElement>(
      'button[title="Pause Sprint (P)"]'
    )!;
    await clickEl(pauseBtn);
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).not.toBeNull();

    // Simulate 120 seconds of wall-clock time passing while paused
    await act(async () => {
      rafCallback.current!(120000);
    });

    // Resume
    const resumeBtn = container.querySelector<HTMLElement>(
      'button[title="Resume Sprint (P)"]'
    )!;
    await clickEl(resumeBtn);
    expect(
      container.querySelector('[data-testid="duck-pause-overlay"]')
    ).toBeNull();

    // Advance first frame after resuming with a new timestamp
    await act(async () => {
      rafCallback.current!(120000 + FRAME_MS);
    });

    const afterResumeFirstFrame = readWorkProgressPercent(container);

    // Progress delta on the very first frame must be bounded to <= 1 step, NOT a burst of hundreds of steps!
    expect(afterResumeFirstFrame - afterFirstFrame).toBeLessThanOrEqual(2);
  });

  it("cleans up event listeners and timers cleanly on unmount", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await clickByText(container, /Start Sprint 1/);
    await advanceFrames(10, 0);

    // Unmount
    await act(async () => {
      root.unmount();
    });

    // Dispatching events after unmount must not throw or warn
    expect(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "p" }));
    }).not.toThrow();
  });
});
