// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { WorkflowWizardModal } from "@/components/crf/Wizard/WorkflowWizardModal";
import { SpotlightTourOverlay } from "@/components/crf/Wizard/SpotlightTourOverlay";

describe("WorkflowWizardModal & SpotlightTourOverlay Test Suite", () => {
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
        <WorkflowWizardModal
          isOpen={false}
          onClose={vi.fn()}
          onSwitchMode={vi.fn()}
          onStartSpotlightTour={vi.fn()}
        />
      );
    });

    expect(container.children.length).toBe(0);
  });

  it("renders Stage 1 (CDASH 2.2 Form & Canvas Design) when opened", async () => {
    await act(async () => {
      root.render(
        <WorkflowWizardModal
          isOpen={true}
          onClose={vi.fn()}
          onSwitchMode={vi.fn()}
          onStartSpotlightTour={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain("CDASH 2.2 Form & Canvas Design");
    expect(container.textContent).toContain("Stage 1 of 5");
    expect(container.textContent).toContain("12-Column Responsive Grid");
  });

  it("navigates across stages when clicking Next and Previous buttons", async () => {
    await act(async () => {
      root.render(
        <WorkflowWizardModal
          isOpen={true}
          onClose={vi.fn()}
          onSwitchMode={vi.fn()}
          onStartSpotlightTour={vi.fn()}
        />
      );
    });

    // Find Next Stage button
    const nextBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Next Stage")
    );
    expect(nextBtn).toBeDefined();

    await act(async () => {
      nextBtn?.click();
    });

    // Should now be on Stage 2: Schedule of Activities
    expect(container.textContent).toContain("Schedule of Activities (SoA Matrix)");
    expect(container.textContent).toContain("Stage 2 of 5");

    // Click Previous Stage
    const prevBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Previous Stage")
    );
    expect(prevBtn).toBeDefined();

    await act(async () => {
      prevBtn?.click();
    });

    expect(container.textContent).toContain("CDASH 2.2 Form & Canvas Design");
    expect(container.textContent).toContain("Stage 1 of 5");
  });

  it("triggers onSwitchMode and closes modal when live action is clicked", async () => {
    const handleSwitchMode = vi.fn();
    const handleClose = vi.fn();

    await act(async () => {
      root.render(
        <WorkflowWizardModal
          isOpen={true}
          onClose={handleClose}
          onSwitchMode={handleSwitchMode}
          onStartSpotlightTour={vi.fn()}
        />
      );
    });

    const actionBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Open Form Canvas")
    );
    expect(actionBtn).toBeDefined();

    await act(async () => {
      actionBtn?.click();
    });

    expect(handleSwitchMode).toHaveBeenCalledWith("designer");
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders and steps through SpotlightTourOverlay", async () => {
    const handleClose = vi.fn();

    await act(async () => {
      root.render(<SpotlightTourOverlay isOpen={true} onClose={handleClose} />);
    });

    expect(container.textContent).toContain("Interactive UI Tour");
    expect(container.textContent).toContain("Step 1 of 5");
    expect(container.textContent).toContain("Left Palette & 1-Click CDASH Scaffolder");

    const nextStepBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Next Step")
    );
    expect(nextStepBtn).toBeDefined();

    await act(async () => {
      nextStepBtn?.click();
    });

    expect(container.textContent).toContain("Step 2 of 5");
    expect(container.textContent).toContain("Center 12-Column Responsive Canvas");
  });
});
