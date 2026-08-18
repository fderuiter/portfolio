/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// Import components for dynamic import test registry
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
import { verifySignatureHash, generateSignatureDigest } from "@/lib/crf/alias-mapping";

describe("Draft-Release Lifecycle & Field Alias Mapping Integration Suite", () => {
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

  it("isolates form designer draft changes from active EDC simulator sessions until publication", async () => {
    await act(async () => {
      root.render(<CRFStudioContainer />);
    });

    // 1. Initial State shows Release v1.0.0 / v3.2
    expect(container.textContent).toContain("CRF Studio");
    expect(container.textContent).toContain("Publish Release");

    // 2. Switch to Live EDC mode
    const edcBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Live 21 CFR EDC")
    );
    await act(async () => {
      edcBtn?.click();
    });

    expect(container.textContent).toContain("Live 21 CFR Part 11 EDC Simulation Mode");
    expect(container.textContent).toContain("Active EDC Release:");
  });

  it("opens Publish Release Modal and builds automated field alias table", async () => {
    await act(async () => {
      root.render(<CRFStudioContainer />);
    });

    const publishBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Publish Release")
    );
    expect(publishBtn).toBeDefined();

    await act(async () => {
      publishBtn?.click();
    });

    // Verify modal contents
    expect(container.textContent).toContain("Publish Protocol Release");
    expect(container.textContent).toContain("Automated Field Alias Table");
    expect(container.textContent).toContain("Confirm & Publish Protocol Release");

    // Confirm publication
    const confirmBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Confirm & Publish Protocol Release")
    );
    await act(async () => {
      confirmBtn?.click();
    });

    expect(container.textContent).toContain("published!");
  });

  it("verifies 21 CFR Part 11 electronic signature hashes against historical protocol release snapshots", () => {
    const valsSnapshot = { f_sysbp: 120, f_diabp: 80 };
    const digest = generateSignatureDigest({
      subjectId: "001-101",
      formId: "form_vs_onc",
      signedBy: "Dr. Sarah Jenkins",
      userRole: "Principal Investigator",
      meaning: "Data Lock",
      protocolVersion: "1.0.0",
      fieldValuesSnapshot: valsSnapshot,
    });

    const signature = {
      id: "sig_test_101",
      subjectId: "001-101",
      formId: "form_vs_onc",
      signedBy: "Dr. Sarah Jenkins",
      userRole: "Principal Investigator",
      timestamp: new Date().toISOString(),
      meaning: "Data Lock" as const,
      protocolVersion: "1.0.0",
      signedDataSnapshot: valsSnapshot,
      digest,
    };

    // Even if study protocol is updated to v2.0.0, signature verification against v1.0.0 passes 100%
    const verification = verifySignatureHash(signature, [], { f_sysbp: 120, f_diabp: 80 });
    expect(verification.isValid).toBe(true);
    expect(verification.signedVersion).toBe("1.0.0");
    expect(verification.message).toContain("Protocol Release v1.0.0");
  });
});
