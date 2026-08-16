// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

  it("renders top 3 case studies as lightweight static cards", async () => {
    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={FALLBACK_CASE_STUDIES} />);
    });

    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(3);

    // Check titles of top 3 studies
    expect(container.textContent).toContain(FALLBACK_CASE_STUDIES[0].title);
    expect(container.textContent).toContain(FALLBACK_CASE_STUDIES[1].title);
    expect(container.textContent).toContain(FALLBACK_CASE_STUDIES[2].title);

    // Should contain link to all case studies
    const allLink = container.querySelector('a[href="/case-studies"]');
    expect(allLink).not.toBeNull();
    expect(allLink?.textContent).toContain("View All Architectural Case Studies");
  });

  it("renders individual case study navigation links", async () => {
    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={FALLBACK_CASE_STUDIES} />);
    });

    const study1Links = container.querySelectorAll(`a[href="/case-studies/${FALLBACK_CASE_STUDIES[0].slug}"]`);
    expect(study1Links.length).toBeGreaterThanOrEqual(1);
  });

  it("renders language badges for each project", async () => {
    await act(async () => {
      root.render(<ProjectTeaserGrid caseStudies={FALLBACK_CASE_STUDIES} />);
    });

    expect(container.textContent).toContain(FALLBACK_CASE_STUDIES[0].primary_language);
  });
});
