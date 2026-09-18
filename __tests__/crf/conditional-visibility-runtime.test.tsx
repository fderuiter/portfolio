// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LiveEdcSimulator } from "@/components/crf/Modes/LiveEdcSimulator";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets";
import type { StudyProtocol, CRFField, EditCheckRule } from "@/lib/crf/types";

/**
 * End-to-end cover for #670: the conditional runtime is actually wired into
 * the EDC simulator, not merely available as a library.
 *
 * The unit-level contract lives in `conditional-logic.test.ts`. This suite
 * proves the two consequences that matter to an investigator filling in a
 * form: a hidden field leaves the accessibility tree entirely, and a field
 * made mandatory by a rule is marked as such.
 */

function textField(id: string, label: string, required = false): CRFField {
  return {
    id,
    variableName: id.toUpperCase(),
    label,
    dataType: "text",
    columnSpan: 6,
    required,
  } as CRFField;
}

/**
 * A study whose second field is hidden unless the first says "YES", and
 * becomes mandatory when it is shown.
 */
function buildConditionalStudy(): StudyProtocol {
  const trigger = textField("gate", "Gate answer");
  const dependent = textField("detail", "Conditional detail");

  const hideUnlessYes: EditCheckRule = {
    id: "rule_hide_detail",
    name: "Hide detail unless gate is YES",
    description: "",
    triggerFieldIds: ["gate"],
    actionType: "hide_field",
    targetFieldId: "detail",
    conditions: [{ fieldId: "gate", operator: "neq", value: "YES" }],
    logicalOperator: "AND",
  };

  const requireWhenYes: EditCheckRule = {
    id: "rule_require_detail",
    name: "Require detail when gate is YES",
    description: "",
    triggerFieldIds: ["gate"],
    actionType: "require_field",
    targetFieldId: "detail",
    conditions: [{ fieldId: "gate", operator: "eq", value: "YES" }],
    logicalOperator: "AND",
  };

  return {
    ...ONCOLOGY_RECIST_PRESET,
    forms: [
      {
        id: "form_cond",
        name: "Conditional Form",
        domain: "DM",
        description: "",
        version: "1.0",
        sections: [
          {
            id: "sec_1",
            title: "Gated Section",
            fields: [trigger, dependent],
          },
        ],
        rules: [hideUnlessYes, requireWhenYes],
      },
    ],
  } as StudyProtocol;
}

describe("[#670] Conditional visibility wired into the EDC simulator", () => {
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

  async function renderStudy(study: StudyProtocol) {
    await act(async () => {
      root.render(<LiveEdcSimulator study={study} />);
    });
  }

  function nativeSetValue(el: HTMLElement | null, value: string) {
    const proto =
      el instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
    el?.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * Overwriting a non-empty value trips the 21 CFR Part 11 reason-for-change
   * gate, which holds the edit until it is justified. Clearing it here keeps
   * these tests about conditional logic rather than about the audit modal.
   */
  async function clearPart11Prompt() {
    const reason = container.querySelector("textarea");
    if (!reason) return;

    await act(async () => {
      nativeSetValue(reason as HTMLTextAreaElement, "Conditional logic test");
    });

    const confirm = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Confirm Audit Signature")
    );
    await act(async () => {
      confirm?.click();
    });
  }

  async function setFieldValue(selector: string, value: string) {
    const input = container.querySelector(selector) as HTMLInputElement | null;
    expect(input).not.toBeNull();

    await act(async () => {
      nativeSetValue(input, value);
    });
    await clearPart11Prompt();
  }

  async function answerGate(value: string) {
    await setFieldValue("#ecrf-input-dm-gate", value);
  }

  it("keeps the field on screen while the gate is unanswered, and says why", async () => {
    await renderStudy(buildConditionalStudy());

    expect(container.textContent).toContain("Gate answer");

    // An unanswered gate makes `gate neq YES` genuinely undecidable, not
    // false. Per the documented precedence an undecidable rule never acts, so
    // the field keeps its declared default of being on screen rather than
    // being hidden on a guess.
    expect(container.textContent).toContain("Conditional detail");
    expect(container.textContent).toMatch(/could not evaluate/i);
  });

  it("omits a rule-hidden field from the DOM rather than dimming it", async () => {
    await renderStudy(buildConditionalStudy());
    await answerGate("NO");

    // The hide condition is now decidably true, so the dependent field must be
    // absent entirely - not present-but-disabled, which would still reach
    // screen readers and the tab order.
    expect(container.textContent).not.toContain("Conditional detail");
    expect(container.querySelector("#ecrf-input-dm-detail")).toBeNull();
  });

  it("reveals the field and marks it required once the gate says YES", async () => {
    await renderStudy(buildConditionalStudy());
    await answerGate("YES");

    // Now visible...
    expect(container.textContent).toContain("Conditional detail");
    expect(container.querySelector("#ecrf-input-dm-detail")).not.toBeNull();

    // ...and the rule-driven requiredness is surfaced, even though the field
    // itself was authored optional.
    expect(container.textContent).toContain("Hard Stop");
    expect(container.textContent).toContain("Require detail when gate is YES");
  });

  it("retains a hidden field's captured value instead of clearing it", async () => {
    await renderStudy(buildConditionalStudy());

    // Reveal the field, type into it, then hide it again.
    await answerGate("YES");
    await setFieldValue("#ecrf-input-dm-detail", "captured answer");

    await answerGate("NO");
    expect(container.querySelector("#ecrf-input-dm-detail")).toBeNull();

    // Bringing it back must restore the value, proving nothing was deleted
    // while the field was off screen.
    await answerGate("YES");
    const restored = container.querySelector(
      "#ecrf-input-dm-detail"
    ) as HTMLInputElement | null;
    expect(restored?.value).toBe("captured answer");
  });

  it("explains the resolved state to assistive technology", async () => {
    await renderStudy(buildConditionalStudy());

    const srText = Array.from(container.querySelectorAll(".sr-only"))
      .map((el) => el.textContent || "")
      .join(" ");

    // The visible gate field carries an explanation naming its source.
    expect(srText).toMatch(/Shown by default|Shown by/);
  });

  it("leaves an unconditional study's fields untouched", async () => {
    await renderStudy(ONCOLOGY_RECIST_PRESET);

    // Regression guard: the preset has no show/hide rules, so nothing should
    // disappear from the default form.
    const firstForm = ONCOLOGY_RECIST_PRESET.forms[0];
    const firstFieldLabel = firstForm.sections[0].fields[0].label;
    expect(container.textContent).toContain(firstFieldLabel);
  });
});
