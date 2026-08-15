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

  it("renders the main puzzler scaffold and Chapter 1 Level 1 initial state", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    expect(container.textContent).toContain("Quasi-Perfect Puzzler");
    expect(container.textContent).toContain("The Identity Crisis");
    expect(container.textContent).toContain("Chapter 1 · Equational Reasoning");
    expect(container.textContent).toContain("16.0 / 16 GB");
    expect(container.textContent).toContain("rfl");
    expect(container.textContent).toContain("Lean 4 Proof Script");
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

    // Click the root goal node
    const goalNode = container.querySelector('[data-node-id="eq-lvl1"]') as HTMLElement;
    expect(goalNode).not.toBeNull();

    await act(async () => {
      goalNode.click();
    });

    // Check Victory Modal is displayed
    expect(container.textContent).toContain("Q.E.D. · THEOREM VERIFIED");
    expect(container.textContent).toContain("The Identity Crisis");
    expect(container.textContent).toContain("15.0 GB");
  });

  it("toggles and interacts with the Progressive Hints system", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    // Toggle Hints On
    const hintsButton = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Hints")
    );
    expect(hintsButton).toBeDefined();

    await act(async () => {
      hintsButton?.click();
    });

    expect(container.textContent).toContain("Interactive Proof Coach · Progressive Hints");
    expect(container.textContent).toContain("Tier 1 · Strategy Clue");
    expect(container.textContent).toContain("Every mathematical object is equal to itself");

    // Reveal Tier 2 Hint
    const revealButton = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Reveal Next Hint")
    );
    expect(revealButton).toBeDefined();

    await act(async () => {
      revealButton?.click();
    });

    expect(container.textContent).toContain("Tier 2 · Subtree Target Focus");
  });

  it("toggles Sandbox Mode with unlimited RAM", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    // Click Sandbox button
    const sandboxButton = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sandbox")
    );
    expect(sandboxButton).toBeDefined();

    await act(async () => {
      sandboxButton?.click();
    });

    expect(container.textContent).toContain("Theorem Playground & AST Sandbox");
    expect(container.textContent).toContain("Unlimited RAM");
    expect(container.textContent).toContain("Preset 1");
  });

  it("switches tabs in the Lean IDE Inspector and browses Tactic Encyclopedia", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    expect(container.textContent).toContain("theorem identity_crisis");

    // Switch to Encyclopedia tab
    const encButton = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Tactic Encyclopedia")
    );
    expect(encButton).toBeDefined();

    await act(async () => {
      encButton?.click();
    });

    expect(container.textContent).toContain("tactic");
    expect(container.textContent).toContain("RAM Cost:");
  });

  it("filters levels by chapter", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<QuasiPerfectPuzzler />);
    });

    const ch2Button = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Ch 2: Logic")
    );
    expect(ch2Button).toBeDefined();

    await act(async () => {
      ch2Button?.click();
    });

    // Level 5 should be visible in chapter 2
    expect(container.textContent).toContain("L5");
    expect(container.textContent).toContain("L6");
    expect(container.textContent).toContain("L7");
    expect(container.textContent).toContain("L8");
  });
});
