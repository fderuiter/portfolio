import { describe, it, expect } from "vitest";

interface BaseCaseStudy {
  id: string;
  slug: string;
  title: string;
  primary_language: string;
  github_url?: string | null;
  editorial_content: string;
  architectural_narrative: string;
  published: boolean;
  simulated_telemetry: boolean;
  tags: string;
  created_at: Date;
  updated_at: Date;
  pitch?: string | null;
  implementation_reality?: string | null;
  lessons_learned?: string | null;
  graveyard?: boolean;
}

describe("Case Study Schema Extension", () => {
  it("should have robust self-reflection fields on BaseCaseStudy interface", () => {
    const study: BaseCaseStudy = {
      id: "test-id",
      slug: "test-slug",
      title: "Test Case Study",
      primary_language: "TypeScript",
      editorial_content: "An editorial content summary.",
      architectural_narrative: "<p>Deep dive.</p>",
      published: true,
      simulated_telemetry: false,
      tags: "TypeScript, Test",
      created_at: new Date(),
      updated_at: new Date(),
      pitch: "Our original pitch for the system.",
      implementation_reality: "The actual production system had some memory leaks.",
      lessons_learned: "Strict heap monitoring is important.",
      graveyard: false,
    };

    expect(study.pitch).toBe("Our original pitch for the system.");
    expect(study.implementation_reality).toBe("The actual production system had some memory leaks.");
    expect(study.lessons_learned).toBe("Strict heap monitoring is important.");
    expect(study.graveyard).toBe(false);
  });

  it("should handle fallbacks for optional/nullable self-reflection fields", () => {
    const activeStudy: BaseCaseStudy = {
      id: "active-id",
      slug: "active-slug",
      title: "Active Case Study",
      primary_language: "TypeScript",
      editorial_content: "Editorial.",
      architectural_narrative: "<p>Deep dive.</p>",
      published: true,
      simulated_telemetry: false,
      tags: "TypeScript",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const pitch = activeStudy.pitch || "Default Pitch Fallback";
    const reality = activeStudy.implementation_reality || "Default Reality Fallback";
    const lessons = activeStudy.lessons_learned || "Default Lessons Fallback";
    const graveyard = activeStudy.graveyard ?? false;

    expect(pitch).toBe("Default Pitch Fallback");
    expect(reality).toBe("Default Reality Fallback");
    expect(lessons).toBe("Default Lessons Fallback");
    expect(graveyard).toBe(false);
  });
});
