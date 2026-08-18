import { describe, it, expect } from "vitest";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { scanText } from "@/lib/validation-scanner";
import fs from "fs";
import path from "path";

describe("Equipose Randomization Case Study Integration", () => {
  it("includes equipose-randomization in static FALLBACK_CASE_STUDIES array", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "equipose-randomization");
    expect(study).toBeDefined();
    expect(study?.title).toContain("Equipose Randomization");
    expect(study?.primary_language).toBe("Angular / TypeScript");
    expect(study?.published).toBe(true);
  });

  it("contains complete tags and metadata for equipose-randomization", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "equipose-randomization");
    expect(study).toBeDefined();
    const tags = study?.tags.split(",").map((t) => t.trim());
    expect(tags).toContain("Angular");
    expect(tags).toContain("TypeScript");
    expect(tags).toContain("Web Workers");
    expect(tags).toContain("Clinical Informatics");
    expect(tags).toContain("Transpiler Design");
    expect(tags).toContain("Deterministic Algorithms");
    expect(tags).toContain("CDISC");
    expect(tags).toContain("ADaM-Lite");
  });

  it("contains essential architectural narratives and code snippets", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "equipose-randomization");
    expect(study).toBeDefined();
    expect(study?.architectural_narrative).toContain("PocockSimonMinimizationEngine");
    expect(study?.architectural_narrative).toContain("SchemaTranspiler");
    expect(study?.architectural_narrative).toContain("MT19937");
    expect(study?.architectural_narrative).toContain("Web Workers");
  });

  it("passes security and credential regex scanner without violations", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "equipose-randomization");
    expect(study).toBeDefined();

    const editorialMatches = scanText(study!.editorial_content);
    const narrativeMatches = scanText(study!.architectural_narrative);

    expect(editorialMatches).toEqual([]);
    expect(narrativeMatches).toEqual([]);
  });

  it("verifies portfolio/projects/equipose-randomization/CASE_STUDY.md file exists and contains required blueprint sections", () => {
    const filePath = path.resolve(process.cwd(), "portfolio/projects/equipose-randomization/CASE_STUDY.md");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Equipose Randomization");
    expect(content).toContain("Executive Summary & Value Proposition");
    expect(content).toContain("Deep Dive Engineering Focus Areas");
    expect(content).toContain("System Design & Architecture Breakdown");
    expect(content).toContain("flowchart TD");
    expect(content).toContain("PocockSimonMinimizationEngine");
    expect(content).toContain("SchemaTranspiler");
    expect(content).toContain("randomization-engine.worker.ts");
    expect(content).toContain("Lessons Learned & Future Improvements");
  });
});
