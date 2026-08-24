import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  getSimulatorForCaseStudy,
  getCaseStudyForGame,
  validateRegistry,
} from "@/lib/arcade-registry";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { ArcadeHubClient } from "@/components/arcade/ArcadeHubClient";
import { CaseStudyHeroActions } from "@/components/CaseStudyHeroActions";
import { TerminologyProvider } from "@/components/providers/TerminologyProvider";
import { BentoLayoutProvider } from "@/components/providers/BentoLayoutContext";

// Mock Next.js router & hooks
vi.mock("next/navigation", () => ({
  usePathname: () => "/arcade",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      div: ({
        children,
        className,
        style,
        ...props
      }: React.HTMLAttributes<HTMLDivElement>) => (
        <div className={className} style={style} {...props}>
          {children}
        </div>
      ),
    },
  };
});

describe("Typed Arcade Registry & Bento Dual-CTA Action Bar", () => {
  afterEach(() => {
    cleanup();
  });

  describe("1. Registry Validation & Integrity (Requirement 1)", () => {
    it("validates registry integrity with zero routing errors", () => {
      const result = validateRegistry();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("resolves bidirectional mappings for every case study with a simulator", () => {
      const caseStudiesWithSimulators = [
        "laser-loon",
        "clinical-data-mapper",
        "polyglot-tsp",
        "ualbf",
        "duckdeploy",
        "crf-xl",
        "inbody-qr-decoder",
      ];

      for (const slug of caseStudiesWithSimulators) {
        const sim = getSimulatorForCaseStudy(slug);
        expect(sim).not.toBeNull();
        expect(sim?.simulatorRoute).toMatch(/^\/(arcade|simulator)/);
        expect(sim?.caseStudyRoute).toBe(`/case-studies/${slug}`);

        const gameMapping = getCaseStudyForGame(sim?.gameId);
        expect(gameMapping).not.toBeNull();
        expect(gameMapping?.caseStudySlug).toBe(slug);
      }
    });

    it("validates that all fallback case study records with available simulators map to registry routes", () => {
      for (const cs of FALLBACK_CASE_STUDIES) {
        const reg = getSimulatorForCaseStudy(cs.slug);
        if (reg) {
          expect(cs.interactive_url).toBe(reg.simulatorRoute);
          expect(cs.interactive_label).toBe(reg.ctaLabel);
        }
      }
    });
  });

  describe("2. Bento Cards Dual-CTA Rendering (Requirements 2 & 5, AC 2 & 3)", () => {
    it("renders both 'Read Case Study' and 'Launch Simulator' CTAs for case studies with linked simulators", () => {
      const laserLoonStudy = FALLBACK_CASE_STUDIES.find(
        (cs) => cs.slug === "laser-loon"
      )!;
      expect(laserLoonStudy).toBeDefined();

      const hydratedStudy = { ...laserLoonStudy, githubStats: null };

      render(
        <TerminologyProvider>
          <BentoLayoutProvider>
            <CaseStudyBentoCard study={hydratedStudy} />
          </BentoLayoutProvider>
        </TerminologyProvider>
      );

      const readCta = screen.getByRole("link", { name: /read case study/i });
      expect(readCta).toBeDefined();
      expect(readCta.getAttribute("href")).toBe("/case-studies/laser-loon");

      const launchCta = screen.getByRole("link", { name: /launch/i });
      expect(launchCta).toBeDefined();
      expect(launchCta.getAttribute("href")).toBe("/arcade/laser-loon");
      expect(launchCta.className).toContain("text-brand-cyan");
    });

    it("renders ONLY the 'Read Case Study' CTA for case studies without linked simulators", () => {
      const plainStudy = FALLBACK_CASE_STUDIES.find(
        (cs) => cs.slug === "wedding-website"
      )!;
      expect(plainStudy).toBeDefined();

      const hydratedStudy = { ...plainStudy, githubStats: null };

      render(
        <TerminologyProvider>
          <BentoLayoutProvider>
            <CaseStudyBentoCard study={hydratedStudy} />
          </BentoLayoutProvider>
        </TerminologyProvider>
      );

      const readCta = screen.getByRole("link", { name: /read case study/i });
      expect(readCta).toBeDefined();
      expect(readCta.getAttribute("href")).toBe(
        "/case-studies/wedding-website"
      );

      const launchCta = screen.queryByRole("link", { name: /launch/i });
      expect(launchCta).toBeNull();
    });
  });

  describe("3. Arcade Hub Game Cards Case Study Links (Requirement 3, AC 4)", () => {
    it("renders a direct link leading directly to the corresponding case study route on game cards", () => {
      render(
        <TerminologyProvider>
          <ArcadeHubClient />
        </TerminologyProvider>
      );

      const caseStudyLinks = screen.getAllByRole("link", {
        name: /read.*case study/i,
      });
      expect(caseStudyLinks.length).toBeGreaterThan(0);

      const laserLoonCsLink = caseStudyLinks.find(
        (link) => link.getAttribute("href") === "/case-studies/laser-loon"
      );
      expect(laserLoonCsLink).toBeDefined();

      const duckCsLink = caseStudyLinks.find(
        (link) => link.getAttribute("href") === "/case-studies/duckdeploy"
      );
      expect(duckCsLink).toBeDefined();
    });
  });

  describe("4. Case Study Hero Actions Registry Consumption (Requirement 4 & 5, AC 5)", () => {
    it("launches registered interactive simulators using cyan CTA styling", () => {
      render(
        <CaseStudyHeroActions
          slug="polyglot-tsp"
          githubUrl="https://github.com/fderuiter/polyglot-tsp"
        />
      );

      const launchCta = screen.getByRole("link", { name: /launch simulator/i });
      expect(launchCta).toBeDefined();
      expect(launchCta.getAttribute("href")).toBe("/arcade/retro-labyrinth");
      expect(launchCta.className).toContain("text-brand-cyan");
      expect(launchCta.className).toContain("bg-brand-cyan/10");
    });
  });

  describe("5. Mobile Touch Target Accessibility (Guardrails, AC 6)", () => {
    it("ensures all dual CTA buttons measure at least 44px in height on mobile viewports", () => {
      const laserLoonStudy = FALLBACK_CASE_STUDIES.find(
        (cs) => cs.slug === "laser-loon"
      )!;
      const hydratedStudy = { ...laserLoonStudy, githubStats: null };

      render(
        <TerminologyProvider>
          <BentoLayoutProvider>
            <CaseStudyBentoCard study={hydratedStudy} />
          </BentoLayoutProvider>
        </TerminologyProvider>
      );

      const readCta = screen.getByRole("link", { name: /read case study/i });
      expect(readCta.className).toContain("min-h-[44px]");

      const launchCta = screen.getByRole("link", { name: /launch/i });
      expect(launchCta.className).toContain("min-h-[44px]");
    });
  });
});
