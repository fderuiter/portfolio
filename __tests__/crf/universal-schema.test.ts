import { describe, it, expect } from "vitest";
import {
  validateUniversalCrf,
  parseUniversalCrf,
  exportUniversalCrfJson,
  exportUniversalCrfYaml,
  generateCliCommandForField,
  generateCliCommandForForm,
  diffUniversalCrfStudies,
} from "@/lib/crf/universal-schema";
import { getOncologyPresetSync } from "@/lib/crf/presets/loader";
import { CRFField, CRFForm, StudyProtocol } from "@/lib/crf/types";

describe("Universal CRF Specification & Schema Engine", () => {
  const sampleStudy = getOncologyPresetSync();

  it("validates a compliant study protocol against Zod schema", () => {
    const result = validateUniversalCrf(sampleStudy);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.study?.protocolNumber).toBe(sampleStudy.protocolNumber);
  });

  it("rejects non-compliant schema with structured error issues", () => {
    const invalidData = {
      protocolNumber: "", // invalid: min(1)
      studyName: "Test Study",
      forms: [
        {
          id: "f1",
          name: "Test Form",
          domain: "VERY_LONG_DOMAIN_NAME", // invalid: max(8)
          sections: [],
        },
      ],
    };

    const result = validateUniversalCrf(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("parses valid JSON string into typed StudyProtocol", () => {
    const jsonString = exportUniversalCrfJson(sampleStudy);
    const parsed = parseUniversalCrf(jsonString);

    expect(parsed.protocolNumber).toBe(sampleStudy.protocolNumber);
    expect(parsed.forms.length).toBe(sampleStudy.forms.length);
    expect(parsed.visits.length).toBe(sampleStudy.visits.length);
  });

  it("serializes protocol to clean YAML with header comments", () => {
    const yamlString = exportUniversalCrfYaml(sampleStudy);
    expect(yamlString).toContain("# Universal Clinical Research Form (CRF) Specification");
    expect(yamlString).toContain(`protocolNumber: ${sampleStudy.protocolNumber}`);
    expect(yamlString).toContain("formsCount:");
  });

  it("generates correct CLI commands for forms and fields", () => {
    const field: CRFField = {
      id: "fld_sysbp",
      variableName: "SYSBP",
      label: "Systolic Blood Pressure",
      dataType: "number",
      columnSpan: 6,
      required: true,
      unit: "mmHg",
    };

    const cliCmd = generateCliCommandForField("VS", field);
    expect(cliCmd).toBe(
      'crf add field VS --var SYSBP --type number --label "Systolic Blood Pressure" --required --unit "mmHg"'
    );

    const form: CRFForm = {
      id: "form_dm",
      domain: "DM",
      name: "Demographics",
      description: "Subject demographics",
      version: "1.0",
      sections: [],
      rules: [],
    };

    const formCmd = generateCliCommandForForm(form);
    expect(formCmd).toBe('crf add form DM --name "Demographics"');
  });

  it("computes semantic protocol diffs between two study versions", () => {
    const studyA = JSON.parse(JSON.stringify(sampleStudy)) as StudyProtocol;
    const studyB = JSON.parse(JSON.stringify(sampleStudy)) as StudyProtocol;

    // Modify studyB
    studyB.forms[0].sections[0].fields.push({
      id: "fld_new",
      variableName: "NEWVAR",
      label: "New Variable",
      dataType: "text",
      columnSpan: 6,
      required: false,
    });

    const diff = diffUniversalCrfStudies(studyA, studyB);
    expect(diff.hasChanges).toBe(true);
    expect(diff.modifiedForms.length).toBeGreaterThan(0);
    expect(diff.modifiedForms[0].addedFields).toContain("NEWVAR");
  });
});
