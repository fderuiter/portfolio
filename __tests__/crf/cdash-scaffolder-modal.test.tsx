// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CdashScaffolderModal } from "@/components/crf/LeftSidebar/CdashScaffolderModal";

describe("CdashScaffolderModal Component", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("does not render modal contents when isOpen is false", () => {
    act(() => {
      root.render(
        <CdashScaffolderModal
          isOpen={false}
          onClose={vi.fn()}
          onInjectForm={vi.fn()}
        />
      );
    });

    expect(container.innerHTML).toBe("");
  });

  it("renders header, filter tabs, and all 13 standard domain items when open with default 'all' category", async () => {
    await act(async () => {
      root.render(
        <CdashScaffolderModal
          isOpen={true}
          onClose={vi.fn()}
          onInjectForm={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain("1-Click CDASH Domain Scaffolder");
    expect(container.textContent).toContain("All Domains (13)");
    expect(container.textContent).toContain("Medical Device (ISO 14155)");
    expect(container.textContent).toContain("Drug & Biologics");
    expect(container.textContent).toContain("Safety & Core CDASH");

    // All 13 inject buttons should be rendered initially
    const injectButtons = Array.from(
      container.querySelectorAll("button")
    ).filter((b) => b.textContent?.includes("Inject Form"));
    expect(injectButtons.length).toBe(13);
  });

  it("filters domain list correctly when category tabs are clicked", async () => {
    await act(async () => {
      root.render(
        <CdashScaffolderModal
          isOpen={true}
          onClose={vi.fn()}
          onInjectForm={vi.fn()}
        />
      );
    });

    // Switch to Medical Device tab
    const deviceTab = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Medical Device (ISO 14155)")
    );
    expect(deviceTab).toBeDefined();

    await act(async () => {
      deviceTab?.click();
    });

    let injectButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Inject Form")
    );
    expect(injectButtons.length).toBe(3); // DI, DU, DE
    expect(container.textContent).toContain(
      "Medical Device Identifiers & UDI (DI)"
    );
    expect(container.textContent).toContain(
      "Device Implantation & In-Use (DU)"
    );
    expect(container.textContent).toContain(
      "Device Deficiencies & Incidents (DE)"
    );

    // Switch to Drug & Biologics tab
    const drugTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Drug & Biologics")
    );
    expect(drugTab).toBeDefined();

    await act(async () => {
      drugTab?.click();
    });

    injectButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Inject Form")
    );
    expect(injectButtons.length).toBe(4); // DA, EX, MH, DS
    expect(container.textContent).toContain(
      "Drug Accountability & Dispensation (DA)"
    );

    // Switch to Safety & Core CDASH tab
    const coreTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Safety & Core CDASH")
    );
    expect(coreTab).toBeDefined();

    await act(async () => {
      coreTab?.click();
    });

    injectButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Inject Form")
    );
    expect(injectButtons.length).toBe(6); // DM, VS, AE, CM, LB, RECIST
    expect(container.textContent).toContain("Demographics & Consent (DM)");
    expect(container.textContent).toContain(
      "Vital Signs & Physical Metrics (VS)"
    );

    // Switch back to All Domains
    const allTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("All Domains")
    );
    await act(async () => {
      allTab?.click();
    });

    injectButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent?.includes("Inject Form")
    );
    expect(injectButtons.length).toBe(13);
  });

  it("triggers domain injection callback and closes modal on Inject Form button click", async () => {
    const handleClose = vi.fn();
    const handleInjectForm = vi.fn();

    await act(async () => {
      root.render(
        <CdashScaffolderModal
          isOpen={true}
          onClose={handleClose}
          onInjectForm={handleInjectForm}
        />
      );
    });

    // Find the DM domain inject button
    const dmButton = Array.from(container.querySelectorAll("button")).find(
      (b) => {
        const card = b.closest("div");
        return (
          b.textContent?.includes("Inject Form") &&
          card?.textContent?.includes("Demographics & Consent (DM)")
        );
      }
    );

    expect(dmButton).toBeDefined();

    await act(async () => {
      dmButton?.click();
    });

    expect(handleInjectForm).toHaveBeenCalledTimes(1);
    const injectedForm = handleInjectForm.mock.calls[0][0];
    expect(injectedForm.domain).toBe("DM");
    expect(injectedForm.name).toContain("Demographics");
    expect(injectedForm.sections.length).toBeGreaterThan(0);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when header close button or footer Done button is clicked", async () => {
    const handleClose = vi.fn();

    await act(async () => {
      root.render(
        <CdashScaffolderModal
          isOpen={true}
          onClose={handleClose}
          onInjectForm={vi.fn()}
        />
      );
    });

    // Footer "Done" button
    const doneButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "Done"
    );
    expect(doneButton).toBeDefined();

    await act(async () => {
      doneButton?.click();
    });

    expect(handleClose).toHaveBeenCalledTimes(1);

    // Header close button (the SVG icon button)
    const headerCloseButton = Array.from(
      container.querySelectorAll("button")
    ).find(
      (b) => b.querySelector("svg") && !b.textContent?.includes("Inject Form")
    );

    expect(headerCloseButton).toBeDefined();

    await act(async () => {
      headerCloseButton?.click();
    });

    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
