// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DiagnosticsDrawer } from "@/components/crf/DiagnosticsDrawer";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudyProtocol } from "@/lib/crf/types";

describe("DiagnosticsDrawer & CDISC Conformance Studio Suite", () => {
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

  it("does not render when isOpen is false", async () => {
    await act(async () => {
      root.render(
        <DiagnosticsDrawer
          isOpen={false}
          study={ONCOLOGY_RECIST_PRESET}
          onClose={vi.fn()}
          onSelectForm={vi.fn()}
        />
      );
    });

    expect(container.children.length).toBe(0);
  });

  it("renders Clean Schema message when study has zero compliance violations", async () => {
    await act(async () => {
      root.render(
        <DiagnosticsDrawer
          isOpen={true}
          study={ONCOLOGY_RECIST_PRESET}
          onClose={vi.fn()}
          onSelectForm={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain("CDISC Conformance & Regulatory Validation Studio");
    expect(container.textContent).toContain("100% CDISC & SDTM Compliant");
  });

  it("displays violations and allows 1-Click Auto-Fixing when schema issues exist", async () => {
    const studyWithIssues: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [
        {
          id: "form_issues",
          name: "Faulty Form",
          domain: "DM",
          description: "Issues",
          version: "1.0",
          rules: [],
          sections: [
            {
              id: "sec_1",
              title: "Test",
              fields: [
                {
                  id: "f_too_long",
                  variableName: "VERY_LONG_NAME_TEST",
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
          assignedFormIds: ["form_issues"],
        },
      ],
    };

    const onUpdateStudy = vi.fn();

    await act(async () => {
      root.render(
        <DiagnosticsDrawer
          isOpen={true}
          study={studyWithIssues}
          onClose={vi.fn()}
          onSelectForm={vi.fn()}
          onUpdateStudy={onUpdateStudy}
        />
      );
    });

    expect(container.textContent).toContain("SD0001");
    expect(container.textContent).toContain("VERY_LONG_NAME_TEST");

    // Click "Fix Rule" button
    const fixRuleBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Fix Rule")
    );
    expect(fixRuleBtn).toBeDefined();

    await act(async () => {
      fixRuleBtn?.click();
    });

    expect(onUpdateStudy).toHaveBeenCalled();
  });

  it("triggers 1-Click Auto-Fix All to remediate entire study protocol", async () => {
    const studyWithIssues: StudyProtocol = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: [
        {
          id: "form_issues",
          name: "Faulty Form",
          domain: "DM",
          description: "Issues",
          version: "1.0",
          rules: [],
          sections: [
            {
              id: "sec_1",
              title: "Test",
              fields: [
                {
                  id: "f_too_long",
                  variableName: "VERY_LONG_NAME_TEST",
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
          assignedFormIds: ["form_issues"],
        },
      ],
    };

    const onUpdateStudy = vi.fn();

    await act(async () => {
      root.render(
        <DiagnosticsDrawer
          isOpen={true}
          study={studyWithIssues}
          onClose={vi.fn()}
          onSelectForm={vi.fn()}
          onUpdateStudy={onUpdateStudy}
        />
      );
    });

    const fixAllBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("1-Click Auto-Fix All")
    );
    expect(fixAllBtn).toBeDefined();

    await act(async () => {
      fixAllBtn?.click();
    });

    expect(onUpdateStudy).toHaveBeenCalled();
  });
});
