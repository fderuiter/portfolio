// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RuleGraphStudio } from "@/components/crf/Modes/RuleGraphStudio";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets";
import { StudyProtocol } from "@/lib/crf/types";

describe("RuleGraphStudio & Formula Sandbox Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("renders the Logic Dependency DAG and Formula Evaluator sections", async () => {
    await act(async () => {
      root.render(<RuleGraphStudio study={ONCOLOGY_RECIST_PRESET} />);
    });

    expect(container.textContent).toContain(
      "Logic Dependency DAG & AST Rule Studio"
    );
    expect(container.textContent).toContain(
      "Visual Execution Flow & Trigger Dependencies (DAG)"
    );
    expect(container.textContent).toContain(
      "AST Formula Evaluator & Clinical Calculation Studio"
    );
  });

  it("inserts mathematical tokens into the formula sandbox when clicking token pills", async () => {
    await act(async () => {
      root.render(<RuleGraphStudio study={ONCOLOGY_RECIST_PRESET} />);
    });

    const sqrtBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "sqrt("
    );
    expect(sqrtBtn).toBeDefined();

    await act(async () => {
      sqrtBtn?.click();
    });

    const formulaInput = container.querySelector(
      'input[value*="sqrt"]'
    ) as HTMLInputElement;
    expect(formulaInput).not.toBeNull();
  });

  it("detects circular dependencies in the study logic DAG", async () => {
    const studyWithCircularRules: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [
        {
          id: "form_cycle",
          name: "Circular Form",
          domain: "VS",
          description: "Contains cycle",
          version: "1.0",
          sections: [
            {
              id: "sec_1",
              title: "Test",
              fields: [
                {
                  id: "f_a",
                  variableName: "VAR_A",
                  label: "A",
                  dataType: "number",
                  columnSpan: 6,
                  required: true,
                },
                {
                  id: "f_b",
                  variableName: "VAR_B",
                  label: "B",
                  dataType: "number",
                  columnSpan: 6,
                  required: true,
                },
              ],
            },
          ],
          rules: [
            {
              id: "rule_a_to_b",
              name: "A derives B",
              description: "A sets B",
              triggerFieldIds: ["f_a"],
              targetFieldId: "f_b",
              actionType: "set_value",
              conditions: [{ fieldId: "f_a", operator: "gt", value: 0 }],
              logicalOperator: "AND",
            },
            {
              id: "rule_b_to_a",
              name: "B derives A",
              description: "B sets A (Circular)",
              triggerFieldIds: ["f_b"],
              targetFieldId: "f_a",
              actionType: "set_value",
              conditions: [{ fieldId: "f_b", operator: "gt", value: 0 }],
              logicalOperator: "AND",
            },
          ],
        },
      ],
    };

    await act(async () => {
      root.render(<RuleGraphStudio study={studyWithCircularRules} />);
    });

    expect(container.textContent).toContain("Circular Dependency Detected");
  });
});
