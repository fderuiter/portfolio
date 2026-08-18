// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStudyDiagnostics } from "@/hooks/useStudyDiagnostics";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudyProtocol } from "@/lib/crf/types";

describe("useStudyDiagnostics Hook", () => {
  it("computes 0 total issues for clean preset", () => {
    const { result } = renderHook(() => useStudyDiagnostics(ONCOLOGY_RECIST_PRESET));

    expect(result.current.totalIssues).toBe(0);
    expect(result.current.formLogicCount).toBe(0);
    expect(result.current.regulatoryCount).toBe(0);
    expect(result.current.formLogicIssues).toEqual([]);
    expect(result.current.regulatoryViolations).toEqual([]);
  });

  it("combines form logic issues and regulatory violations accurately", () => {
    const studyWithBoth: StudyProtocol = {
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
                  id: "f1",
                  variableName: "", // Missing variable name -> Form Logic Error
                  label: "Label 1",
                  dataType: "text",
                  columnSpan: 6,
                  required: false,
                },
                {
                  id: "f2",
                  variableName: "LONG_VAR_NAME_EXCEEDS_LIMIT", // Name > 8 chars -> Regulatory Error (SD0001)
                  label: "Label 2",
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

    const { result } = renderHook(() => useStudyDiagnostics(studyWithBoth));

    expect(result.current.formLogicCount).toBeGreaterThanOrEqual(1);
    expect(result.current.regulatoryCount).toBeGreaterThanOrEqual(1);
    expect(result.current.totalIssues).toBe(
      result.current.formLogicCount + result.current.regulatoryCount
    );

    // Form logic item should contain formId and formName
    const formLogicItem = result.current.formLogicIssues.find((item) => item.fieldId === "f1");
    expect(formLogicItem).toBeDefined();
    expect(formLogicItem?.formId).toBe("form_test");
    expect(formLogicItem?.formName).toBe("Test Form");
  });
});
