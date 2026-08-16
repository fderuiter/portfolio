/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// Statically import components to put in global mock registry
import { VisitMatrixEditor } from "@/components/crf/Modes/VisitMatrixEditor";
import { RuleGraphStudio } from "@/components/crf/Modes/RuleGraphStudio";
import { LiveEdcSimulator } from "@/components/crf/Modes/LiveEdcSimulator";
import { WorkflowWizardModal } from "@/components/crf/Wizard/WorkflowWizardModal";

(globalThis as any).mockComponents = {
  VisitMatrixEditor,
  RuleGraphStudio,
  LiveEdcSimulator,
  WorkflowWizardModal,
};

// Synchronous dynamic import mock for tests using global registry
vi.mock("next/dynamic", () => {
  return {
    default: (loader: any, options: any) => {
      const loaderStr = loader.toString();

      return function DynamicComponent(props: any) {
        const registry = (globalThis as any).mockComponents || {};
        let Component: any = null;

        if (loaderStr.includes("VisitMatrixEditor")) {
          Component = registry.VisitMatrixEditor;
        } else if (loaderStr.includes("RuleGraphStudio")) {
          Component = registry.RuleGraphStudio;
        } else if (loaderStr.includes("LiveEdcSimulator")) {
          Component = registry.LiveEdcSimulator;
        } else if (loaderStr.includes("WorkflowWizardModal")) {
          Component = registry.WorkflowWizardModal;
        }

        if (Component) {
          return React.createElement(Component, props);
        }
        if (options && options.loading) {
          return options.loading();
        }
        return null;
      };
    },
  };
});

import { CRFStudioContainer } from "@/components/crf/CRFStudioContainer";

describe("CRFStudioContainer Component", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
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

  it("renders the CRF Studio header and initial form successfully", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    expect(container.textContent).toContain("CRF Studio");
    expect(container.textContent).toContain("Form Designer");
    expect(container.textContent).toContain("Visit Matrix (SoA)");
    expect(container.textContent).toContain("Logic & AST Rules");
    expect(container.textContent).toContain("Live 21 CFR EDC");
  });

  it("switches studio modes when clicking header tabs", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    // Find and click Visit Matrix tab
    const buttons = Array.from(container.querySelectorAll("button"));
    const matrixBtn = buttons.find((b) => b.textContent?.includes("Visit Matrix"));
    expect(matrixBtn).toBeDefined();

    await act(async () => {
      matrixBtn?.click();
    });
    expect(container.textContent).toContain("Protocol Visit Schedule Matrix");

    // Click Logic & Rules
    const rulesBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Logic & AST Rules")
    );
    await act(async () => {
      rulesBtn?.click();
    });
    expect(container.textContent).toContain("Logic Dependency DAG & AST Rule Studio");

    // Click Live EDC Test
    const edcBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Live 21 CFR EDC")
    );
    await act(async () => {
      edcBtn?.click();
    });
    expect(container.textContent).toContain("Live 21 CFR Part 11 EDC Simulation Mode");

    // Click Submission aCRF
    const acrfBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Annotated aCRF")
    );
    await act(async () => {
      acrfBtn?.click();
    });
    expect(container.textContent).toContain("Visual Annotated CRF (aCRF) Submission Studio");

    // Click Export / CDISC
    const exportBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("CDISC / Exports")
    );
    await act(async () => {
      exportBtn?.click();
    });
    expect(container.textContent).toContain("CDISC Standards & Interoperability Exporter");
  });

  it("switches between study presets cleanly", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const selectEl = container.querySelector("select");
    expect(selectEl).toBeDefined();

    await act(async () => {
      if (selectEl) {
        selectEl.value = "cns_neuro";
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    expect(container.textContent).toContain("Phase II");
  });
});
