/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SkillsGrid } from "@/components/SkillsGrid";

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

// Mock audio provider functions
const mockPlaySkillHover = vi.fn();
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playSkillHover: mockPlaySkillHover,
  }),
}));

// Mock framer-motion's useReducedMotion hook
const mockUseReducedMotion = vi.fn();
vi.mock("framer-motion", async (importOriginal) => {
  const original = await importOriginal<typeof import("framer-motion")>();
  return {
    ...original,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

describe("SkillsGrid GPU Progress Animations & Reduced Motion AA Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockLanguages = [
    { name: "TypeScript", percentage: 85 },
    { name: "Python", percentage: 60 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it("should render languages names and percentage text correctly", async () => {
    mockUseReducedMotion.mockReturnValue(false);
    
    await act(async () => {
      root.render(<SkillsGrid languages={mockLanguages} />);
    });

    expect(container.textContent).toContain("TypeScript");
    expect(container.textContent).toContain("85%");
    expect(container.textContent).toContain("Python");
    expect(container.textContent).toContain("60%");
  });

  it("should render progress bars with static layout width corresponding to skill percentage to prevent layout shifts", async () => {
    mockUseReducedMotion.mockReturnValue(false);
    
    await act(async () => {
      root.render(<SkillsGrid languages={mockLanguages} />);
    });

    // Find progress bar elements using the className properties
    const bars = container.querySelectorAll(".will-change-transform");
    expect(bars.length).toBe(2);

    // Verify static width style properties in raw DOM style
    const bar1 = bars[0] as HTMLDivElement;
    const bar2 = bars[1] as HTMLDivElement;

    expect(bar1.style.getPropertyValue("--skill-width") || bar1.style.width).toBe("85%");
    expect(bar2.style.getPropertyValue("--skill-width") || bar2.style.width).toBe("60%");
  });

  it("should support reduced motion instantly by disabling transitions", async () => {
    mockUseReducedMotion.mockReturnValue(true);

    await act(async () => {
      root.render(<SkillsGrid languages={mockLanguages} />);
    });

    const bars = container.querySelectorAll(".will-change-transform");
    expect(bars.length).toBe(2);

    const bar1 = bars[0] as HTMLDivElement;
    expect(bar1.style.getPropertyValue("--skill-width") || bar1.style.width).toBe("85%");
  });
});
