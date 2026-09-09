// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ProjectTeaserGrid } from "@/components/ProjectTeaserGrid";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";

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

describe("ProjectTeaserGrid Component Suite", () => {
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

  it("renders the curated clinical-data projects in their intentional order", async () => {
    await act(async () => {
      root.render(
        <ProjectTeaserGrid caseStudies={[...FALLBACK_CASE_STUDIES].reverse()} />
      );
    });

    const articles = container.querySelectorAll(
      '[data-testid="featured-project-card"]'
    );
    expect(articles.length).toBe(3);

    expect(articles[0]?.textContent).toContain("Clinical Data Mapper");
    expect(articles[1]?.textContent).toContain("Cadence Clinical");
    expect(articles[2]?.textContent).toContain("iMednet Python SDK");

    expect(articles[0]?.textContent).toContain("Problem");
    expect(articles[0]?.textContent).toContain("Contribution");
    expect(articles[0]?.textContent).toContain("Outcome");

    // Should contain link to all case studies
    const allLink = container.querySelector('a[href="/case-studies"]');
    expect(allLink).not.toBeNull();
    expect(allLink?.textContent).toContain("View All Case Studies");
  });

  it("renders individual case study navigation links", async () => {
    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={FALLBACK_CASE_STUDIES} />);
    });

    const selectedStudy = FALLBACK_CASE_STUDIES.find(
      (study) => study.slug === "clinical-data-mapper"
    );
    const studyLinks = container.querySelectorAll(
      'a[href="/case-studies/clinical-data-mapper"]'
    );

    expect(studyLinks).toHaveLength(1);
    expect(studyLinks[0]?.textContent).toContain(selectedStudy?.title);
    expect(studyLinks[0]?.getAttribute("aria-label")).toBe(
      `Read the ${selectedStudy?.title} case study`
    );
  });

  it("renders language badges for each project", async () => {
    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={FALLBACK_CASE_STUDIES} />);
    });

    expect(container.textContent).toContain(
      FALLBACK_CASE_STUDIES[0].primary_language
    );
  });

  it("backfills a missing curated project with a stable published project", async () => {
    const withoutCadence = FALLBACK_CASE_STUDIES.filter(
      (study) => study.slug !== "cadence-clinical"
    );

    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={withoutCadence} />);
    });

    const cards = container.querySelectorAll(
      '[data-testid="featured-project-card"]'
    );
    const fallbackTitle = [...withoutCadence]
      .filter(
        (study) =>
          study.slug !== "clinical-data-mapper" &&
          study.slug !== "imednet-python-sdk"
      )
      .sort((left, right) => left.slug.localeCompare(right.slug))[0]?.title;

    expect(cards).toHaveLength(3);
    expect(container.textContent).toContain(fallbackTitle);
    expect(container.textContent).not.toContain("Cadence Clinical:");
    expect(cards[2]?.textContent).toContain("CASE STUDY");
    expect(cards[2]?.textContent).toContain("Problem");
    expect(cards[2]?.textContent).toContain("Contribution");
    expect(cards[2]?.textContent).toContain("Outcome");
  });

  it("keeps long titles, tags, and artifact fallbacks within flexible card bounds", async () => {
    const longTitleStudy = {
      ...FALLBACK_CASE_STUDIES.find(
        (study) => study.slug === "clinical-data-mapper"
      )!,
      title: `${"ClinicalDataStandards".repeat(12)}.example/with/no-breaks`,
      tags: "a-very-long-unbroken-technology-tag-that-must-wrap-safely",
    };

    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={[longTitleStudy]} />);
    });

    const card = container.querySelector(
      '[data-testid="featured-project-card"]'
    );
    const artifact = container.querySelector(
      '[data-testid="featured-project-artifact"]'
    );
    const action = container.querySelector(
      'a[href="/case-studies/clinical-data-mapper"]'
    );

    expect(card?.className).toContain("min-w-0");
    expect(card?.className).toContain("break-words");
    expect(artifact?.textContent).toContain("ODM / XML");
    expect(action?.className).toContain("min-h-[44px]");
  });
});
