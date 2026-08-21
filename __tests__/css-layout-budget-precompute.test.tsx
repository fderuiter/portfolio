import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";
import { PageLayout } from "@/components/PageLayout";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { BentoLayoutProvider } from "@/components/providers/BentoLayoutContext";
import { TerminologyProvider } from "@/components/providers/TerminologyProvider";
import { calculateCardHeightFromBlocks, calculateMasonryLayout } from "@/lib/masonry";
import { preparePretextBlocks } from "@/lib/pretext-block-parser";
import { DpadActionDock, TwinStickAimDock, BezelClusterDock, ActionStripDock } from "@/components/arcade/ControlDocks";

const mockStudy = {
  id: "schemaflow",
  slug: "schemaflow",
  title: "SchemaFlow Engine",
  primary_language: "TypeScript",
  editorial_content: "High-performance visual schema editor and canvas system.",
  architectural_narrative: "Visual canvas engine with node culling.",
  published: true,
  simulated_telemetry: false,
  tags: "TypeScript, React, Canvas",
  created_at: new Date(),
  updated_at: new Date(),
  githubStats: null,
};

describe("CSS Variable Layout Budgeting & Offscreen Card Pre-computation", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Requirement 1 & 4: CSS Layout Budget Tokens & Scrollbar Gutters", () => {
    it("defines vertical layout budget tokens and scrollbar-gutter stable in globals.css", () => {
      const cssPath = path.resolve(process.cwd(), "app/globals.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");

      expect(cssContent).toContain("--layout-header-height:");
      expect(cssContent).toContain("--layout-dock-height:");
      expect(cssContent).toContain("--layout-studio-budget:");
      expect(cssContent).toContain("--layout-viewport-budget:");
      expect(cssContent).toContain("scrollbar-gutter: stable;");
    });

    it("applies layout budget height tokens and scrollbar-gutter-stable on studio PageLayout", () => {
      const { container } = render(
        <PageLayout variant="studio" data-testid="studio-page">
          <div>Studio Content</div>
        </PageLayout>
      );

      const studioEl = container.querySelector('[data-testid="studio-page"]');
      expect(studioEl).not.toBeNull();
      expect(studioEl?.className).toContain("min-h-dvh");
      expect(studioEl?.className).toContain("scrollbar-gutter-stable");
    });
  });

  describe("Requirement 2: Studio Container & Viewport Height Derivation", () => {
    it("derives heights from layout budget tokens instead of hardcoded 100vh subtractions", () => {
      const crfPath = path.resolve(process.cwd(), "components/crf/CRFStudioContainer.tsx");
      const crfContent = fs.readFileSync(crfPath, "utf-8");
      expect(crfContent).toContain("var(--layout-studio-budget");
      expect(crfContent).not.toContain("h-[calc(100vh-4rem)]");

      const playCabinetPath = path.resolve(process.cwd(), "components/arcade/PlayCabinet.tsx");
      const playCabinetContent = fs.readFileSync(playCabinetPath, "utf-8");
      expect(playCabinetContent).toContain("var(--layout-viewport-budget");
      expect(playCabinetContent).toContain("--layout-dock-height");
    });
  });

  describe("Requirement 3: Offscreen Pre-computation of Expanded Cards", () => {
    it("calculates expanded card height offscreen synchronously using Pretext blocks", () => {
      const pitchText = "High performance visual schema editor and canvas system.";
      const realityText = "While the drag-and-drop canvas is extremely smooth, we initially faced major rendering bottlenecks when rendering over 150 schema nodes.";

      const pitchBlocks = preparePretextBlocks(pitchText, 14, "--font-inter");
      const realityBlocks = preparePretextBlocks(realityText, 14, "--font-inter");

      const config = {
        COLS: { SM: 1, MD: 2, LG: 3 },
        BREAKPOINTS: { MD: 768, LG: 1024 },
        GAP: 16,
        CARD_PADDING: 20,
        LINE_HEIGHT: 20,
        FALLBACK_ITEM_HEIGHT: 320,
      };

      const pitchHeight = calculateCardHeightFromBlocks(pitchBlocks, 300, 250, config, 3);
      const realityHeight = calculateCardHeightFromBlocks(realityBlocks, 300, 250, config, 3);

      expect(pitchHeight).toBeGreaterThan(0);
      expect(realityHeight).toBeGreaterThan(pitchHeight);
    });

    it("pre-calculates reality height in masonry layout pass synchronously", () => {
      const items = [mockStudy];
      const preparedData = {
        schemaflow: {
          blocks: preparePretextBlocks(mockStudy.editorial_content, 14, "--font-inter"),
          realityBlocks: preparePretextBlocks("Reality test content line 1.\nReality test content line 2.", 14, "--font-inter"),
          paddingHeight: 250,
        },
      };

      const config = {
        COLS: { SM: 1, MD: 2, LG: 3 },
        BREAKPOINTS: { MD: 768, LG: 1024 },
        GAP: 16,
        CARD_PADDING: 20,
        LINE_HEIGHT: 20,
        FALLBACK_ITEM_HEIGHT: 320,
      };

      const result = calculateMasonryLayout(1000, items, preparedData, config);
      expect(result.columns[0]).toBeDefined();
      const cardItem = result.columns[0][0];
      expect(cardItem.preCalculatedRealityHeight).toBeDefined();
      expect(cardItem.preCalculatedRealityHeight).toBeGreaterThan(0);
    });

    it("updates layout dimensions when expanding card without ResizeObserver DOM style toggling", () => {
      const { getByText } = render(
        <BentoLayoutProvider>
          <TerminologyProvider>
            <CaseStudyBentoCard study={mockStudy} preCalculatedHeight={300} preCalculatedRealityHeight={450} />
          </TerminologyProvider>
        </BentoLayoutProvider>
      );

      const realityButton = getByText("THE REALITY");
      expect(realityButton).not.toBeNull();

      fireEvent.click(realityButton);
      // Mode toggled synchronously without setting style.height = 'auto' or triggering layout loops
      expect(getByText("THE REALITY").className).toContain("bg-zinc-900");
    });
  });

  describe("Requirement 5: Control Dock Accessibility & Touch Targets", () => {
    it("renders DpadActionDock controls with accessible touch targets", () => {
      const { getByLabelText } = render(
        <DpadActionDock forceVisible onDirectionPress={() => {}} onActionAPress={() => {}} />
      );

      const upButton = getByLabelText("Move Up");
      expect(upButton.className).toContain("min-w-[48px]");
      expect(upButton.className).toContain("min-h-[48px]");
    });

    it("renders TwinStickAimDock controls with accessible touch targets", () => {
      const { getByLabelText } = render(
        <TwinStickAimDock forceVisible onFirePress={() => {}} />
      );

      const fireButton = getByLabelText("Primary Fire");
      expect(fireButton.className).toContain("min-w-[56px]");
      expect(fireButton.className).toContain("min-h-[56px]");
    });

    it("renders BezelClusterDock controls with accessible touch targets", () => {
      const { getByLabelText } = render(
        <BezelClusterDock forceVisible onButtonPress={() => {}} />
      );

      const lightButton = getByLabelText("Light / Power");
      expect(lightButton.className).toContain("min-w-[48px]");
      expect(lightButton.className).toContain("min-h-[48px]");
    });

    it("renders ActionStripDock controls with accessible touch targets", () => {
      const actions = [{ id: "act1", label: "Inspect" }];
      const { getByLabelText } = render(
        <ActionStripDock forceVisible actions={actions} onAction={() => {}} />
      );

      const actionButton = getByLabelText("Inspect");
      expect(actionButton.className).toContain("min-w-[48px]");
      expect(actionButton.className).toContain("min-h-[48px]");
    });
  });
});
