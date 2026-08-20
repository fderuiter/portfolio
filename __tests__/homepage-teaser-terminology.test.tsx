// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  ProjectTeaserGrid,
  resolveSnippetTerminology,
} from "@/components/ProjectTeaserGrid";
import { TerminologyProvider } from "@/components/providers/TerminologyProvider";
import { TerminologyToggle } from "@/components/TerminologyToggle";
import { BaseCaseStudy } from "@/types/domain";

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    volume: 0.5,
    muted: false,
    profile: "8-bit",
    playHover: vi.fn(),
    playSubmit: vi.fn(),
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playAutocomplete: vi.fn(),
  }),
}));

describe("Homepage Teaser Snippet Terminology Swap Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.clear();
  });

  const sampleCompiledContent =
    'An enterprise-grade **TypeScript** mapping pipeline that transforms raw `<span data-key="edc" data-term="digital trial forms" data-definition="def">Electronic Data Capture (EDC)</span>` datasets into compliant **<span data-key="cdisc-sdtm" data-term="standardized study domain tables" data-definition="Format for study datasets.">CDISC SDTM</span>** domains.';

  const sampleCaseStudy: BaseCaseStudy = {
    id: "cs-1",
    slug: "clinical-mapper",
    title: "Clinical Data Mapper & Compliance Engine",
    primary_language: "TypeScript",
    editorial_content: sampleCompiledContent,
    architectural_narrative: "Narrative content",
    tags: "clinical,typescript",
    published: true,
    simulated_telemetry: false,
    github_url: "https://github.com/fderuiter/clinical-mapper",
    commands_json: null,
    playback_json: null,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  };

  describe("resolveSnippetTerminology Pure Utility", () => {
    it("swaps compiled jargon tags for simplified terms when simplified is true", () => {
      const resolved = resolveSnippetTerminology(sampleCompiledContent, true);
      expect(resolved).toContain("standardized study domain tables");
      expect(resolved).toContain("digital trial forms");
      expect(resolved).not.toContain("CDISC SDTM");
      expect(resolved).not.toContain("Electronic Data Capture (EDC)");
      expect(resolved).not.toContain("data-key");
      expect(resolved).not.toContain("<span");
    });

    it("preserves unsimplified technical terms when simplified is false", () => {
      const resolved = resolveSnippetTerminology(sampleCompiledContent, false);
      expect(resolved).toContain("CDISC SDTM");
      expect(resolved).toContain("Electronic Data Capture (EDC)");
      expect(resolved).not.toContain("standardized study domain tables");
      expect(resolved).not.toContain("digital trial forms");
      expect(resolved).not.toContain("data-key");
      expect(resolved).not.toContain("<span");
    });

    it("unescapes HTML entities in term attributes and inner text", () => {
      const entityContent =
        'Lead for <span data-key="ecrf" data-term="digital &quot;case report&quot; form" data-definition="def">eCRF &amp; GxP</span> systems.';
      const simplifiedResolved = resolveSnippetTerminology(entityContent, true);
      expect(simplifiedResolved).toContain('digital "case report" form');
      expect(simplifiedResolved).not.toContain("&quot;");

      const technicalResolved = resolveSnippetTerminology(entityContent, false);
      expect(technicalResolved).toContain("eCRF & GxP");
      expect(technicalResolved).not.toContain("&amp;");
    });

    it("strips leftover raw HTML markup cleanly", () => {
      const dirtyContent =
        'Text with <a href="/foo">link</a> and <br/> breaks and <span data-key="test" data-term="simple" data-definition="d">jargon</span>.';
      const resolved = resolveSnippetTerminology(dirtyContent, true);
      expect(resolved).toBe("Text with link and  breaks and simple.");
      expect(resolved).not.toContain("<");
      expect(resolved).not.toContain(">");
    });
  });

  describe("ProjectTeaserGrid Component Integration", () => {
    it("renders unsimplified technical terms by default when simplified mode is inactive", async () => {
      await act(async () => {
        root.render(
          <TerminologyProvider>
            <ProjectTeaserGrid caseStudies={[sampleCaseStudy]} />
          </TerminologyProvider>
        );
      });

      const cardText = container.textContent || "";
      expect(cardText).toContain("CDISC SDTM");
      expect(cardText).toContain("Electronic Data Capture (EDC)");
      expect(cardText).not.toContain("standardized study domain tables");
      expect(cardText).not.toContain("digital trial forms");
      expect(cardText).not.toContain("data-key=");
      expect(container.innerHTML).not.toContain("&lt;span");
    });

    it("dynamically updates teaser card text when toggling simplified terminology mode", async () => {
      await act(async () => {
        root.render(
          <TerminologyProvider>
            <TerminologyToggle />
            <ProjectTeaserGrid caseStudies={[sampleCaseStudy]} />
          </TerminologyProvider>
        );
      });

      // Before toggle: technical terms
      expect(container.textContent).toContain("CDISC SDTM");

      // Click terminology toggle
      const toggleButton = container.querySelector("button")!;
      await act(async () => {
        toggleButton.click();
      });

      // After toggle: simplified terms
      const updatedText = container.textContent || "";
      expect(updatedText).toContain("standardized study domain tables");
      expect(updatedText).toContain("digital trial forms");
      expect(updatedText).not.toContain("CDISC SDTM");
      expect(updatedText).not.toContain("Electronic Data Capture (EDC)");
    });

    it("calculates character truncation boundary after post-substitution text replacement", async () => {
      // Long string where term replacement alters overall character length
      const longCompiledContent =
        'An enterprise-grade **TypeScript** mapping pipeline that ingests clinical trial metadata in <span data-key="cdisc-odm" data-term="standardized clinical trial data exchange format specification for regulatory submissions" data-definition="def">CDISC ODM</span> format, dynamically constructs data schemas, and transforms raw <span data-key="edc" data-term="digital trial forms" data-definition="def">EDC</span> datasets into compliant <span data-key="cdisc-sdtm" data-term="standardized study domain tables" data-definition="def">CDISC SDTM</span> domains for biostatistical analysis and FDA review.';

      const longStudy: BaseCaseStudy = {
        ...sampleCaseStudy,
        editorial_content: longCompiledContent,
      };

      await act(async () => {
        root.render(
          <TerminologyProvider>
            <ProjectTeaserGrid caseStudies={[longStudy]} />
          </TerminologyProvider>
        );
      });

      // Confirm no raw HTML attributes appear in truncated text
      expect(container.textContent).not.toContain("data-key");
      expect(container.textContent).not.toContain("data-term");
      expect(container.innerHTML).not.toContain("&lt;span");

      // Should end with ellipsis '...' when truncated
      expect(container.textContent).toContain("...");
    });

    it("preserves markdown bold and code elements in card snippets", async () => {
      await act(async () => {
        root.render(
          <TerminologyProvider>
            <ProjectTeaserGrid caseStudies={[sampleCaseStudy]} />
          </TerminologyProvider>
        );
      });

      const strongEl = container.querySelector("strong");
      const codeEl = container.querySelector("code");

      expect(strongEl).not.toBeNull();
      expect(strongEl?.textContent).toBe("TypeScript");

      expect(codeEl).not.toBeNull();
      expect(codeEl?.textContent).toContain("Electronic Data Capture (EDC)");
    });
  });
});
