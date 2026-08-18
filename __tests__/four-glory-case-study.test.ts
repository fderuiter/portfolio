import { describe, it, expect } from "vitest";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";
import { CANONICAL_ROUTES } from "@/lib/dx/page-bench";

describe("4Glory Case Study Integration", () => {
  it("includes four-glory in static FALLBACK_CASE_STUDIES array", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "four-glory");
    expect(study).toBeDefined();
    expect(study?.title).toBe("4Glory | Does Fred Know Ball?: Predictive Basketball Analytics Engine");
    expect(study?.primary_language).toBe("Python");
    expect(study?.github_url).toBe("https://github.com/fderuiter/four-glory");
  });

  it("contains complete tags and metadata for four-glory", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "four-glory");
    expect(study?.tags).toContain("XGBoost");
    expect(study?.tags).toContain("Basketball Analytics");
    expect(study?.tags).toContain("Scikit-Learn");
  });

  it("includes code snippets in four-glory architectural narrative", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "four-glory");
    expect(study?.architectural_narrative).toContain("compute_rolling_possession_features");
    expect(study?.architectural_narrative).toContain("temporal_expanding_window_split");
    expect(study?.architectural_narrative).toContain("train_calibrated_xgboost");
  });

  it("is present in SEO ROUTE_METADATA_CONFIGS and CANONICAL_ROUTES", () => {
    expect(ROUTE_METADATA_CONFIGS.fourGloryCaseStudy).toBeDefined();
    expect(ROUTE_METADATA_CONFIGS.fourGloryCaseStudy.path).toBe("/case-studies/four-glory");

    const benchRoute = CANONICAL_ROUTES.find((r) => r.path === "/case-studies/four-glory");
    expect(benchRoute).toBeDefined();
    expect(benchRoute?.category).toBe("case-study");
  });
});
