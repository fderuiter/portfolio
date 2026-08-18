import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { CommitSparkline } from "@/components/CommitSparkline";
import { PretextRichText, parseMarkdownToRichItems } from "@/hooks/usePretextLayout";
import { CaseStudyBentoCard } from "@/components/ui/CaseStudyBentoCard";
import { TerminologyProvider } from "@/components/providers/TerminologyProvider";
import { BentoLayoutProvider } from "@/components/providers/BentoLayoutContext";
import fs from "fs";
import path from "path";

describe("CSS Variable Injection for Sparklines and Pretext Overlays", () => {
  it("Requirement 1 & Criterion 2: CommitSparkline linearGradients reference CSS theme variables instead of hardcoded hex values", () => {
    const activity = Array.from({ length: 52 }, (_, i) => 10 + (i % 5));

    const { container } = render(<CommitSparkline activity={activity} />);
    const stops = container.querySelectorAll("stop");
    expect(stops.length).toBeGreaterThan(0);

    Array.from(stops).forEach((stop) => {
      const color = stop.getAttribute("stopColor") || stop.getAttribute("stop-color") || stop.outerHTML;
      expect(color).toMatch(/var\(--brand-(cyan|blue)/);
    });
  });

  it("Requirement 4 & Criterion 3: SVG sparklines assign unique gradient IDs per card instance", () => {
    const activity = Array.from({ length: 52 }, () => 5);

    const { container: c1 } = render(<CommitSparkline activity={activity} />);
    const { container: c2 } = render(<CommitSparkline activity={activity} />);

    const grad1Area = c1.querySelector("linearGradient[id$='-area']");
    const grad2Area = c2.querySelector("linearGradient[id$='-area']");

    expect(grad1Area).not.toBeNull();
    expect(grad2Area).not.toBeNull();
    expect(grad1Area?.id).not.toBe(grad2Area?.id);
  });

  it("Requirement 1 & Criterion 1: PretextRichText inline code chips and text nodes consume active CSS theme variables", () => {
    const items = parseMarkdownToRichItems(
      "Sample **bold** text and `inline code` chip",
      "13px sans-serif",
      "bold 13px sans-serif",
      "italic 13px sans-serif",
      "12px monospace"
    );

    const lines = [
      {
        fragments: [
          { text: "Sample ", gapBefore: 0, itemIndex: 0, occupiedWidth: 40, start: 0, end: 7 },
          { text: "bold", gapBefore: 0, itemIndex: 1, occupiedWidth: 30, start: 7, end: 11 },
          { text: " text and ", gapBefore: 0, itemIndex: 2, occupiedWidth: 50, start: 11, end: 21 },
          { text: "inline code", gapBefore: 0, itemIndex: 3, occupiedWidth: 60, start: 21, end: 32 },
          { text: " chip", gapBefore: 0, itemIndex: 4, occupiedWidth: 20, start: 32, end: 37 },
        ],
        width: 200,
        end: 37 as unknown as import("@chenglou/pretext/rich-inline").RichInlineLine["end"],
      },
    ];

    const { container } = render(
      <PretextRichText lines={lines as unknown as import("@chenglou/pretext/rich-inline").RichInlineLine[]} items={items} lineHeight={18} isReady={true} />
    );

    const codeSpan = container.querySelector("span.font-mono");
    expect(codeSpan).not.toBeNull();
    expect(codeSpan?.getAttribute("style")).toContain("var(--brand-cyan");

    const boldSpan = container.querySelector("span.font-bold:not(.font-mono)");
    expect(boldSpan).not.toBeNull();
    expect(boldSpan?.className).toContain("var(--foreground");
  });

  it("Requirement 2 & Criterion 4: CaseStudyBentoCard metadata labels and markdown text use theme tokens for accessibility", () => {
    const dummyStudy = {
      id: "test-study",
      title: "Test Case Study",
      slug: "test-case-study",
      primary_language: "TypeScript",
      editorial_content: "This is **bold** text with `code` chip.",
      architectural_narrative: "Narrative content",
      tags: "React, Next.js",
      order_index: 1,
      impact_metric: "100%",
      impact_label: "Efficiency",
      category: "Engineering",
      featured: true,
      published: true,
      simulated_telemetry: false,
      created_at: new Date(),
      updated_at: new Date(),
      githubStats: {
        stars: 120,
        forks: 30,
        openIssues: 2,
        commitActivity: Array.from({ length: 52 }, () => 5),
        languages: [],
        recentCommits: [],
        recentEvents: [],
      },
    };

    const { container } = render(
      <TerminologyProvider>
        <BentoLayoutProvider>
          <CaseStudyBentoCard study={dummyStudy} />
        </BentoLayoutProvider>
      </TerminologyProvider>
    );

    const slugSpan = container.querySelector("span.truncate");
    expect(slugSpan).not.toBeNull();
    expect(slugSpan?.className).toContain("var(--muted");

    const codeElem = container.querySelector("code");
    expect(codeElem).not.toBeNull();
    expect(codeElem?.getAttribute("style")).toContain("var(--brand-cyan");
  });

  it("Requirement 5 & Criterion 5: Light mode CSS rules in globals.css and studio-theme.css declare accessible light tokens", () => {
    const globalsCss = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
    const studioCss = fs.readFileSync(path.resolve(__dirname, "../components/crf/studio-theme.css"), "utf-8");

    expect(globalsCss).toContain('[data-theme="light"]');
    expect(globalsCss).toContain('--brand-cyan: #0284c7');
    expect(globalsCss).toContain('--muted: #475569');

    expect(studioCss).toContain('[data-studio-theme="light"]');
    expect(studioCss).toContain('--brand-cyan: #0284c7');
    expect(studioCss).toContain('--foreground: #0f172a');
  });
});
