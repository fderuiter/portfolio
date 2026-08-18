import { describe, it, expect } from "vitest";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { scanText } from "@/lib/validation-scanner";
import fs from "fs";
import path from "path";

describe("Lambda-Wave Real-Time SGRT FMCW Radar System Case Study Integration", () => {
  it("includes lambda-wave in static FALLBACK_CASE_STUDIES array", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "lambda-wave");
    expect(study).toBeDefined();
    expect(study?.title).toContain("Lambda-Wave");
    expect(study?.primary_language).toBe("Haskell");
    expect(study?.published).toBe(true);
  });

  it("contains complete required tags and metadata for lambda-wave", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "lambda-wave");
    expect(study).toBeDefined();
    const tags = study?.tags.split(",").map((t) => t.trim());
    expect(tags).toContain("haskell");
    expect(tags).toContain("embedded-systems");
    expect(tags).toContain("dsp");
    expect(tags).toContain("fmcw-radar");
    expect(tags).toContain("sgrt");
    expect(tags).toContain("medical-device");
    expect(tags).toContain("iec-62304");
    expect(tags).toContain("real-time");
  });

  it("contains essential architectural narratives, code snippets, and safety invariants", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "lambda-wave");
    expect(study).toBeDefined();
    expect(study?.architectural_narrative).toContain("ring_buffer_pop");
    expect(study?.architectural_narrative).toContain("predictState");
    expect(study?.architectural_narrative).toContain("evaluateSafetyState");
    expect(study?.architectural_narrative).toContain("LockFreeRingBuffer");
    expect(study?.architectural_narrative).toContain("IEC 62304");
  });

  it("passes security and credential regex scanner without violations", () => {
    const study = FALLBACK_CASE_STUDIES.find((s) => s.slug === "lambda-wave");
    expect(study).toBeDefined();

    const editorialMatches = scanText(study!.editorial_content);
    const narrativeMatches = scanText(study!.architectural_narrative);

    expect(editorialMatches).toEqual([]);
    expect(narrativeMatches).toEqual([]);
  });

  it("verifies docs/CASE_STUDY.md and CASE_STUDY.md exist and contain required blueprint sections", () => {
    const docsPath = path.resolve(process.cwd(), "docs/CASE_STUDY.md");
    expect(fs.existsSync(docsPath)).toBe(true);

    const docsContent = fs.readFileSync(docsPath, "utf-8");
    expect(docsContent).toContain("Lambda-Wave");
    expect(docsContent).toContain("Executive Summary & Value Proposition");
    expect(docsContent).toContain("cbits/src/ring_buffer_ffi.cpp");
    expect(docsContent).toContain("SignalProcessing.Kalman");
    expect(docsContent).toContain("Safety.Watchdog");
    expect(docsContent).toContain("flowchart LR");
    expect(docsContent).toContain("iec-62304");

    const rootPath = path.resolve(process.cwd(), "CASE_STUDY.md");
    expect(fs.existsSync(rootPath)).toBe(true);

    const rootContent = fs.readFileSync(rootPath, "utf-8");
    expect(rootContent).toContain("Lambda-Wave");
    expect(rootContent).toContain("SignalProcessing.Kalman");
  });
});
