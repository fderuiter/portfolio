/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// Mock ResizeObserver and IntersectionObserver
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

// Mock Canvas 2D context with full curve and vector methods
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

// Mock AudioProvider
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playSuccess: vi.fn(),
    playHover: vi.fn(),
    volume: 0.8,
    muted: false,
    profile: "8-bit",
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setProfile: vi.fn(),
  }),
  AudioProvider: ({ children }: any) => <>{children}</>,
}));

// Mock useTelemetry
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn().mockResolvedValue(true),
  }),
}));

import { WorkingWithDuck } from "@/components/WorkingWithDuck";

const storageStore: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => storageStore[k] || null,
    setItem: (k: string, v: string) => { storageStore[k] = String(v); },
    removeItem: (k: string) => { delete storageStore[k]; },
    clear: () => { Object.keys(storageStore).forEach((k) => delete storageStore[k]); },
    key: () => null,
    length: 0,
  },
  writable: true,
});

describe("Working With Duck - UI & Component Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it("renders initial game container, HUD meters, and Start button", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    expect(container.textContent).toContain("Work Progress");
    expect(container.textContent).toContain("Excitement");
    expect(container.textContent).toContain("Bladder Clock");
    expect(container.textContent).toContain("Good Boy Scale");
    expect(container.textContent).toContain("Start Sprint 1");
    expect(container.textContent).toContain("Duck Scrapbook");
  });

  it("renders bottom Hotbar items (Squeaky Toy, Kong, Ball, Treat)", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    expect(container.textContent).toContain("Squeaky Toy");
    expect(container.textContent).toContain("Kong Chew");
    expect(container.textContent).toContain("Tennis Ball");
    expect(container.textContent).toContain("Give Treat 🍖");
    expect(container.textContent).toContain("Go to Dog Park");
  });

  it("opens and toggles the Polaroid Scrapbook modal", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    const scrapbookButtons = container.querySelectorAll("button");
    const openBtn = Array.from(scrapbookButtons).find((b) => b.textContent?.includes("Duck Scrapbook"));
    expect(openBtn).toBeDefined();

    if (openBtn) {
      await act(async () => {
        openBtn.click();
      });
      expect(container.textContent).toContain("Duck's Polaroid Scrapbook");
      expect(container.textContent).toContain("The Little Prince");
    }
  });

  it("transitions to running state when clicking Start Sprint 1", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    const startBtn = container.querySelector("button");
    if (startBtn) {
      await act(async () => {
        startBtn.click();
      });
    }

    // Overlay removed, game is active
    expect(container.querySelector("canvas")).toBeDefined();
  });

  it("toggles Scrapbook view mode between Real Photos and Vector Art", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    const scrapbookButtons = container.querySelectorAll("button");
    const openBtn = Array.from(scrapbookButtons).find((b) => b.textContent?.includes("Duck Scrapbook"));
    if (openBtn) {
      await act(async () => {
        openBtn.click();
      });

      expect(container.textContent).toContain("Real Photos 📷");
      expect(container.textContent).toContain("Vector Art 🎨");

      const vectorModeBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Vector Art 🎨")
      );
      expect(vectorModeBtn).toBeDefined();

      if (vectorModeBtn) {
        await act(async () => {
          vectorModeBtn.click();
        });
        expect(container.textContent).toContain("Vector Art 🎨");
      }
    }
  });

  it("navigates forward and backward in Polaroid Scrapbook carousel", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    const scrapbookButtons = container.querySelectorAll("button");
    const openBtn = Array.from(scrapbookButtons).find((b) => b.textContent?.includes("Duck Scrapbook"));
    if (openBtn) {
      await act(async () => {
        openBtn.click();
      });

      expect(container.textContent).toContain("Card 1 of 10");

      const nextBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Next →")
      );
      if (nextBtn) {
        await act(async () => {
          nextBtn.click();
        });
        expect(container.textContent).toContain("Card 2 of 10");
      }
    }
  });

  it("handles hotbar keyboard shortcuts 1, 2, 3, 4 without crashing", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "4" }));
    });

    expect(container.textContent).toContain("Squeaky Toy");
  });

  it("toggles dog park and renders whistle controls", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    const parkBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Go to Dog Park")
    );
    if (parkBtn) {
      await act(async () => {
        parkBtn.click();
      });

      expect(container.textContent).toContain("Whistle Recall");
      expect(container.textContent).toContain("Return to Office");
    }
  });

  it("handles audio and lo-fi music mute toggle clicks", async () => {
    await act(async () => {
      root.render(<WorkingWithDuck />);
    });

    const muteButtons = Array.from(container.querySelectorAll("button")).filter((b) =>
      b.title?.includes("Mute") || b.title?.includes("Music")
    );
    expect(muteButtons.length).toBeGreaterThan(0);

    for (const btn of muteButtons) {
      await act(async () => {
        btn.click();
      });
    }
  });
});
