/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

/**
 * This file tests CRFStudioContainer's own tab-routing and preset-switching
 * orchestration, not each lazily-loaded panel's internals — those already
 * have dedicated real-component coverage elsewhere (rule-graph-studio.test.tsx,
 * live-edc-simulation.test.tsx, branding-modal.test.tsx, workflow-wizard.test.tsx,
 * diagnostics-drawer.test.tsx, export-statistical-modal.test.tsx). Mounting
 * all nine real panels here paid their full AST/DAG/canvas setup cost on
 * every test and intermittently exceeded the timeout under full-suite CPU
 * contention (#651) despite finishing in well under a second in isolation.
 * These stubs render only the heading text this file asserts on, so the
 * container's own routing logic stays fully exercised without the redundant
 * real-panel cost.
 */
const VisitMatrixEditor = () => (
  <div>Protocol Visit Schedule Matrix (Schedule of Assessments)</div>
);
const RuleGraphStudio = () => (
  <div>Logic Dependency DAG &amp; AST Rule Studio</div>
);
const LiveEdcSimulator = () => (
  <div>Live 21 CFR Part 11 EDC Simulation Mode</div>
);
const AcrfOverlayViewer = () => (
  <div>Visual Annotated CRF (aCRF) Submission Studio</div>
);
const ExportImportModal = () => (
  <div>CDISC Standards &amp; Interoperability Exporter</div>
);
// Unasserted-on in this file; the real components early-return null when
// closed (the state these tests always leave them in), so a null stub is
// behaviorally equivalent here and skips their import/transform cost too.
const WorkflowWizardModal = () => null;
const BrandingConfigModal = () => null;
const DiagnosticsDrawer = () => null;
const SpotlightTourOverlay = () => null;

(globalThis as any).mockComponents = {
  VisitMatrixEditor,
  RuleGraphStudio,
  LiveEdcSimulator,
  WorkflowWizardModal,
  AcrfOverlayViewer,
  ExportImportModal,
  BrandingConfigModal,
  DiagnosticsDrawer,
  SpotlightTourOverlay,
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
        } else if (loaderStr.includes("AcrfOverlayViewer")) {
          Component = registry.AcrfOverlayViewer;
        } else if (loaderStr.includes("ExportImportModal")) {
          Component = registry.ExportImportModal;
        } else if (loaderStr.includes("BrandingConfigModal")) {
          Component = registry.BrandingConfigModal;
        } else if (loaderStr.includes("DiagnosticsDrawer")) {
          Component = registry.DiagnosticsDrawer;
        } else if (loaderStr.includes("SpotlightTourOverlay")) {
          Component = registry.SpotlightTourOverlay;
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
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok", data: {} }),
    } as any);
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

  it(
    "switches studio modes when clicking header tabs",
    { timeout: 45000 },
    async () => {
      await act(async () => {
        root = createRoot(container);
        root.render(<CRFStudioContainer />);
      });

      // Find and click Visit Matrix tab
      const buttons = Array.from(container.querySelectorAll("button"));
      const matrixBtn = buttons.find((b) =>
        b.textContent?.includes("Visit Matrix")
      );
      expect(matrixBtn).toBeDefined();

      await act(async () => {
        matrixBtn?.click();
      });
      expect(container.textContent).toContain("Protocol Visit Schedule Matrix");

      // Click Logic & Rules
      const rulesBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Logic & AST Rules")
      );
      await act(async () => {
        rulesBtn?.click();
      });
      expect(container.textContent).toContain(
        "Logic Dependency DAG & AST Rule Studio"
      );

      // Click Live EDC Test
      const edcBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Live 21 CFR EDC")
      );
      await act(async () => {
        edcBtn?.click();
      });
      expect(container.textContent).toContain(
        "Live 21 CFR Part 11 EDC Simulation Mode"
      );

      // Click Submission aCRF
      const acrfBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Annotated aCRF")
      );
      await act(async () => {
        acrfBtn?.click();
      });
      expect(container.textContent).toContain(
        "Visual Annotated CRF (aCRF) Submission Studio"
      );

      // Click Export / CDISC
      const exportBtn = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("CDISC / Exports")
      );
      await act(async () => {
        exportBtn?.click();
      });
      expect(container.textContent).toContain(
        "CDISC Standards & Interoperability Exporter"
      );
    }
  );

  it("switches between study presets cleanly", { timeout: 45000 }, async () => {
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

  it("does not hijack Ctrl/Cmd+Z from a focused form control (#658)", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const selectEl = container.querySelector("select") as HTMLSelectElement;
    expect(selectEl).toBeTruthy();
    selectEl.focus();
    expect(document.activeElement).toBe(selectEl);

    let event!: KeyboardEvent;
    await act(async () => {
      event = new KeyboardEvent("keydown", {
        key: "z",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      selectEl.dispatchEvent(event);
    });

    // The studio's document-level undo shortcut must leave native browser/editor
    // shortcuts alone while a form control (select, input, textarea, or a
    // contentEditable field) has focus, instead of calling preventDefault()
    // and jumping the whole study back regardless of what's focused.
    expect(event.defaultPrevented).toBe(false);
  });
});
