import { describe, it, expect } from "vitest";
import {
  validateStudyCompliance,
  autoFixViolation,
  autoFixAllViolations,
} from "@/lib/crf/cdisc-conformance-linter";
import { StudyProtocol, CRFForm } from "@/lib/crf/types";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";

describe("CDISC Conformance & Regulatory Validation Linter & Auto-Fix Engine", () => {
  it("should detect clean schema on standard preset without major errors", () => {
    const violations = validateStudyCompliance(ONCOLOGY_RECIST_PRESET);
    const errors = violations.filter((v) => v.severity === "error");
    expect(errors.length).toBe(0);
  });

  it("should flag SD0001 when variable name exceeds 8 characters", () => {
    const testStudy: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [
        {
          id: "form_test",
          name: "Test Form",
          domain: "DM",
          description: "Test",
          version: "1.0",
          rules: [],
          sections: [
            {
              id: "sec_1",
              title: "General",
              fields: [
                {
                  id: "f_long",
                  variableName: "VERY_LONG_VARIABLE_NAME",
                  label: "Long Variable Question",
                  dataType: "text",
                  columnSpan: 6,
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      visits: [
        {
          id: "v1",
          oid: "SE.V1",
          name: "Visit 1",
          visitType: "Scheduled",
          targetDay: 0,
          windowBefore: 0,
          windowAfter: 0,
          assignedFormIds: ["form_test"],
        },
      ],
    };

    const violations = validateStudyCompliance(testStudy);
    const sd0001 = violations.find((v) => v.ruleId === "SD0001");
    expect(sd0001).toBeDefined();
    expect(sd0001?.variableName).toBe("VERY_LONG_VARIABLE_NAME");
    expect(sd0001?.autoFixAvailable).toBe(true);

    // Test 1-click Auto-Fix for SD0001
    const fixed = autoFixViolation(testStudy, sd0001!);
    const fixedField = fixed.forms[0].sections[0].fields[0];
    expect(fixedField.variableName.length).toBeLessThanOrEqual(8);
    expect(fixedField.variableName).toBe("VERY_LON");
  });

  it("should flag SD0002 when standard CDASH Core variables are missing in DM domain", () => {
    const testStudy: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [
        {
          id: "form_dm_custom",
          name: "Incomplete Demographics",
          domain: "DM",
          description: "Missing AGE and SEX",
          version: "1.0",
          rules: [],
          sections: [
            {
              id: "sec_1",
              title: "General",
              fields: [
                {
                  id: "f_brthyr",
                  variableName: "BRTHYR",
                  label: "Year of Birth",
                  dataType: "integer",
                  columnSpan: 6,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      visits: [
        {
          id: "v1",
          oid: "SE.V1",
          name: "Visit 1",
          visitType: "Scheduled",
          targetDay: 0,
          windowBefore: 0,
          windowAfter: 0,
          assignedFormIds: ["form_dm_custom"],
        },
      ],
    };

    const violations = validateStudyCompliance(testStudy);
    const sd0002Violations = violations.filter((v) => v.ruleId === "SD0002");
    expect(sd0002Violations.length).toBeGreaterThan(0);

    const sexViolation = sd0002Violations.find((v) => v.variableName === "SEX");
    expect(sexViolation).toBeDefined();

    // Auto-fix adding SEX field
    const fixed = autoFixViolation(testStudy, sexViolation!);
    const allVars = fixed.forms[0].sections.flatMap((s) => s.fields).map((f) => f.variableName);
    expect(allVars).toContain("SEX");
  });

  it("should flag SD0005 for orphaned forms not assigned to any visit", () => {
    const orphanForm: CRFForm = {
      id: "form_orphan",
      name: "Unassigned Form",
      domain: "VS",
      description: "Not in visit schedule",
      version: "1.0",
      rules: [],
      sections: [],
    };

    const testStudy: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [...ONCOLOGY_RECIST_PRESET.forms, orphanForm],
    };

    const violations = validateStudyCompliance(testStudy);
    const sd0005 = violations.find((v) => v.ruleId === "SD0005" && v.formId === "form_orphan");
    expect(sd0005).toBeDefined();

    // Test Auto-Fix SD0005
    const fixed = autoFixViolation(testStudy, sd0005!);
    expect(fixed.visits[0].assignedFormIds).toContain("form_orphan");
  });

  it("should batch auto-fix all violations with autoFixAllViolations", () => {
    const brokenStudy: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [
        {
          id: "form_broken",
          name: "Broken Form",
          domain: "DM",
          description: "Multiple issues",
          version: "1.0",
          rules: [],
          sections: [
            {
              id: "sec_1",
              title: "Test",
              fields: [
                {
                  id: "f1",
                  variableName: "EXTRA_LONG_VARIABLE",
                  label: "Long",
                  dataType: "text",
                  columnSpan: 6,
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      visits: [
        {
          id: "v1",
          oid: "SE.V1",
          name: "Visit 1",
          visitType: "Scheduled",
          targetDay: 0,
          windowBefore: 0,
          windowAfter: 0,
          assignedFormIds: [],
        },
      ],
    };

    const { updatedStudy, fixedCount } = autoFixAllViolations(brokenStudy);
    expect(fixedCount).toBeGreaterThan(0);
    expect(updatedStudy.visits[0].assignedFormIds).toContain("form_broken");
  });
});
