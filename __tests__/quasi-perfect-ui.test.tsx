/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QuasiPerfectPuzzler } from "@/components/QuasiPerfectPuzzler";

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

// Mock AudioProvider
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playSuccess: vi.fn(),
    playHover: vi.fn(),
  }),
  AudioProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("QuasiPerfectPuzzler UI Component Suite", () => {
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
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("renders the main puzzler scaffold and Level 1 initial state", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    expect(container.textContent).toContain("Quasi-Perfect Puzzler");
    expect(container.textContent).toContain("The Identity Crisis");
    expect(container.textContent).toContain("16.0 / 16 GB");
    expect(container.textContent).toContain("LEAN RAM NOMINAL");
    expect(container.textContent).toContain("rfl");
  });

  it("solves Level 1 by applying the rfl tactic and displaying the victory modal", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    // Find and click the 'rfl' tactic card
    const rflCard = container.querySelector('[data-tactic-id="rfl"]') as HTMLElement;
    expect(rflCard).not.toBeNull();

    await act(async () => {
      rflCard.click();
    });

    // Click the root goal node or target
    const goalNode = container.querySelector('[data-node-id="eq-lvl1"]') as HTMLElement;
    expect(goalNode).not.toBeNull();

    await act(async () => {
      goalNode.click();
    });

    // Check Victory Modal is displayed
    expect(container.textContent).toContain("Q.E.D. · Theorem Verified");
    expect(container.textContent).toContain("FORMAL VERIFICATION VERIFIED");
    expect(container.textContent).toContain("15.0 GB"); // 16 - 1 GB = 15 GB
  });

  it("handles Level navigation and loads Level 2 hypotheses", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    // Find and click Level 2 button
    const buttons = Array.from(container.querySelectorAll("button"));
    const l2Button = buttons.find((b) => b.textContent?.includes("L2"));
    expect(l2Button).toBeDefined();

    await act(async () => {
      l2Button?.click();
    });

    expect(container.textContent).toContain("The Art of Substitution");
    expect(container.textContent).toContain("Active Hypotheses Context (Γ)");
    expect(container.textContent).toContain("h1:");
    expect(container.textContent).toContain("h2:");
    expect(container.textContent).toContain("rw [h1]");
    expect(container.textContent).toContain("rw [h2]");
  });

  it("triggers the morality penalty when using the sorry escape hatch", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    // Find and click 'sorry' tactic card
    const sorryCard = container.querySelector('[data-tactic-id="sorry"]') as HTMLElement;
    expect(sorryCard).not.toBeNull();

    await act(async () => {
      sorryCard.click();
    });

    // Click target node
    const goalNode = container.querySelector('[data-node-id="eq-lvl1"]') as HTMLElement;
    expect(goalNode).not.toBeNull();

    await act(async () => {
      goalNode.click();
    });

    // Check Morality Warning
    expect(container.textContent).toContain("MATHEMATICAL MORALITY VIOLATION");
    expect(container.textContent).toContain("PROVED VIA SORRY");
    expect(container.textContent).toContain("-100");
  });

  it("supports Reset and Undo actions", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    const resetButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Reset")
    );
    expect(resetButton).toBeDefined();

    await act(async () => {
      resetButton?.click();
    });

    expect(container.textContent).toContain("16.0 / 16 GB");
  });
});
