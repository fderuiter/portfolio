import { describe, it, expect } from "vitest";
import {
  executeInfoCommand,
  executeValidateCommand,
  executeAddFormCommand,
  executeAddFieldCommand,
  executeExportCommand,
  executeCliString,
  stripAnsi,
} from "@/lib/crf/cli-engine";
import { getOncologyPresetSync } from "@/lib/crf/presets/loader";
import { StudyProtocol } from "@/lib/crf/types";

describe("CRF CLI & Headless Command Engine", () => {
  const sampleStudy = getOncologyPresetSync();

  it("generates document-driven study summary with narrative headings and CTAs", () => {
    const res = executeInfoCommand(sampleStudy);
    expect(res.success).toBe(true);

    const plain = stripAnsi(res.document);
    expect(plain).toContain(`# STUDY PROTOCOL — ${sampleStudy.protocolNumber}`);
    expect(plain).toContain("### Clinical Forms");
    expect(plain).toContain("### Schedule of Activities (SoA)");
    expect(plain).toContain("### Next Actions");
    expect(plain).toContain("##### Metadata");
  });

  it("returns machine-readable JSON when --json flag is provided", () => {
    const res = executeInfoCommand(sampleStudy, { json: true });
    expect(res.success).toBe(true);
    const parsed = JSON.parse(res.document);
    expect(parsed.protocolNumber).toBe(sampleStudy.protocolNumber);
    expect(parsed.formsCount).toBe(sampleStudy.forms.length);
  });

  it("audits CDASH 2.2 conformance and flags variable length violations", () => {
    const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(sampleStudy));
    invalidStudy.forms[0].sections[0].fields.push({
      id: "f_too_long",
      variableName: "LONGVARIABLENAME", // > 8 chars
      label: "Invalid length variable",
      dataType: "text",
      columnSpan: 6,
      required: false,
    });

    const res = executeValidateCommand(invalidStudy);
    expect(res.success).toBe(false);
    const plain = stripAnsi(res.document);
    expect(plain).toContain("LONGVARIABLENAME");
    expect(plain).toContain("exceeds CDISC 8-character limit");
  });

  it("scaffolds CDASH domain forms and respects --dry-run", () => {
    const res = executeAddFormCommand(sampleStudy, "PE", "Physical Examination", { dryRun: true });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.updatedStudy?.forms.length).toBe(sampleStudy.forms.length); // Dry run: study unchanged

    const realRes = executeAddFormCommand(sampleStudy, "PE", "Physical Examination");
    expect(realRes.updatedStudy?.forms.length).toBe(sampleStudy.forms.length + 1);
  });

  it("adds fields with clinical units and validations", () => {
    const res = executeAddFieldCommand(sampleStudy, "VS", {
      variableName: "PULSE",
      label: "Heart Rate",
      dataType: "integer",
      unit: "beats/min",
      required: true,
    });

    expect(res.success).toBe(true);
    const plain = stripAnsi(res.document);
    expect(plain).toContain("# ADD FIELD — PULSE");
    expect(res.updatedStudy).toBeDefined();

    const vsForm = res.updatedStudy?.forms.find((f) => f.domain === "VS");
    const pulseField = vsForm?.sections.flatMap((s) => s.fields).find((f) => f.variableName === "PULSE");
    expect(pulseField).toBeDefined();
    expect(pulseField?.unit).toBe("beats/min");
    expect(pulseField?.required).toBe(true);
  });

  it("exports to multiple regulatory formats (ODM-XML, FHIR, SAS, R, JSON, YAML)", () => {
    const formats: Array<"json" | "yaml" | "odm" | "fhir" | "sas" | "r"> = ["json", "yaml", "odm", "fhir", "sas", "r"];
    for (const fmt of formats) {
      const res = executeExportCommand(sampleStudy, fmt);
      expect(res.success).toBe(true);
      expect(res.document.length).toBeGreaterThan(10);
    }
  });

  it("dispatches raw CLI string input correctly", () => {
    const helpRes = executeCliString(sampleStudy, "help");
    expect(helpRes.success).toBe(true);
    expect(stripAnsi(helpRes.document)).toContain("CRF STUDIO CLI COMMANDS");

    const infoRes = executeCliString(sampleStudy, "crf info");
    expect(infoRes.success).toBe(true);
    expect(stripAnsi(infoRes.document)).toContain("STUDY PROTOCOL");

    const addRes = executeCliString(sampleStudy, "crf add field VS --var TEMPC --type number --unit C");
    expect(addRes.success).toBe(true);
    expect(stripAnsi(addRes.document)).toContain("ADD FIELD — TEMPC");
  });
});
