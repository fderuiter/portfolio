// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelatedReading } from "@/components/blog/RelatedReading";
import type { RelatedItem } from "@/lib/blog/related";

describe("<RelatedReading />", () => {
  it("renders nothing when items array is empty", () => {
    const { container } = render(<RelatedReading items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders related items with appropriate badges, links, and matched tags", () => {
    const items: RelatedItem[] = [
      {
        id: "dispatch-1",
        type: "dispatch",
        slug: "audit-trail-design",
        title: "21 CFR Part 11 Audit Trail Design",
        summary: "Immutable audit logs for clinical systems.",
        href: "/blog/audit-trail-design",
        readingTimeMinutes: 6,
        score: 18,
        matchedTags: ["clinical-trials", "typescript"],
        tags: ["clinical-trials", "typescript", "gxp"],
      },
      {
        id: "case-study-1",
        type: "case-study",
        slug: "clinical-data-mapper",
        title: "Clinical Data Mapper: From ODM to SDTM",
        summary: "Automated mapping pipeline.",
        href: "/case-studies/clinical-data-mapper",
        primaryLanguage: "TypeScript",
        score: 22,
        matchedTags: ["CDISC", "ODM"],
        tags: ["TypeScript", "CDISC", "ODM"],
      },
    ];

    render(<RelatedReading items={items} />);

    expect(
      screen.getByRole("heading", {
        name: /Related Dispatches & Case Studies/i,
      })
    ).toBeDefined();

    expect(screen.getByText("21 CFR Part 11 Audit Trail Design")).toBeDefined();
    expect(
      screen.getByText("Clinical Data Mapper: From ODM to SDTM")
    ).toBeDefined();

    expect(screen.getByText("Dispatch")).toBeDefined();
    expect(screen.getByText("Case Study")).toBeDefined();

    expect(screen.getByText("6 min read")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();

    expect(screen.getByText("#clinical-trials")).toBeDefined();
    expect(screen.getByText("#CDISC")).toBeDefined();

    const links = screen.getAllByRole("link");
    expect(links[0].getAttribute("href")).toBe("/blog/audit-trail-design");
    expect(links[1].getAttribute("href")).toBe(
      "/case-studies/clinical-data-mapper"
    );
  });
});
