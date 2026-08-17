/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

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

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playSuccess: mockPlaySuccess,
    playNote: mockPlayNote,
    playHover: vi.fn(),
    muted: false,
  }),
  AudioProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockRecordEvent = vi.fn().mockResolvedValue(true);
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: mockRecordEvent,
  }),
}));

vi.mock("@/lib/clinical-trial-chaos/engine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/clinical-trial-chaos/engine")>();
  return {
    ...actual,
    createInitialPowerUpInventory: () => {
      const inventory = actual.createInitialPowerUpInventory();
      inventory["fda-coffee-break"].charge = inventory["fda-coffee-break"].maxCharge;
      return inventory;
    },
    tickPowerUps: (pu: any, deltaSeconds: number) => {
      const updated = actual.tickPowerUps(pu, deltaSeconds);
      if (updated["fda-coffee-break"]) {
        updated["fda-coffee-break"].charge = updated["fda-coffee-break"].maxCharge;
      }
      return updated;
    },
  };
});

let ClinicalTrialChaos: any;

describe("ClinicalTrialChaos React Component UI Suite", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mockStorage: LocalStorageMock;

  beforeEach(async () => {
    const mod = await import("@/components/ClinicalTrialChaos");
    ClinicalTrialChaos = mod.ClinicalTrialChaos;
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
    expect(container.textContent).toContain("FDA AUDITOR SCRUTINY");
    expect(container.textContent).toContain("Score:");
    expect(container.textContent).toContain("COMBO:");
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

    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    expect(startBtn).toBeDefined();

    await act(async () => {
      startBtn?.click();
    });

    expect(mockRecordEvent).toHaveBeenCalledWith("clinical_trial_chaos", "project_click");
    expect(container.textContent).toContain("SUBJ-1001");
  });

  it("should open Multi-Choice Validation Drawer and resolve an observation", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Find and click the observation card with unvalidated prompt
    const validateChoiceEl = Array.from(container.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("Validate Choice")
    );
    expect(validateChoiceEl).toBeDefined();
    const obsCard = validateChoiceEl?.closest(".cursor-pointer") as HTMLElement;
    expect(obsCard).not.toBeNull();

    await act(async () => {
      obsCard.click();
    });

    expect(container.textContent).toContain("CDISC Controlled Terminology Validation");
    expect(container.textContent).toContain("Select Compliant CDISC Standard Value / CT Code");

    // Click the correct choice "180 cm"
    const choiceBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "180 cm"
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
    const sdtmTabBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Live SDTM Studio")
    );
    expect(sdtmTabBtn).toBeDefined();

    await act(async () => {
      sdtmTabBtn?.click();
    });

    expect(container.textContent).toContain("Live CDISC SDTM Dataset Studio");
    expect(container.textContent).toContain("Export CDISC ODM XML");
    expect(container.textContent).toContain("Export SDTM CSV");

    // Switch to Audit Trail tab
    const auditTabBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Audit Trail Log")
    );
    expect(auditTabBtn).toBeDefined();

    await act(async () => {
      auditTabBtn?.click();
    });

    expect(container.textContent).toContain("21 CFR PART 11 IMMUTABLE AUDIT TRAIL");
  });

  it("should open 21 CFR Part 11 signature modal and complete clean submission", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Resolve observation (Height: 180 m -> 180 cm)
    const validateChoiceEl = Array.from(container.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("Validate Choice")
    );
    const obsCard = validateChoiceEl?.closest(".cursor-pointer") as HTMLElement;
    await act(async () => {
      obsCard.click();
    });

    const choiceBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "180 cm"
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

    expect(container.textContent).toContain("21 CFR Part 11 Electronic Signature");

    // Confirm signature
    const confirmBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sign & Lock CRF (Enter)")
    );
    expect(confirmBtn).toBeDefined();

    await act(async () => {
      confirmBtn?.click();
    });

    expect(container.textContent).toContain("Submits:1");

    vi.useRealTimers();
  });

  it("should load existing high score from localStorage", async () => {
    mockStorage.setItem("clinical_chaos_highscore", "9800");

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    expect(container.textContent).toContain("9800");
  });

  it("should activate fda-coffee-break and resume patrolling after 8 seconds", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Trigger coffee break
    const coffeeBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("FDA Coffee Break")
    );
    expect(coffeeBtn).toBeDefined();

    await act(async () => {
      coffeeBtn?.click();
    });

    expect(container.textContent).toContain("COFFEE BREAK");

    // Advance 8 seconds
    await act(async () => {
      vi.advanceTimersByTime(8000);
    });

    expect(container.textContent).toContain("patrolling");

    vi.useRealTimers();
  });

  it("should cancel active coffee break timer immediately upon game restart", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Trigger coffee break
    const coffeeBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("FDA Coffee Break")
    );
    await act(async () => {
      coffeeBtn?.click();
    });

    expect(container.textContent).toContain("COFFEE BREAK");

    // Submit invalid electronic signatures 4 times to reach 100% suspicion
    for (let i = 0; i < 4; i++) {
      const dmHeading = Array.from(container.querySelectorAll("h4")).find((h) =>
        h.textContent?.includes("DM Station")
      );
      const dmStationCard = dmHeading?.closest(".group") as HTMLElement;
      await act(async () => {
        dmStationCard.click();
      });

      const confirmBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Sign & Lock CRF")
      );
      await act(async () => {
        confirmBtn?.click();
      });
    }

    // Advance timers so that the game loop tick transitions playState to game_over
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Now game over screen should be shown
    expect(container.textContent).toContain("FDA FORM 483 ISSUED");

    // Restart the game by clicking Restart
    const restartBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Restart Phase I")
    );
    expect(restartBtn).toBeDefined();
    await act(async () => {
      restartBtn?.click();
    });

    // clearTimeout should be called immediately on restart
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });

  it("should cancel active coffee break timer automatically when component unmounts", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Trigger coffee break
    const coffeeBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("FDA Coffee Break")
    );
    await act(async () => {
      coffeeBtn?.click();
    });

    // Unmount component
    await act(async () => {
      root.unmount();
    });

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });

  it("should cancel existing timer before starting a new one when coffee break is activated in rapid succession", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    // Start campaign
    const startBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Start 3-Phase Campaign")
    );
    await act(async () => {
      startBtn?.click();
    });

    // Trigger coffee break 1
    const coffeeBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("FDA Coffee Break")
    );
    await act(async () => {
      coffeeBtn?.click();
    });

    // Trigger coffee break 2
    await act(async () => {
      coffeeBtn?.click();
    });

    // clearTimeout should have been called on the previous timer
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });
});
