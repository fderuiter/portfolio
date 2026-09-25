// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import { Hero } from "@/components/Hero";
import { TextReveal } from "@/components/TextReveal";

const mockUseReducedMotion = vi.fn().mockReturnValue(false);
vi.mock("framer-motion", async (importOriginal) => {
  const original = await importOriginal<typeof import("framer-motion")>();
  return {
    ...original,
    useReducedMotion: () => mockUseReducedMotion(),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock AudioProvider
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playSkillHover: vi.fn(),
    playSuccess: vi.fn(),
  }),
}));

// Mock AnimatedGridPattern
vi.mock("@/components/AnimatedGridPattern", () => ({
  AnimatedGridPattern: () => <div data-testid="animated-grid-pattern" />,
}));

describe("[UI/UX 01] Homepage First Impression & Architectural Hierarchy Suite", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("1. Hero Value Copy & Grounded Editorial Positioning", () => {
    it("uses the approved location caption in the existing desktop-only cue", () => {
      render(<Hero />);

      const locationCaption = screen.getByText("LOC: Minneapolis");
      expect(locationCaption.parentElement?.className).toContain(
        "hidden lg:flex"
      );
      expect(screen.queryByText("LOC: ROCHESTER & NYC")).toBeNull();
    });

    it("renders the clear, grounded headline and intro without exaggerated absolute claims", () => {
      render(<Hero />);

      // Headline and identity badge
      expect(
        screen.getByText(/FREDERICK DE RUITER \/ SOFTWARE & SYSTEMS/i)
      ).toBeDefined();
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Hi, I’m Fred\. I make complicated things usable\./i,
        })
      ).toBeDefined();

      // Semantic heading presentation maintains consistent editorial typography (#817, ADR 0052)
      const headingElement = screen.getByRole("heading", { level: 1 });
      expect(headingElement.className).toContain("heading-editorial");

      // Intro text: single authentic semantic body layer (#817, ADR 0052)
      const introText = document.querySelector('[data-pretext-layer="body"]');
      expect(introText).not.toBeNull();
      expect(introText?.textContent).toContain(
        "My background is in clinical research"
      );

      // Invariant telemetry badges state honest scope rather than absolute claims
      expect(screen.getByText(/TRY THE DEMOS/i)).toBeDefined();
      expect(screen.getByText(/CLINICAL OPERATIONS EXPERIENCE/i)).toBeDefined();
      expect(screen.getByText(/SOURCE ON GITHUB/i)).toBeDefined();

      // Absolutes must not be present
      const heroContainer = document.getElementById("hero");
      const textContent = heroContainer?.textContent || "";
      expect(textContent).not.toContain("ZERO LATENCY");
      expect(textContent).not.toContain("ZERO BLOAT");
      expect(textContent).not.toContain("ZERO JARGON GUARANTEE");
      expect(textContent).not.toContain("doesn't break");
    });

    it("presents one clear primary action pointing directly to case studies", () => {
      render(<Hero />);

      const primaryCta = screen.getByRole("link", { name: /Explore My Work/i });
      expect(primaryCta.getAttribute("href")).toBe("#case-studies");
      expect(primaryCta.className).toContain("bg-amber-400");
      expect(primaryCta.className).toContain("min-h-[48px]");
      expect(primaryCta.className).toContain("focus-visible:ring-2");
      expect(primaryCta.className).toContain("focus-visible:ring-amber-400");
    });

    it("pairs secondary actions with visible focus rings, minimum touch heights, and accessible labels", () => {
      render(<Hero />);

      const arcadeLink = screen.getByRole("link", { name: /Arcade & Labs/i });
      expect(arcadeLink.getAttribute("href")).toBe("/arcade");
      expect(arcadeLink.className).toContain("min-h-[44px]");
      expect(arcadeLink.className).toContain("focus-visible:ring-amber-400");

      const githubLink = screen.getByRole("link", { name: /GitHub/i });
      expect(githubLink.getAttribute("href")).toBe(
        "https://github.com/fderuiter"
      );
      expect(githubLink.className).toContain("min-h-[44px]");
      expect(githubLink.className).toContain("focus-visible:ring-amber-400");
    });
  });

  describe("2. Interactive Engineering Console Telemetry & States", () => {
    it("renders all 3 illustrative demo tabs with tablist accessibility", () => {
      render(<Hero />);

      const tablist = screen.getByRole("tablist", {
        name: /Interactive Systems Demos/i,
      });
      expect(tablist).toBeDefined();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      expect(tabs[0].textContent).toContain("Logic");
      expect(tabs[1].textContent).toContain("Clinical");
      expect(tabs[2].textContent).toContain("Memory");
    });

    it("allows switching tabs and displays illustrative, non-absolute metrics", async () => {
      render(<Hero />);

      // Default tab: Logic
      expect(screen.getByText(/ONE SMALL LOGIC PROOF/i)).toBeDefined();
      expect(screen.getByText(/RULE: MODUS PONENS/i)).toBeDefined();

      // Switch to Clinical tab
      const clinicalTab = screen.getByRole("tab", { name: /Clinical/i });
      fireEvent.click(clinicalTab);

      await waitFor(() => {
        expect(screen.getByText(/A CLINICAL FORM CHECK/i)).toBeDefined();
      });
      expect(screen.getByText(/DEMO RULE/i)).toBeDefined();

      // Switch to Memory tab
      const memoryTab = screen.getByRole("tab", { name: /Memory/i });
      fireEvent.click(memoryTab);

      await waitFor(() => {
        expect(screen.getByText(/SMARTWATCH RUNTIME/i)).toBeDefined();
      });
      expect(screen.getByText(/32KB MEMORY BUDGET/i)).toBeDefined();
      expect(screen.getByText(/Simulated allocation/i)).toBeDefined();

      // Verify spec strip labels demo as illustrative
      expect(screen.getByText(/ILLUSTRATIVE DEMO/i)).toBeDefined();
      expect(screen.getByText(/TRY THE CONTROLS/i)).toBeDefined();
    });

    it("provides visible focus rings and minimum touch heights across all interactive buttons", () => {
      render(<Hero />);

      const tabs = screen.getAllByRole("tab");
      for (const tab of tabs) {
        expect(tab.className).toContain("focus-visible:ring-2");
        expect(tab.className).toContain("min-h-11");
      }

      const proveBtn = screen.getByRole("button", {
        name: /Apply the Rule/i,
      });
      expect(proveBtn.className).toContain("min-h-11");
      expect(proveBtn.className).toContain("focus-visible:ring-2");
      expect(proveBtn.className).toContain("focus-visible:ring-amber-400");
    });

    it("links each roving tab to its labelled panel and automatically selects the focused tab", () => {
      render(<Hero />);

      const logicTab = screen.getByRole("tab", { name: /Logic/i });
      const clinicalTab = screen.getByRole("tab", { name: /Clinical/i });
      const memoryTab = screen.getByRole("tab", { name: /Memory/i });

      expect(logicTab.getAttribute("id")).toBe("hero-demo-tab-logic");
      expect(logicTab.getAttribute("aria-controls")).toBe(
        "hero-demo-panel-logic"
      );
      expect(logicTab.getAttribute("tabindex")).toBe("0");
      expect(clinicalTab.getAttribute("tabindex")).toBe("-1");
      expect(memoryTab.getAttribute("tabindex")).toBe("-1");
      for (const tab of [logicTab, clinicalTab, memoryTab]) {
        expect(
          document.getElementById(tab.getAttribute("aria-controls") ?? "")
        ).not.toBe(null);
      }
      expect(
        screen
          .getByRole("tabpanel", { name: /Logic/i })
          .getAttribute("aria-labelledby")
      ).toBe("hero-demo-tab-logic");

      logicTab.focus();
      fireEvent.keyDown(logicTab, { key: "ArrowRight" });
      expect(document.activeElement).toBe(clinicalTab);
      expect(clinicalTab.getAttribute("aria-selected")).toBe("true");

      fireEvent.keyDown(clinicalTab, { key: "End" });
      expect(document.activeElement).toBe(memoryTab);
      expect(memoryTab.getAttribute("aria-selected")).toBe("true");

      fireEvent.keyDown(memoryTab, { key: "Home" });
      expect(document.activeElement).toBe(logicTab);
      expect(logicTab.getAttribute("aria-selected")).toBe("true");
    });

    it("resets each illustrative demo locally and announces the reset", () => {
      vi.useFakeTimers();
      render(<Hero />);

      fireEvent.click(screen.getByRole("button", { name: /Apply the Rule/i }));
      expect(screen.getByText(/Illustrative result: Q follows/i)).toBeDefined();
      fireEvent.click(
        screen.getByRole("button", { name: /Reset Logic Demo/i })
      );
      expect(screen.getByText(/Awaiting inference/i)).toBeDefined();
      expect(
        screen.getByText(/Logic demo reset/i).getAttribute("aria-live")
      ).toBe("polite");

      fireEvent.click(screen.getByRole("tab", { name: /Clinical/i }));
      fireEvent.click(
        screen.getByRole("button", {
          name: /Illustrative Integrity Rule: Active/i,
        })
      );
      fireEvent.click(
        screen.getByRole("button", { name: /Reset Clinical Demo/i })
      );
      expect(
        screen.getByRole("button", {
          name: /Illustrative Integrity Rule: Active/i,
        })
      ).toBeDefined();
      expect(
        screen.getByText(/Clinical demo reset/i).getAttribute("aria-live")
      ).toBe("polite");

      fireEvent.click(screen.getByRole("tab", { name: /Memory/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Clean Memory \(GC\)/i })
      );
      act(() => {
        vi.advanceTimersByTime(400);
      });
      fireEvent.click(
        screen.getByRole("button", { name: /Reset Memory Demo/i })
      );
      expect(screen.getByText(/18\.4 KB \/ 32\.0 KB/i)).toBeDefined();
      expect(
        screen.getByText(/Memory demo reset/i).getAttribute("aria-live")
      ).toBe("polite");
      vi.useRealTimers();
    });
  });

  describe("3. Philosophy TextReveal & Reduced Motion Governance", () => {
    it("renders readable text content in the philosophy statement with standard section padding", () => {
      const statement =
        "Good software makes complexity understandable. I build for the people who depend on it, and the details that earn their trust.";
      const { container } = render(<TextReveal>{statement}</TextReveal>);

      expect(container.textContent).toContain(
        "Good software makes complexity understandable"
      );
      const rootDiv = container.firstElementChild as HTMLElement;
      expect(rootDiv.className).toContain("py-16");
      expect(rootDiv.className).not.toContain("h-[100vh]");
      expect(rootDiv.className).not.toContain("h-[75vh]");
      expect(rootDiv.className).not.toContain("xl:lg-3");
    });

    it("honors reduced motion by rendering a calm static layout with identical section rhythm", () => {
      mockUseReducedMotion.mockReturnValue(true);

      const statement =
        "Good software makes complexity understandable. I build for the people who depend on it, and the details that earn their trust.";
      const { container } = render(<TextReveal>{statement}</TextReveal>);

      const rootDiv = container.firstElementChild as HTMLElement;
      expect(rootDiv.className).not.toContain("h-[100vh]");
      expect(rootDiv.className).not.toContain("h-[75vh]");
      expect(rootDiv.className).toContain("py-16");
    });
  });
});
