// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LiveEdcSimulator } from "@/components/crf/Modes/LiveEdcSimulator";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";

describe("Live 21 CFR Part 11 EDC Simulation Suite", () => {
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

  it("renders the EDC Simulator header and initial Patient Form Entry view", async () => {
    await act(async () => {
      root.render(<LiveEdcSimulator study={ONCOLOGY_RECIST_PRESET} />);
    });

    expect(container.textContent).toContain("Live 21 CFR Part 11 EDC Simulation Mode");
    expect(container.textContent).toContain("Patient Form Entry");
    expect(container.textContent).toContain("Subject Status Matrix");
    expect(container.textContent).toContain("Discrepancy Queries");
    expect(container.textContent).toContain("Part 11 Audit Trail");
  });

  it("switches between EDC sub-views (Status Matrix, Queries, Audit Trail)", async () => {
    await act(async () => {
      root.render(<LiveEdcSimulator study={ONCOLOGY_RECIST_PRESET} />);
    });

    // 1. Switch to Subject Status Matrix
    const matrixTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Subject Status Matrix")
    );
    expect(matrixTab).toBeDefined();

    await act(async () => {
      matrixTab?.click();
    });

    expect(container.textContent).toContain("Longitudinal Subject vs. Visit Progression Matrix");
    expect(container.textContent).toContain("001-101");

    // 2. Switch to Discrepancy Queries
    const queriesTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Discrepancy Queries")
    );
    await act(async () => {
      queriesTab?.click();
    });

    expect(container.textContent).toContain("Clinical Discrepancy & Query Management Ledger");

    // 3. Switch to Audit Trail
    const auditTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Part 11 Audit Trail")
    );
    await act(async () => {
      auditTab?.click();
    });

    expect(container.textContent).toContain("21 CFR Part 11 Immutable Audit Trail Log");
  });

  it("allows CRA role to toggle Source Data Verification (SDV) on fields", async () => {
    await act(async () => {
      root.render(<LiveEdcSimulator study={ONCOLOGY_RECIST_PRESET} />);
    });

    // Click CRA Monitor role button
    const craRoleBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.trim() === "CRA Monitor"
    );
    expect(craRoleBtn).toBeDefined();

    await act(async () => {
      craRoleBtn?.click();
    });

    // Find CRA SDV button on field
    const sdvBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("SDV Verify") || b.textContent?.includes("SDV Done")
    );
    expect(sdvBtn).toBeDefined();

    await act(async () => {
      sdvBtn?.click();
    });

    // Verify SDV verified status
    expect(container.textContent).toContain("SDV Done");
  });

  it("supports Principal Investigator (PI) Form Locking and digital signatures", async () => {
    await act(async () => {
      root.render(<LiveEdcSimulator study={ONCOLOGY_RECIST_PRESET} />);
    });

    // Click Principal Investigator role button
    const piRoleBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.trim() === "Principal Investigator"
    );
    expect(piRoleBtn).toBeDefined();

    await act(async () => {
      piRoleBtn?.click();
    });

    // Find Lock & Sign Form button
    const lockBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Lock & Sign (PI)")
    );
    expect(lockBtn).toBeDefined();

    await act(async () => {
      lockBtn?.click();
    });

    // Verify form is now locked with digital signature badge
    expect(container.textContent).toContain("Locked (PI)");
  });
});
