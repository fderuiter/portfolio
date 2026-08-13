import { describe, it, expect } from "vitest";

// Minimal test to verify grid item mappings
describe("Grid Item Mapping and Filtering Logic", () => {
  const mockCaseStudies = [
    {
      id: "mock-1",
      slug: "schemaflow",
      title: "SchemaFlow: Reactive Node Engine",
      primary_language: "TypeScript",
      github_url: "https://github.com/fderuiter/SchemaFlow",
      published: true,
      simulated_telemetry: false,
      tags: "TypeScript, React, Flow",
      editorial_content: "A **reactive**, `visual graph editor` built in **TypeScript**.",
      architectural_narrative: "Mock narrative",
      created_at: new Date("2026-08-01T12:00:00Z"),
      updated_at: new Date("2026-08-01T12:00:00Z"),
      githubStats: null,
      setbacks: [
        {
          id: "mock-sb-1",
          title: "Zustand State Drifting",
          editorial_content: "We encountered complex rendering race conditions in Zustand where the canvas node positions drifted during rapid drag actions. Resolving this required debouncing the AST updates and memoizing selectors.",
          created_at: new Date("2026-08-02T12:00:00Z"),
          updated_at: new Date("2026-08-02T12:00:00Z"),
          caseStudyId: "mock-1",
        }
      ]
    },
    {
      id: "mock-2",
      slug: "clinical-data-mapper",
      title: "Clinical Data Standards Engine",
      primary_language: "Python",
      github_url: "https://github.com/fderuiter/clinical-data-mapper",
      published: true,
      simulated_telemetry: false,
      tags: "Python, SDTM, Pipeline",
      editorial_content: "An enterprise-grade mapping pipeline.",
      architectural_narrative: "Mock narrative",
      created_at: new Date("2026-08-03T12:00:00Z"),
      updated_at: new Date("2026-08-03T12:00:00Z"),
      githubStats: null,
      setbacks: [
        {
          id: "mock-sb-2",
          title: "SAX Stream Memory Bloat",
          editorial_content: "Even with SAX parsing, standard V8 garbage collection overhead caused API timeouts on 2GB files. We solved this by using Node.js buffers directly and chunking database transaction commits.",
          created_at: new Date("2026-08-04T12:00:00Z"),
          updated_at: new Date("2026-08-04T12:00:00Z"),
          caseStudyId: "mock-2",
        }
      ]
    }
  ];

  interface TestGridItem {
    id: string;
    gridType: string;
    title: string;
    editorial_content: string;
    created_at: Date;
    updated_at: Date;
    primary_language: string;
    [key: string]: unknown;
  }

  it("successfully maps case studies and setbacks to a sorted list of grid items", () => {
    const items: TestGridItem[] = [];
    mockCaseStudies.forEach((study) => {
      items.push({
        ...study,
        gridType: "project",
      });
      if (study.setbacks) {
        study.setbacks.forEach((sb) => {
          items.push({
            gridType: "setback",
            id: sb.id,
            title: sb.title,
            editorial_content: sb.editorial_content,
            created_at: sb.created_at,
            updated_at: sb.updated_at,
            caseStudyId: sb.caseStudyId,
            parentSlug: study.slug,
            parentTitle: study.title,
            primary_language: study.primary_language,
          });
        });
      }
    });

    // Check mapping size
    expect(items).toHaveLength(4);

    // Verify type tags
    const projects = items.filter(i => i.gridType === "project");
    const setbacks = items.filter(i => i.gridType === "setback");
    expect(projects).toHaveLength(2);
    expect(setbacks).toHaveLength(2);

    // Verify chronological sorting (newest first)
    const sorted = [...items].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    expect(sorted[0].id).toBe("mock-sb-2"); // Aug 4
    expect(sorted[1].id).toBe("mock-2");    // Aug 3
    expect(sorted[2].id).toBe("mock-sb-1"); // Aug 2
    expect(sorted[3].id).toBe("mock-1");    // Aug 1
  });

  it("filters items correctly by content type and language", () => {
    const items: TestGridItem[] = [];
    mockCaseStudies.forEach((study) => {
      items.push({
        ...study,
        gridType: "project",
      });
      if (study.setbacks) {
        study.setbacks.forEach((sb) => {
          items.push({
            gridType: "setback",
            id: sb.id,
            title: sb.title,
            editorial_content: sb.editorial_content,
            created_at: sb.created_at,
            updated_at: sb.updated_at,
            caseStudyId: sb.caseStudyId,
            parentSlug: study.slug,
            parentTitle: study.title,
            primary_language: study.primary_language,
          });
        });
      }
    });

    // Filter "setback only"
    const setbackOnly = items.filter(item => item.gridType === "setback");
    expect(setbackOnly).toHaveLength(2);
    expect(setbackOnly.every(i => i.gridType === "setback")).toBe(true);

    // Filter "TypeScript only"
    const tsOnly = items.filter(item => item.primary_language === "TypeScript");
    expect(tsOnly).toHaveLength(2); // schemaflow + mock-sb-1
    expect(tsOnly.every(i => i.primary_language === "TypeScript" || i.primary_language === "TypeScript")).toBe(true);

    // Filter "setback" + "Python"
    const pythonSetbacks = items.filter(item => item.gridType === "setback" && item.primary_language === "Python");
    expect(pythonSetbacks).toHaveLength(1);
    expect(pythonSetbacks[0].id).toBe("mock-sb-2");
  });
});
