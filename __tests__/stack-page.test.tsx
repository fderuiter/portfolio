/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { StackOverviewView } from "@/components/stack/StackOverviewView";
import { PretextBenchmarkLab } from "@/components/stack/PretextBenchmarkLab";
import { AudioSynthLab } from "@/components/stack/AudioSynthLab";
import { InvariantsMatrix } from "@/components/stack/InvariantsMatrix";
import { StackLayerCards } from "@/components/stack/StackLayerCards";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe("Stack Overview Page & Components", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    // Canvas 2D Mock according to Invariant #7
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((contextId) => {
      if (contextId === "2d") {
        return {
          font: "",
          measureText: vi.fn((text: string) => ({
            width: (text || "").length * 8,
          })),
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          arc: vi.fn(),
          arcTo: vi.fn(),
          quadraticCurveTo: vi.fn(),
          bezierCurveTo: vi.fn(),
          roundRect: vi.fn(),
        } as any;
      }
      return null;
    });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
    vi.restoreAllMocks();
  });

  it("renders full StackOverviewView page layout with headings and quick links", async () => {
    await act(async () => {
      root?.render(<StackOverviewView />);
    });

    expect(container?.textContent).toContain("Under the Hood:");
    expect(container?.textContent).toContain("The Portfolio Tech Stack");
    expect(container?.textContent).toContain("Layout Physics Lab");
    expect(container?.textContent).toContain("Web Audio Synthesizer");
    expect(container?.textContent).toContain("Stack Layers");
    expect(container?.textContent).toContain("12 Invariants");
    expect(container?.textContent).toContain("Developer Invariant & Verification CLI");
  });

  it("renders PretextBenchmarkLab, dataset selector and triggers benchmark run", async () => {
    vi.useFakeTimers();

    await act(async () => {
      root?.render(<PretextBenchmarkLab />);
    });

    expect(container?.textContent).toContain("Layout Physics Lab: Pretext vs DOM Reflow");
    expect(container?.textContent).toContain("Bento Card Teaser");
    expect(container?.textContent).toContain("Clinical Protocol");
    expect(container?.textContent).toContain("Distributed Consensus AST");

    const runBtn = container?.querySelector("button:has(svg)") as HTMLButtonElement;
    expect(runBtn).not.toBeNull();

    await act(async () => {
      runBtn.click();
    });

    // Advance timer for setTimeout deferred calculation
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(container?.textContent).toContain("@chenglou/pretext");
    expect(container?.textContent).toContain("Standard DOM Reflow");

    vi.useRealTimers();
  });

  it("renders AudioSynthLab with soundboard buttons, volume and profile toggles", async () => {
    await act(async () => {
      root?.render(<AudioSynthLab />);
    });

    expect(container?.textContent).toContain("Web Audio Synthesizer Lab");
    expect(container?.textContent).toContain("Tactile Pop");
    expect(container?.textContent).toContain("Laser Blip");
    expect(container?.textContent).toContain("Success Chord");
    expect(container?.textContent).toContain("Error Buzz");
    expect(container?.textContent).toContain("Keystroke Clack");

    const buttons = container?.querySelectorAll("button");
    expect(buttons && buttons.length).toBeGreaterThanOrEqual(5);

    const laserBtn = Array.from(buttons || []).find((b) => b.textContent?.includes("Laser Blip"));
    expect(laserBtn).toBeDefined();

    if (laserBtn) {
      await act(async () => {
        laserBtn.click();
      });
    }
  });

  it("renders InvariantsMatrix with all 12 invariants, filters and copy functionality", async () => {
    await act(async () => {
      root?.render(<InvariantsMatrix />);
    });

    expect(container?.textContent).toContain("Architectural Invariant Matrix");
    expect(container?.textContent).toContain("12 / 12 Verified");
    expect(container?.textContent).toContain("INV-01");
    expect(container?.textContent).toContain("INV-02");
    expect(container?.textContent).toContain("INV-09");
    expect(container?.textContent).toContain("INV-10");
    expect(container?.textContent).toContain("INV-12");

    // Filter by Accessibility
    const filterBtns = container?.querySelectorAll("button");
    const a11yBtn = Array.from(filterBtns || []).find((b) => b.textContent?.trim() === "Accessibility");
    expect(a11yBtn).toBeDefined();

    if (a11yBtn) {
      await act(async () => {
        a11yBtn.click();
      });
      expect(container?.textContent).toContain("INV-10");
      expect(container?.textContent).toContain("Continuous Accessibility & WCAG 2.1 AA");
      expect(container?.textContent).not.toContain("INV-01");
    }

    // Test copy command button
    const copyBtns = container?.querySelectorAll('button[aria-label^="Copy command"]');
    expect(copyBtns && copyBtns.length).toBeGreaterThan(0);
    if (copyBtns && copyBtns[0]) {
      await act(async () => {
        (copyBtns[0] as HTMLButtonElement).click();
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    }
  });

  it("renders StackLayerCards with all architectural tiers", async () => {
    await act(async () => {
      root?.render(<StackLayerCards />);
    });

    expect(container?.textContent).toContain("Architectural Layers & Tech Stack");
    expect(container?.textContent).toContain("Framework & Edge Runtime");
    expect(container?.textContent).toContain("Design System & Tokens");
    expect(container?.textContent).toContain("Layout Physics & Text Engine");
    expect(container?.textContent).toContain("Database & Edge Caching");
    expect(container?.textContent).toContain("Graphics, Canvas & Web Audio");
    expect(container?.textContent).toContain("Quality, Security & Governance");

    expect(container?.textContent).toContain("Next.js");
    expect(container?.textContent).toContain("Tailwind CSS");
    expect(container?.textContent).toContain("@chenglou/pretext");
    expect(container?.textContent).toContain("Prisma ORM");
    expect(container?.textContent).toContain("Three.js");
    expect(container?.textContent).toContain("Vitest");
  });
});
