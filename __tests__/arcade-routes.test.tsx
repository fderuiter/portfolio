/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// Mock ResizeObserver and IntersectionObserver for JSDOM
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

// Mock Canvas 2D context
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
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  setLineDash: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as any);
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 768,
  height: 420,
  right: 768,
  bottom: 420,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

// Mock framer-motion with full proxy and hooks support
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  const Component = ({ children, className, style, onClick, ...props }: any) => (
    <div className={className} style={style} onClick={onClick} {...props}>
      {children}
    </div>
  );
  const Button = ({ children, className, style, onClick, type, ...props }: any) => (
    <button type={type || "button"} className={className} style={style} onClick={onClick} {...props}>
      {children}
    </button>
  );

  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === "button") return Button;
          return Component;
        },
      }
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
    useInView: () => true,
  };
});

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

// Mock Next.js navigation & Link
vi.mock("next/navigation", () => ({
  usePathname: () => "/arcade",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

import ArcadePage from "@/app/arcade/page";
import LaserLoonPage from "@/app/arcade/laser-loon/page";
import QuasiPuzzlerPage from "@/app/arcade/quasi-puzzler/page";
import GarminWatchPage from "@/app/arcade/garmin-watch/page";
import ClinicalChaosPage from "@/app/arcade/clinical-chaos/page";
import RetroLabyrinthPage from "@/app/arcade/retro-labyrinth/page";
import UISandboxPage from "@/app/ui-sandbox/page";

describe("Arcade Dedicated Routes Suite", () => {
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

  it("renders main Arcade Hub with all 5 games listed", async () => {
    await act(async () => {
      root.render(<ArcadePage />);
    });
    
    expect(container.textContent).toContain("Engineering");
    expect(container.textContent).toContain("Arcade Hub");
    expect(container.textContent).toContain("Laser Loon: Cryo Bug Hunter");
    expect(container.textContent).toContain("Quasi-Perfect Puzzler");
    expect(container.textContent).toContain("Garmin Connect IQ 32KB Memory Runner");
    expect(container.textContent).toContain("Clinical Trial Chaos: CDISC Compliance");
    expect(container.textContent).toContain("Retro Labyrinth: Graveyard Roguelike");
  });

  it("renders Laser Loon dedicated game page", async () => {
    await act(async () => {
      root.render(<LaserLoonPage />);
    });
    expect(container.textContent).toContain("Back to Arcade Hub");
    expect(container.textContent).toContain("Laser Loon:");
    expect(container.textContent).toContain("Cryo Bug Hunter");
  });

  it("renders Quasi-Perfect Puzzler dedicated game page", async () => {
    await act(async () => {
      root.render(<QuasiPuzzlerPage />);
    });
    expect(container.textContent).toContain("Back to Arcade Hub");
    expect(container.textContent).toContain("Quasi-Perfect");
    expect(container.textContent).toContain("Puzzler");
  });

  it("renders Garmin Watch Simulator dedicated game page", async () => {
    await act(async () => {
      root.render(<GarminWatchPage />);
    });
    expect(container.textContent).toContain("Back to Arcade Hub");
    expect(container.textContent).toContain("Garmin Connect IQ");
    expect(container.textContent).toContain("32KB Memory Runner");
  });

  it("renders Clinical Trial Chaos dedicated game page", async () => {
    await act(async () => {
      root.render(<ClinicalChaosPage />);
    });
    expect(container.textContent).toContain("Back to Arcade Hub");
    expect(container.textContent).toContain("Clinical Trial Chaos:");
    expect(container.textContent).toContain("CDISC Compliance");
  });

  it("renders Retro Labyrinth dedicated game page", async () => {
    await act(async () => {
      root.render(<RetroLabyrinthPage />);
    });
    expect(container.textContent).toContain("Back to Arcade Hub");
    expect(container.textContent).toContain("Retro Labyrinth:");
    expect(container.textContent).toContain("Graveyard Roguelike");
  });

  it("renders UI Sandbox with links to arcade games", async () => {
    await act(async () => {
      root.render(<UISandboxPage />);
    });
    expect(container.textContent).toContain("Visit Full Arcade Hub");
    expect(container.textContent).toContain("Dedicated Arcade Game Pages");
  });
});
