import { describe, it, expect } from "vitest";
import { computeFormHealthMetrics } from "@/lib/crf/form-health";
import { CRFForm } from "@/lib/crf/types";

describe("computeFormHealthMetrics", () => {
  it("computes accurate variable counts, mandatory fields, codelist attachments, and SDV readiness", () => {
    const mockForm: CRFForm = {
      id: "form_demog",
      name: "Demographics",
      domain: "DM",
      description: "Demographics Case Report Form",
      version: "1.0",
      sections: [
        {
          id: "sec_1",
          title: "General",
          fields: [
            {
              id: "f1",
              variableName: "SUBJID",
              label: "Subject Identifier",
              dataType: "text",
              required: true,
              columnSpan: 6,
              sdvVerified: true,
            },
            {
              id: "f2",
              variableName: "SEX",
              label: "Sex",
              dataType: "radio",
              required: true,
              codelistId: "CL_SEX",
              columnSpan: 6,
              sdvVerified: false,
            },
            {
              id: "f3",
              variableName: "ETHNIC",
              label: "Ethnicity",
              dataType: "single_select",
              required: false,
              customOptions: [
                { code: "HISP", label: "Hispanic", order: 1 },
                { code: "NOT_HISP", label: "Not Hispanic", order: 2 },
              ],
              columnSpan: 12,
              sdvVerified: true,
            },
          ],
        },
      ],
      rules: [],
    };

    const metrics = computeFormHealthMetrics(mockForm);

    expect(metrics.totalFields).toBe(3);
    expect(metrics.mandatoryFields).toBe(2);
    expect(metrics.codelistsAttached).toBe(2);
    expect(metrics.sdvVerifiedCount).toBe(2);
    expect(metrics.sdvReadinessPercentage).toBe(67); // 2/3 rounded
  });

  it("calculates CDASH conformance percentage and identifies missing core domain variables", () => {
    const incompleteDMForm: CRFForm = {
      id: "form_dm",
      name: "Demographics",
      domain: "DM",
      description: "Incomplete Demographics Form",
      version: "1.0",
      sections: [
        {
          id: "sec_1",
          title: "Demographics",
          fields: [
            {
              id: "f1",
              variableName: "AGE",
              label: "Age",
              dataType: "integer",
              required: true,
              columnSpan: 6,
            },
          ],
        },
      ],
      rules: [],
    };

    const metrics = computeFormHealthMetrics(incompleteDMForm);

    expect(metrics.cdashConformancePercentage).toBeLessThan(100);
    expect(metrics.missingCoreVariables).toContain("SEX");
  });
});
