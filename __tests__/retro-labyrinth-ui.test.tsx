/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RetroLabyrinth } from "@/components/RetroLabyrinth";

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
  }),
  AudioProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockRecordEvent = vi.fn().mockResolvedValue(true);
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: mockRecordEvent,
  }),
}));

describe("RetroLabyrinth React Component UI Suite", () => {
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
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      setLineDash: vi.fn(),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as any);
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 240,
      height: 144,
      right: 240,
      bottom: 144,
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

  it("should mount and render roguelike HUD and weapons bar", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    expect(container.textContent).toContain("Graveyard Roguelike");
    expect(container.textContent).toContain("HP");
    expect(container.textContent).toContain("SCORE:");
    expect(container.textContent).toContain("[1] npm i");
    expect(container.textContent).toContain("[2] git push -f");
  });

  it("should render ASCII fallback when isMounted is false", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={false} />);
    });

    expect(container.textContent).toContain("SYSTEM_LABYRINTH.EXE");
    expect(container.textContent).toContain("[INITIALIZING LABYRINTH ENGINE...]");
  });

  it("should enforce keyboard boundary with data-keyboard-boundary='true'", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    const boundary = container.querySelector('[data-keyboard-boundary="true"]');
    expect(boundary).not.toBeNull();
    expect(boundary?.getAttribute("tabIndex")).toBe("0");
  });

  it("should handle weapon switching via hotkeys", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    const boundary = container.querySelector('[data-keyboard-boundary="true"]') as HTMLElement;

    // Press '2' to switch to git push --force
    await act(async () => {
      boundary.dispatchEvent(
        new KeyboardEvent("keydown", { key: "2", bubbles: true, cancelable: true })
      );
    });

    const gitWeaponBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("git push -f")
    );
    expect(gitWeaponBtn?.className).toContain("bg-rose-500/20");
  });

  it("should respond to directional keyboard input", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    const boundary = container.querySelector('[data-keyboard-boundary="true"]') as HTMLElement;

    await act(async () => {
      boundary.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
      );
    });

    expect(mockPlayNote).toHaveBeenCalled();
  });

  it("should load existing high score from localStorage", async () => {
    mockStorage.setItem("retro_labyrinth_highscore", "15400");

    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    expect(container.textContent).toContain("15400");
  });

  it("should render Cyberdeck RAM, Crypto counter, and Class selector", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    expect(container.textContent).toContain("RAM");
    expect(container.textContent).toContain("Script Kiddie");
    expect(container.textContent).toContain("Chips");

    // Click class badge to open class selector modal
    const classBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Script Kiddie")
    );
    await act(async () => {
      classBtn?.click();
    });

    expect(container.textContent).toContain("SELECT CYBERDECK FIRMWARE ARCHETYPE");
    expect(container.textContent).toContain("Cryptanalyst");
    expect(container.textContent).toContain("APT Specialist");
  });

  it("should open Darknet Market modal and show vendor items", async () => {
    await act(async () => {
      root.render(<RetroLabyrinth isMounted={true} />);
    });

    const marketBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Market")
    );
    await act(async () => {
      marketBtn?.click();
    });

    expect(container.textContent).toContain("DARKNET EXPLOIT BLACK-MARKET");
    expect(container.textContent).toContain("Overclocked 16GB DDR5 RAM");
    expect(container.textContent).toContain("Hardware Jumper Bypass Chip");
  });
});

