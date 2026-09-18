// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrfService } from "@/hooks/useCrfService";
import { CRFForm, CRFField } from "@/lib/crf/types";

describe("useCrfService Hook", () => {
  it("evaluates valid arithmetic formula via service contract", () => {
    const { result } = renderHook(() => useCrfService());

    let res: ReturnType<typeof result.current.evaluateFormula> | undefined;
    act(() => {
      res = result.current.evaluateFormula({
        formula: "SYS_BP - DIA_BP",
        fieldValues: { SYS_BP: 120, DIA_BP: 80 },
        fieldsList: [
          {
            id: "SYS_BP",
            variableName: "SYS_BP",
            label: "Systolic BP",
            dataType: "number",
          } as CRFField,
          {
            id: "DIA_BP",
            variableName: "DIA_BP",
            label: "Diastolic BP",
            dataType: "number",
          } as CRFField,
        ],
      });
    });

    expect(res?.success).toBe(true);
    if (res?.success) {
      expect(res.data.value).toBe(40);
    }
  });

  it("lints formula syntax cleanly", () => {
    const { result } = renderHook(() => useCrfService());

    let res: ReturnType<typeof result.current.lintFormula> | undefined;
    act(() => {
      res = result.current.lintFormula({
        formula: "AGE + 10",
        fieldsList: [
          {
            id: "AGE",
            variableName: "AGE",
            label: "Age",
            dataType: "number",
          } as CRFField,
        ],
      });
    });

    expect(res?.success).toBe(true);
  });

  it("lints form structure and produces diagnostics", () => {
    const { result } = renderHook(() => useCrfService());
    const sampleForm: CRFForm = {
      id: "form_1",
      name: "Sample Study Form",
      domain: "VS",
      description: "Vital Signs",
      version: "1.0",
      sections: [
        {
          id: "sec_1",
          title: "Vital Signs",
          fields: [
            {
              id: "SYS_BP",
              label: "Systolic BP",
              dataType: "number",
            } as CRFField,
          ],
        },
      ],
      rules: [],
    };

    let res: ReturnType<typeof result.current.lintForm> | undefined;
    act(() => {
      res = result.current.lintForm({
        form: sampleForm,
      });
    });

    expect(res?.success).toBe(true);
    if (res?.success) {
      expect(Array.isArray(res.data)).toBe(true);
    }
  });

  it("returns failure envelope for empty formula input", () => {
    const { result } = renderHook(() => useCrfService());

    let res: ReturnType<typeof result.current.evaluateFormula> | undefined;
    act(() => {
      res = result.current.evaluateFormula({
        formula: "",
        fieldValues: {},
        fieldsList: [],
      });
    });

    expect(res?.success).toBe(false);
    if (res && !res.success) {
      expect(res.error.code).toBe("EMPTY_FORMULA");
    }
  });
});
