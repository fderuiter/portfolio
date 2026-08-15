/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

  it("should mount with initial HUD and CDISC domain station layout", async () => {
    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    expect(container.textContent).toContain("Clinical Trial Chaos");
    expect(container.textContent).toContain("FDA AUDITOR SCRUTINY");
    expect(container.textContent).toContain("Score:");
    expect(container.textContent).toContain("COMBO:");
    expect(container.textContent).toContain("DM Station");
    expect(container.textContent).toContain("VS Station");
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

  it("should fix an observation discrepancy via validation drawer", async () => {
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

    // Find and click the observation card containing "Fix Typo"
    const fixTypoEl = Array.from(container.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("Fix Typo")
    );
    expect(fixTypoEl).toBeDefined();
    const obsCard = fixTypoEl?.closest(".cursor-pointer") as HTMLElement;
    expect(obsCard).not.toBeNull();

    await act(async () => {
      obsCard.click();
    });

    expect(container.textContent).toContain("Standardize & Clean Data");

    // Click Clean Data button
    const cleanBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Standardize & Clean Data")
    );
    expect(cleanBtn).toBeDefined();

    await act(async () => {
      cleanBtn?.click();
    });

    expect(container.textContent).toContain("180 cm");
  });

  it("should open 21 CFR Part 11 Electronic Signature modal when routing clean subject", async () => {
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

    // Fix observation (Height: 180 m -> 180 cm)
    const fixTypoEl = Array.from(container.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("Fix Typo")
    );
    const obsCard = fixTypoEl?.closest(".cursor-pointer") as HTMLElement;
    await act(async () => {
      obsCard.click();
    });

    const cleanBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Standardize & Clean Data")
    );
    await act(async () => {
      cleanBtn?.click();
    });

    // Route to DM Station
    const dmHeading = Array.from(container.querySelectorAll("h4")).find((h) =>
      h.textContent?.includes("DM Station")
    );
    expect(dmHeading).toBeDefined();
    const dmStationCard = dmHeading?.closest(".group") as HTMLElement;
    expect(dmStationCard).not.toBeNull();

    await act(async () => {
      dmStationCard.click();
    });

    expect(container.textContent).toContain("21 CFR Part 11 Electronic Signature");
    expect(container.textContent).toContain("Intent to Submit");
  });

  it("should complete electronic signature and submit dataset successfully", async () => {
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

    // Fix observation (Height: 180 m -> 180 cm)
    const fixTypoEl = Array.from(container.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("Fix Typo")
    );
    const obsCard = fixTypoEl?.closest(".cursor-pointer") as HTMLElement;
    await act(async () => {
      obsCard.click();
    });

    const cleanBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Standardize & Clean Data")
    );
    await act(async () => {
      cleanBtn?.click();
    });

    // Open signature modal via DM Station
    const dmHeading = Array.from(container.querySelectorAll("h4")).find((h) =>
      h.textContent?.includes("DM Station")
    );
    const dmStationCard = dmHeading?.closest(".group") as HTMLElement;
    await act(async () => {
      dmStationCard.click();
    });

    // Confirm signature
    const confirmBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sign & Lock CRF (Enter)")
    );
    expect(confirmBtn).toBeDefined();

    await act(async () => {
      confirmBtn?.click();
    });

    expect(container.textContent).toContain("Clean Submits:1");
  });

  it("should load existing high score from localStorage", async () => {
    mockStorage.setItem("clinical_chaos_highscore", "9800");

    await act(async () => {
      root.render(<ClinicalTrialChaos />);
    });

    expect(container.textContent).toContain("9800");
  });
});
