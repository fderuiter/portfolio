/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

global.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

vi.mock("@/hooks/useMasonryLayout", () => ({
  useMasonryLayout: (_all: unknown, filtered: Array<{ id: string }>) => ({
    containerRef: { current: null },
    layoutState: { isReady: true, columns: [filtered] },
  }),
}));

import { CaseStudyShowcase } from "@/components/CaseStudyShowcase";

// Regression coverage for #581: the filter tab list was hardcoded to
// ["All", "TypeScript", "Python"], so real entries like Rust or "Graphic
// Design" case studies had no way to be filtered to, and the selected filter
// lived only in local useState — a browser Back from a case-study detail
// page (a fresh mount of this component) always reset it to "All".
const mockCaseStudies = [
  { id: "1", slug: "a", primary_language: "TypeScript", githubStats: null },
  { id: "2", slug: "b", primary_language: "Rust", githubStats: null },
  {
    id: "3",
    slug: "c",
    primary_language: "Graphic Design",
    githubStats: null,
  },
] as any;

describe("CaseStudyShowcase filtering (#581)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.history.replaceState(null, "", "/case-studies");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("derives filter tabs from the actual case-study collection, not a hardcoded list", async () => {
    await act(async () => {
      root.render(<CaseStudyShowcase caseStudies={mockCaseStudies} />);
    });

    const tabLabels = Array.from(container.querySelectorAll("button")).map(
      (b) => b.textContent
    );
    expect(tabLabels.some((t) => t?.includes("RUST"))).toBe(true);
    expect(tabLabels.some((t) => t?.includes("GRAPHIC DESIGN"))).toBe(true);
  });

  it("restores the selected filter from the URL hash instead of always defaulting to All", async () => {
    window.history.replaceState(null, "", "/case-studies#lang=Rust");

    await act(async () => {
      root.render(<CaseStudyShowcase caseStudies={mockCaseStudies} />);
    });

    // Only the Rust study's card should render.
    expect(container.textContent).not.toContain("No projects found");
    const rustTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("RUST")
    );
    expect(rustTab?.className).toContain("text-brand-cyan");
  });

  it("writes the selected filter into the URL hash (via replaceState) so Back restores it", async () => {
    await act(async () => {
      root.render(<CaseStudyShowcase caseStudies={mockCaseStudies} />);
    });

    const rustTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("RUST")
    );
    expect(rustTab).toBeTruthy();

    await act(async () => {
      rustTab!.click();
    });

    expect(window.location.hash).toBe("#lang=Rust");
  });

  it("clears the URL hash filter param when All Projects is selected", async () => {
    window.history.replaceState(null, "", "/case-studies#lang=Rust");

    await act(async () => {
      root.render(<CaseStudyShowcase caseStudies={mockCaseStudies} />);
    });

    const allTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("ALL PROJECTS")
    );
    await act(async () => {
      allTab!.click();
    });

    expect(window.location.hash).toBe("");
  });
});
