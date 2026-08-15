/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
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
    expect(container.textContent).toContain("Visit Matrix");
    expect(container.textContent).toContain("Logic & Rules");
    expect(container.textContent).toContain("Live EDC Test");
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
      b.textContent?.includes("Logic & Rules")
    );
    await act(async () => {
      rulesBtn?.click();
    });
    expect(container.textContent).toContain("Logic Dependency DAG & AST Rule Studio");

    // Click Live EDC Test
    const edcBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Live EDC Test")
    );
    await act(async () => {
      edcBtn?.click();
    });
    expect(container.textContent).toContain("Live 21 CFR Part 11 EDC Simulation Mode");

    // Click Submission aCRF
    const acrfBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Submission aCRF")
    );
    await act(async () => {
      acrfBtn?.click();
    });
    expect(container.textContent).toContain("Visual Annotated CRF (aCRF) Submission Studio");

    // Click Export / CDISC
    const exportBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Export / CDISC")
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
