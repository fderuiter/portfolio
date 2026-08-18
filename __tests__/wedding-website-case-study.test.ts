import { describe, it, expect } from "vitest";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { scanText } from "@/lib/validation-scanner";
import { ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";

describe("Wedding Website & Guest Management Platform Case Study Integration", () => {
  it("includes wedding-website in static FALLBACK_CASE_STUDIES array", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "wedding-website");
    expect(study).toBeDefined();
    expect(study?.title).toContain("Wedding Website & Guest Management Platform");
    expect(study?.primary_language).toBe("TypeScript");
    expect(study?.github_url).toBe("https://github.com/fderuiter/wedding_website");
  });

  it("contains complete tags and metadata for wedding-website", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "wedding-website");
    expect(study).toBeDefined();
    const tags = study?.tags.split(",").map((t) => t.trim());
    expect(tags).toContain("Full-Stack");
    expect(tags).toContain("Next.js");
    expect(tags).toContain("Three.js");
    expect(tags).toContain("Prisma");
    expect(tags).toContain("Tailwind CSS");
    expect(tags).toContain("Playwright");
    expect(tags).toContain("Docker");
  });

  it("contains essential architectural narratives, WebGL physics, and scraper details", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "wedding-website");
    expect(study).toBeDefined();
    expect(study?.architectural_narrative).toContain("Heart3D.tsx");
    expect(study?.architectural_narrative).toContain("useHeartPhysics.ts");
    expect(study?.architectural_narrative).toContain("Universal Metadata Scraper");
    expect(study?.architectural_narrative).toContain("DragDropContainer.tsx");
    expect(study?.architectural_narrative).toContain("SSRF Defense");
  });

  it("passes security and credential regex scanner without violations", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "wedding-website");
    expect(study).toBeDefined();

    const editorialMatches = scanText(study!.editorial_content);
    const narrativeMatches = scanText(study!.architectural_narrative);

    expect(editorialMatches).toHaveLength(0);
    expect(narrativeMatches).toHaveLength(0);
  });

  it("registers weddingWebsite in ROUTE_METADATA_CONFIGS", () => {
    const config = ROUTE_METADATA_CONFIGS.weddingWebsite;
    expect(config).toBeDefined();
    expect(config.path).toBe("/case-studies/wedding-website");
    expect(config.title).toContain("Wedding Website");
    expect(config.keywords).toContain("Three.js");
    expect(config.keywords).toContain("Prisma");
  });
});
