import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { PageLayout } from "@/components/PageLayout";

describe("PageLayout Component Invariants", () => {
  it("renders with standard variant applying min-h-dvh, max-w-7xl, and padding", () => {
    const { container } = render(
      <PageLayout variant="standard">
        <p>Standard Layout Content</p>
      </PageLayout>
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el).toBeDefined();
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.className).toContain("min-h-dvh");
    expect(el.className).toContain("max-w-7xl");
    expect(el.className).toContain("overflow-x-hidden");
    expect(el.className).toContain("pt-28");
  });

  it("renders with studio variant applying full-bleed flex layout", () => {
    const { container } = render(
      <PageLayout variant="studio">
        <p>Studio Layout Content</p>
      </PageLayout>
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("min-h-dvh");
    expect(el.className).toContain("flex-1");
    expect(el.className).not.toContain("max-w-7xl");
  });

  it("renders with full variant for unconstrained containers", () => {
    const { container } = render(
      <PageLayout variant="full" className="custom-bg">
        <p>Full Layout Content</p>
      </PageLayout>
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("min-h-dvh");
    expect(el.className).toContain("custom-bg");
  });

  it("supports custom semantic HTML tag via 'as' prop without nesting duplicate main tags", () => {
    const { container } = render(
      <PageLayout as="section">
        <p>Section Content</p>
      </PageLayout>
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("section");
  });
});
