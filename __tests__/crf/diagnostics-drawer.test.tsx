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

  it("organizes issues into Form Logic and Regulatory Conformance tabs with independent badges", async () => {
    const studyWithBothIssues: StudyProtocol = {
      id: "test-study-001",
      protocolNumber: "TEST-001",
      studyName: "Test Protocol",
      phase: "Phase I",
      therapeuticArea: "Oncology",
      sponsor: "Test Sponsor",
      version: "1.0",
      lastModified: "2026-08-18",
      codelists: [],
      forms: [
        {
          id: "form_both",
          name: "Test Form",
          domain: "CUSTOM",
          description: "Testing both",
          version: "1.0",
          rules: [],
          sections: [
            {
              id: "sec_1",
              title: "Section 1",
              fields: [
                {
                  id: "f_no_var",
                  variableName: "", // Form logic error: missing variable name
                  label: "Field Without Var",
                  dataType: "text",
                  columnSpan: 6,
                  required: false,
                },
                {
                  id: "f_long_var",
                  variableName: "LONG_VAR_NAME_HERE", // Regulatory error: exceeds 8 chars
                  label: "Long Var Field",
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
          assignedFormIds: ["form_both"],
        },
      ],
    };

    const onSelectForm = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        <DiagnosticsDrawer
          isOpen={true}
          study={studyWithBothIssues}
          onClose={onClose}
          onSelectForm={onSelectForm}
        />
      );
    });

    // Check tab buttons and badges
    const tabs = Array.from(container.querySelectorAll("button[role='tab']"));
    expect(tabs.length).toBe(2);

    const formLogicTab = tabs.find((t) => t.textContent?.includes("Form Logic")) as HTMLElement | undefined;
    const regulatoryTab = tabs.find((t) => t.textContent?.includes("Regulatory Conformance")) as HTMLElement | undefined;

    expect(formLogicTab).toBeDefined();
    expect(regulatoryTab).toBeDefined();

    expect(formLogicTab?.textContent).toContain("1");
    expect(regulatoryTab?.textContent).toContain("1");

    // Click Form Logic Tab and inspect field
    await act(async () => {
      formLogicTab?.click();
    });

    expect(container.textContent).toContain("missing a CDASH/SDTM Variable Name");

    const inspectFieldBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Inspect Field")
    );
    expect(inspectFieldBtn).toBeDefined();

    await act(async () => {
      inspectFieldBtn?.click();
    });

    expect(onSelectForm).toHaveBeenCalledWith("form_both", "f_no_var");
    expect(onClose).toHaveBeenCalled();
  });
});
