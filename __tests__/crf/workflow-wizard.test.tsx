// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { WorkflowWizardModal } from "@/components/crf/Wizard/WorkflowWizardModal";
import { getOncologyPresetSync } from "@/lib/crf/presets/loader";

describe("WorkflowWizardModal Component", () => {
  let container: HTMLDivElement;
  let root: Root;
  const sampleStudy = getOncologyPresetSync();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("does not render when isOpen is false", () => {
    act(() => {
      root.render(
        <WorkflowWizardModal
          isOpen={false}
          study={sampleStudy}
          onClose={vi.fn()}
          onSwitchMode={vi.fn()}
          onStartSpotlightTour={vi.fn()}
        />
      );
    });

    expect(container.innerHTML).toBe("");
  });

  it("renders 5 stages and allows step navigation and deployment", async () => {
    const handleClose = vi.fn();
    const handleSwitchMode = vi.fn();
    const handleApplyStudy = vi.fn();

    await act(async () => {
      root.render(
        <WorkflowWizardModal
          isOpen={true}
          study={sampleStudy}
          onClose={handleClose}
          onSwitchMode={handleSwitchMode}
          onApplyStudy={handleApplyStudy}
          onStartSpotlightTour={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain("CRF Protocol Authoring Wizard");
    expect(container.textContent).toContain("Step 1 of 5");
    expect(container.textContent).toContain("Choose Starting Archetype");

    // Click "Next Stage" button
    const nextButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Next Stage")
    );
    expect(nextButtons.length).toBeGreaterThan(0);

    // Step to Stage 2
    await act(async () => {
      nextButtons[0].click();
    });
    expect(container.textContent).toContain("Step 2 of 5");
    expect(container.textContent).toContain("Select CDASH & Medical Device Domains");

    // Step to Stage 3
    const nextBtn2 = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Next Stage")
    );
    await act(async () => {
      nextBtn2?.click();
    });
    expect(container.textContent).toContain("Step 3 of 5");
    expect(container.textContent).toContain("Schedule of Activities (SoA) Matrix");

    // Step to Stage 4
    const nextBtn3 = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Next Stage")
    );
    await act(async () => {
      nextBtn3?.click();
    });
    expect(container.textContent).toContain("Step 4 of 5");
    expect(container.textContent).toContain("Clinical Calculations & AST Edit Checks");

    // Step to Stage 5
    const nextBtn4 = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Next Stage")
    );
    await act(async () => {
      nextBtn4?.click();
    });
    expect(container.textContent).toContain("Step 5 of 5");
    expect(container.textContent).toContain("Regulatory & Logic Conformance Audit");
    expect(container.textContent).toContain("Deploy Protocol to Studio Canvas");

    // Click Deploy
    const deployBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Deploy Protocol")
    );
    expect(deployBtn).toBeDefined();

    await act(async () => {
      deployBtn?.click();
    });

    expect(handleApplyStudy).toHaveBeenCalled();
    expect(handleSwitchMode).toHaveBeenCalledWith("designer");
    expect(handleClose).toHaveBeenCalled();
  });
});
