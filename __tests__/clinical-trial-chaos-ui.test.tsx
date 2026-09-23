/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ClinicalTrialChaos } from "@/components/ClinicalTrialChaos";

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

const mockPlaySuccess = vi.fn();
const mockPlayNote = vi.fn();

vi.mock("@/components/providers/AudioProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/components/providers/AudioProvider")
    >();
  return {
    ...actual,
    useAudio: () => ({
      playSuccess: mockPlaySuccess,
      playNote: mockPlayNote,
      playHover: vi.fn(),
      muted: false,
    }),
    AudioProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockRecordEvent = vi.fn().mockResolvedValue(true);
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: mockRecordEvent,
  }),
}));

describe("ClinicalTrialChaos React Component UI Suite", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mockStorage: LocalStorageMock;

  beforeEach(() => {
    mockStorage = new LocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

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
      arc: vi.fn(),
      ellipse: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      setLineDash: vi.fn(),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as any);
    // Starting a shift scrolls the board into view; JSDOM has no layout to scroll.
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 768,
      height: 140,
      right: 768,
      bottom: 140,
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

  it("should mount with initial HUD, stations, and regulatory lifelines", async () => {
    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    expect(container.textContent).toContain("Clinical Trial Chaos");
    expect(container.textContent).toContain("Score:");
    expect(container.textContent).toContain("Combo:");
    // Idle shows the shift briefing and office picker, not the play area
    expect(container.textContent).toContain("Shift briefing");
    expect(container.textContent).toContain("Pick your office");

    const startBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    expect(container.textContent).toContain("FDA AUDITOR SCRUTINY");
    expect(container.textContent).toContain("SPONSOR SATISFACTION");
    expect(container.textContent).toContain("DM Station");
    expect(container.textContent).toContain("VS Station");
    expect(container.textContent).toContain("FDA Coffee Break");
    expect(container.textContent).toContain("CDISC Auto-Clean");
  });

  it("should enforce keyboard boundary with data-keyboard-boundary='true'", async () => {
    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    const boundary = container.querySelector('[data-keyboard-boundary="true"]');
    expect(boundary).not.toBeNull();
    expect(boundary?.getAttribute("tabIndex")).toBe("0");
  });

  it("should start the campaign when clicking Start 3-Phase Campaign", async () => {
    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    const startBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Start 3-Phase Campaign")
    );
    expect(startBtn).toBeDefined();

    await act(async () => {
      startBtn?.click();
    });

    expect(mockRecordEvent).toHaveBeenCalledWith(
      "clinical_trial_chaos",
      "project_click"
    );
    expect(container.textContent).toContain("SUBJ-1001");
  });

  it("should open Multi-Choice Validation Drawer and resolve an observation", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Find and click the observation card with unvalidated prompt
    const validateChoiceEl = Array.from(
      container.querySelectorAll("span")
    ).find((s) => s.textContent?.includes("Validate Choice"));
    expect(validateChoiceEl).toBeDefined();
    const obsCard = validateChoiceEl?.closest(".cursor-pointer") as HTMLElement;
    expect(obsCard).not.toBeNull();

    await act(async () => {
      obsCard.click();
    });

    expect(container.textContent).toContain(
      "CDISC Controlled Terminology Validation"
    );
    expect(container.textContent).toContain(
      "Select Compliant CDISC Standard Value / CT Code"
    );

    // Click the correct choice "180 cm"
    const choiceBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim().replace(/^\d/, "") === "180 cm"
    );
    expect(choiceBtn).toBeDefined();

    await act(async () => {
      choiceBtn?.click();
    });

    // Advance timer for modal auto-close
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(container.textContent).toContain("180 cm");

    vi.useRealTimers();
  });

  it("should switch between Conveyor Floor, Live SDTM Studio, and Audit Trail tabs", async () => {
    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Switch to Live SDTM Studio tab
    const sdtmTabBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Live SDTM Studio")
    );
    expect(sdtmTabBtn).toBeDefined();

    await act(async () => {
      sdtmTabBtn?.click();
    });

    expect(container.textContent).toContain("Live CDISC SDTM Dataset Studio");
    expect(container.textContent).toContain("Export CDISC ODM XML");
    expect(container.textContent).toContain("Export SDTM CSV");

    // Switch to Audit Trail tab
    const auditTabBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Audit Trail Log")
    );
    expect(auditTabBtn).toBeDefined();

    await act(async () => {
      auditTabBtn?.click();
    });

    expect(container.textContent).toContain(
      "21 CFR PART 11 IMMUTABLE AUDIT TRAIL"
    );
  });

  it("should open 21 CFR Part 11 signature modal and complete clean submission", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Resolve observation (Height: 180 m -> 180 cm)
    const validateChoiceEl = Array.from(
      container.querySelectorAll("span")
    ).find((s) => s.textContent?.includes("Validate Choice"));
    const obsCard = validateChoiceEl?.closest(".cursor-pointer") as HTMLElement;
    await act(async () => {
      obsCard.click();
    });

    const choiceBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim().replace(/^\d/, "") === "180 cm"
    );
    await act(async () => {
      choiceBtn?.click();
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Open signature modal via DM Station
    const dmHeading = Array.from(container.querySelectorAll("h4")).find((h) =>
      h.textContent?.includes("DM Station")
    );
    expect(dmHeading).toBeDefined();
    const dmStationCard = dmHeading?.closest(".group") as HTMLElement;

    await act(async () => {
      dmStationCard.click();
    });

    expect(container.textContent).toContain(
      "21 CFR Part 11 Electronic Signature"
    );

    // Confirm signature
    const confirmBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Sign & Lock CRF (Enter)")
    );
    expect(confirmBtn).toBeDefined();

    await act(async () => {
      confirmBtn?.click();
    });

    expect(container.textContent).toContain("Submits:1");

    vi.useRealTimers();
  });

  it("does not start a shift when Enter is pressed on a focused briefing button", async () => {
    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    const officeCard = Array.from(
      container.querySelectorAll('[role="radio"]')
    ).find((b) =>
      b.textContent?.includes("Big Pharma Glass Tower")
    ) as HTMLElement;
    expect(officeCard).toBeDefined();

    await act(async () => {
      officeCard.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
    });

    expect(container.textContent).toContain("Shift briefing");
    expect(mockRecordEvent).not.toHaveBeenCalled();

    // Enter on the board itself still starts the shift
    const board = container.querySelector(
      '[data-keyboard-boundary="true"]'
    ) as HTMLElement;
    await act(async () => {
      board.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
    });
    expect(mockRecordEvent).toHaveBeenCalledWith(
      "clinical_trial_chaos",
      "project_click"
    );
  });

  it("should load existing high score from localStorage", async () => {
    mockStorage.setItem("clinical_chaos_highscore", "9800");

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    expect(container.textContent).toContain("9800");
  });

  it("should freeze conveyor subject timers when Controlled Terminology Drawer or Signature Modal is open, and resume immediately on close", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Helper to tick fake timers in small steps asynchronously to allow recursive animation frames to execute
    const tickGame = async (totalMs: number, stepMs = 250) => {
      for (let elapsed = 0; elapsed < totalMs; elapsed += stepMs) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(stepMs);
        });
      }
    };

    // Verify initial time is 40s
    expect(container.textContent).toContain("40s");

    // Let 2.5 seconds pass
    await tickGame(2500, 100);

    // Timer should have ticked down to 38s (40 - 2.5 = 37.5 -> Math.ceil = 38)
    expect(container.textContent).toContain("38s");

    // Find and click the observation card to open multi-choice validation drawer
    const validateChoiceEl = Array.from(
      container.querySelectorAll("span")
    ).find((s) => s.textContent?.includes("Validate Choice"));
    const obsCard = validateChoiceEl?.closest(".cursor-pointer") as HTMLElement;
    await act(async () => {
      obsCard.click();
    });

    expect(container.textContent).toContain(
      "CDISC Controlled Terminology Validation"
    );

    // Let another 3 seconds pass while drawer is open
    await tickGame(3000, 100);

    // The timer should still show 38s (since game loop frame delta is 0 seconds when drawer is open)
    expect(container.textContent).toContain("38s");

    // Close the drawer using the close button
    const closeBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Close")
    );
    await act(async () => {
      closeBtn?.click();
    });

    // Let another 2.0 seconds pass after closing drawer
    await tickGame(2000, 100);

    // Timer should now have ticked down to 36s (37.5 - 2.0 = 35.5 -> Math.ceil = 36)
    expect(container.textContent).toContain("36s");

    // Open signature modal via DM Station
    const dmHeading = Array.from(container.querySelectorAll("h4")).find((h) =>
      h.textContent?.includes("DM Station")
    );
    const dmStationCard = dmHeading?.closest(".group") as HTMLElement;
    await act(async () => {
      dmStationCard.click();
    });

    expect(container.textContent).toContain(
      "21 CFR Part 11 Electronic Signature"
    );

    // Let another 4 seconds pass while signature modal is open
    await tickGame(4000, 100);

    // The timer should still show 36s (frozen frame delta)
    expect(container.textContent).toContain("36s");

    // Cancel signature modal (Close/Cancel)
    const cancelBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Cancel")
    );
    await act(async () => {
      cancelBtn?.click();
    });

    // Let another 1 second pass after closing signature modal
    await tickGame(1000, 100);

    // Timer should now tick down to 35s
    expect(container.textContent).toContain("35s");

    vi.useRealTimers();
  }, 15000);
});
