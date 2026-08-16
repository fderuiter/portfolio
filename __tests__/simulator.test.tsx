// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import RecruiterSimulator from "@/app/simulator/page";

// Mock dependencies
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn(),
  }),
}));

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playSuccess: vi.fn(),
  }),
}));

describe("RecruiterSimulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a function as default", () => {
    expect(typeof RecruiterSimulator).toBe("function");
  });

  it("renders the simulator cards with layout containment and stacking context isolation classes", () => {
    const { container } = render(<RecruiterSimulator />);
    const cards = container.querySelectorAll(".card-isolate-contain");
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      // Must contain: layout containment and localized stacking context
      expect(card.className).toContain("card-isolate-contain");
      // Must fall back to solid color bg below 768px
      expect(card.className).toContain("bg-zinc-900");
      expect(card.className).toContain("backdrop-blur-none");
      // Must use translucent blurred styles for desktop
      expect(card.className).toContain("md:bg-zinc-900/40");
      expect(card.className).toContain("md:backdrop-blur-2xl");
    });
  });

  it("renders ambient dynamic background glows with hidden class on mobile devices", () => {
    const { container } = render(<RecruiterSimulator />);
    const glowDivs = container.querySelectorAll('[class*="bg-brand-cyan/5"], [class*="bg-brand-blue/5"]');
    expect(glowDivs.length).toBeGreaterThan(0);
    glowDivs.forEach((div) => {
      expect(div.className).toContain("hidden");
      expect(div.className).toContain("lg:block");
    });
  });
});
