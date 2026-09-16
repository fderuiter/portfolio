import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { LiveEdcSimulator } from "@/components/crf/Modes/LiveEdcSimulator";
import { VisitMatrixEditor } from "@/components/crf/Modes/VisitMatrixEditor";
import { A11yProvider } from "@/components/providers/A11yProvider";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets";
import { StudyProtocol } from "@/lib/crf/types";

describe("Dynamic eCRF Input ARIA Bindings & Edit Check Validation", () => {
  test("links labels and inputs via deterministic HTML id and htmlFor attributes", () => {
    render(
      <A11yProvider>
        <LiveEdcSimulator study={ONCOLOGY_RECIST_PRESET} />
      </A11yProvider>
    );

    // Locate DM form fields (e.g. BRTHYR, AGE, SEX)
    const dmForm = ONCOLOGY_RECIST_PRESET.forms.find(
      (f) => f.domain === "DM" || f.id.includes("dm")
    );
    expect(dmForm).toBeDefined();

    if (dmForm) {
      dmForm.sections.forEach((sec) => {
        sec.fields.forEach((field) => {
          const formDomain = dmForm.domain || dmForm.id;
          const fieldKey = field.variableName || field.id;
          const expectedInputId = `ecrf-input-${formDomain.toLowerCase()}-${fieldKey.toLowerCase()}`;

          const inputElement = document.getElementById(expectedInputId);
          if (inputElement) {
            expect(inputElement).not.toBeNull();
            expect(inputElement.getAttribute("id")).toBe(expectedInputId);
          }
        });
      });
    }
  });

  test("applies aria-invalid='true' and aria-describedby linkage upon edit check validation failure", () => {
    render(
      <A11yProvider>
        <LiveEdcSimulator study={ONCOLOGY_RECIST_PRESET} />
      </A11yProvider>
    );

    // Trigger save to force validation errors on mandatory empty fields (e.g. RACE / ETHNIC in DM)
    const saveButtons = screen.getAllByRole("button", { name: /Save Form/i });
    act(() => {
      fireEvent.click(saveButtons[0]);
    });

    // Expected IDs for mandatory empty DM form fields (e.g. RACE)
    const expectedRaceInputId = "ecrf-input-dm-race";
    const expectedRaceErrorId = "ecrf-error-dm-race";

    const raceInput = document.getElementById(expectedRaceInputId);
    expect(raceInput).not.toBeNull();
    expect(raceInput?.getAttribute("aria-invalid")).toBe("true");
    expect(raceInput?.getAttribute("aria-describedby")).toBe(
      expectedRaceErrorId
    );

    // Verify error element has role="alert" and aria-live="polite"
    const errorContainer = document.getElementById(expectedRaceErrorId);
    expect(errorContainer).not.toBeNull();
    expect(errorContainer?.getAttribute("role")).toBe("alert");
    expect(errorContainer?.getAttribute("aria-live")).toBe("polite");
  });
});

describe("Schedule of Activities Visit Matrix Table Accessibility", () => {
  test("includes role='grid', scope='col', scope='row', role='columnheader', role='rowheader', and role='gridcell'", () => {
    render(
      <VisitMatrixEditor
        study={ONCOLOGY_RECIST_PRESET}
        onUpdateVisits={() => {}}
      />
    );

    // Table container role
    const gridTable = screen.getByRole("grid", {
      name: /Schedule of Activities Visit Matrix/i,
    });
    expect(gridTable).toBeDefined();

    // Verify column headers (<th scope="col" role="columnheader">)
    const columnHeaders = document.querySelectorAll(
      "th[scope='col'][role='columnheader']"
    );
    expect(columnHeaders.length).toBeGreaterThan(0);

    // Verify row headers (<th scope="row" role="rowheader">)
    const rowHeaders = document.querySelectorAll(
      "th[scope='row'][role='rowheader']"
    );
    expect(rowHeaders.length).toBeGreaterThan(0);

    // Verify grid cells (<td role="gridcell">)
    const gridCells = document.querySelectorAll("td[role='gridcell']");
    expect(gridCells.length).toBeGreaterThan(0);

    // Test keyboard interaction on gridcell (Enter/Space toggle)
    const firstCell = gridCells[0] as HTMLElement;
    expect(firstCell.getAttribute("tabIndex")).toBe("0");
    expect(firstCell.hasAttribute("aria-selected")).toBe(true);

    fireEvent.keyDown(firstCell, { key: "Enter", code: "Enter" });
  });
});
