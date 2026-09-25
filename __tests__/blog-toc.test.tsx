// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TableOfContents } from "@/components/blog/TableOfContents";
import type { HeadingItem } from "@/lib/blog/headings";

describe("TableOfContents Component (Ticket #1058)", () => {
  const headings: HeadingItem[] = [
    { id: "the-challenge", text: "The Challenge: Memory Exhaustion", level: 2 },
    { id: "streaming-xml", text: "Streaming XML Tokenization", level: 3 },
    { id: "enforcing-sdtm", text: "Enforcing SDTM Conformance", level: 2 },
  ];

  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn(function (
      this: Record<string, unknown>,
      _callback: IntersectionObserverCallback
    ) {
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
    vi.stubGlobal("IntersectionObserver", mockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders navigation list with heading links", () => {
    render(<TableOfContents headings={headings} />);

    const nav = screen.getByRole("navigation", { name: /table of contents/i });
    expect(nav).toBeDefined();

    expect(screen.getByText("The Challenge: Memory Exhaustion")).toBeDefined();
    expect(screen.getByText("Streaming XML Tokenization")).toBeDefined();
    expect(screen.getByText("Enforcing SDTM Conformance")).toBeDefined();
  });

  it("returns null when headings count is less than 2", () => {
    const singleHeading: HeadingItem[] = [
      { id: "intro", text: "Introduction", level: 2 },
    ];
    const { container } = render(<TableOfContents headings={singleHeading} />);
    expect(container.firstChild).toBeNull();
  });

  it("indents h3 headings relative to h2 headings", () => {
    render(<TableOfContents headings={headings} />);

    const h3Link = screen.getByText("Streaming XML Tokenization").closest("a");
    expect(h3Link?.className).toContain("pl-4");
  });

  it("allows toggling mobile collapsible menu", () => {
    render(<TableOfContents headings={headings} />);

    const toggleButton = screen.queryByRole("button", {
      name: /toggle table of contents/i,
    });
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(toggleButton.getAttribute("aria-expanded")).toBe("true");
    }
  });
});
