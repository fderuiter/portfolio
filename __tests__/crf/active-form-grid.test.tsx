/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ActiveFormGridEditor } from "@/components/crf/Modes/ActiveFormGridEditor";
import { StudyProtocol, CRFForm } from "@/lib/crf/types";
import { getOncologyPresetSync } from "@/lib/crf/presets";

// Mock Audio & ResizeObserver
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({
    playSuccess: vi.fn(),
    playError: vi.fn(),
  }),
}));

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

describe("ActiveFormGridEditor (#539)", () => {
  let sampleStudy: StudyProtocol;
  let sampleForm: CRFForm;

  beforeEach(() => {
    sampleStudy = getOncologyPresetSync();
    sampleForm = sampleStudy.forms[0];
  });

  it("renders active form fields with stable IDs, editable variable names, and typed metadata columns", () => {
    const onSelectField = vi.fn();
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();
    const onRenameFieldEverywhere = vi.fn();
    const onSwitchMode = vi.fn();

    render(
      <ActiveFormGridEditor
        study={sampleStudy}
        activeForm={sampleForm}
        selectedFieldId={null}
        codelists={sampleStudy.codelists}
        onSelectField={onSelectField}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onRenameFieldEverywhere={onRenameFieldEverywhere}
        onSwitchMode={onSwitchMode}
      />
    );

    // Verify header and form title
    expect(screen.getByText("Active-Form Grid Metadata Editor")).not.toBeNull();
    expect(screen.getByText(new RegExp(sampleForm.name, "i"))).not.toBeNull();

    // Verify first field's stable ID and variable name
    const firstField = sampleForm.sections[0].fields[0];
    expect(screen.getByText(firstField.id)).not.toBeNull();
    expect(screen.getAllByText(firstField.variableName)[0]).not.toBeNull();
    expect(screen.getByText(firstField.label)).not.toBeNull();
  });

  it("supports keyboard cell focus and selection synchronization", () => {
    const onSelectField = vi.fn();
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();
    const onRenameFieldEverywhere = vi.fn();
    const onSwitchMode = vi.fn();

    render(
      <ActiveFormGridEditor
        study={sampleStudy}
        activeForm={sampleForm}
        selectedFieldId={null}
        codelists={sampleStudy.codelists}
        onSelectField={onSelectField}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onRenameFieldEverywhere={onRenameFieldEverywhere}
        onSwitchMode={onSwitchMode}
      />
    );

    const firstField = sampleForm.sections[0].fields[0];
    const secondField = sampleForm.sections[0].fields[1];

    // Click first data row in table
    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1]; // row 0 is the table header
    fireEvent.click(firstDataRow);

    expect(onSelectField).toHaveBeenCalledWith(firstField.id);

    // Press ArrowDown to navigate to second row
    const gridContainer = rows[0].closest("div")?.parentElement;
    if (gridContainer) {
      fireEvent.keyDown(gridContainer, { key: "ArrowDown" });
      expect(onSelectField).toHaveBeenCalledWith(secondField.id);
    }
  });

  it("invokes Sentinel refactoring when variable name cell is edited and committed", () => {
    const onSelectField = vi.fn();
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();
    const onRenameFieldEverywhere = vi.fn();
    const onSwitchMode = vi.fn();

    render(
      <ActiveFormGridEditor
        study={sampleStudy}
        activeForm={sampleForm}
        selectedFieldId={null}
        codelists={sampleStudy.codelists}
        onSelectField={onSelectField}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onRenameFieldEverywhere={onRenameFieldEverywhere}
        onSwitchMode={onSwitchMode}
      />
    );

    const firstField = sampleForm.sections[0].fields[0];

    // Double click variable name cell (in 1st data row, 3rd child td)
    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1];
    const varNameTd = firstDataRow.children[2]; // column index 2 is variableName

    const span = varNameTd.querySelector("span");
    if (span) {
      fireEvent.doubleClick(span);
    } else {
      fireEvent.doubleClick(varNameTd);
    }

    const input = screen.getByDisplayValue(firstField.variableName);
    fireEvent.change(input, { target: { value: "NEW_VAR_NAME" } });
    fireEvent.blur(input);

    expect(onRenameFieldEverywhere).toHaveBeenCalledWith(
      firstField.id,
      "NEW_VAR_NAME",
      firstField.label
    );
  });

  it("allows codelist selection updates for single or multi select fields", () => {
    const onSelectField = vi.fn();
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();
    const onRenameFieldEverywhere = vi.fn();
    const onSwitchMode = vi.fn();

    render(
      <ActiveFormGridEditor
        study={sampleStudy}
        activeForm={sampleForm}
        selectedFieldId={null}
        codelists={sampleStudy.codelists}
        onSelectField={onSelectField}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onRenameFieldEverywhere={onRenameFieldEverywhere}
        onSwitchMode={onSwitchMode}
      />
    );

    const selects = screen.getAllByRole("combobox");
    const clSelect = selects.find((s) => s.innerHTML.includes("-- None --"));

    if (clSelect && sampleStudy.codelists[0]) {
      fireEvent.change(clSelect, {
        target: { value: sampleStudy.codelists[0].id },
      });
      expect(onUpdateField).toHaveBeenCalled();
    }
  });

  it("validates batch paste payload, rejects invalid paste without applying updates, and commits valid paste atomically", async () => {
    const onSelectField = vi.fn();
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();
    const onRenameFieldEverywhere = vi.fn();
    const onSwitchMode = vi.fn();

    render(
      <ActiveFormGridEditor
        study={sampleStudy}
        activeForm={sampleForm}
        selectedFieldId={null}
        codelists={sampleStudy.codelists}
        onSelectField={onSelectField}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onRenameFieldEverywhere={onRenameFieldEverywhere}
        onSwitchMode={onSwitchMode}
      />
    );

    // Open Paste Modal
    const pasteBtn = screen.getByRole("button", {
      name: "Paste / Batch Update",
    });
    fireEvent.click(pasteBtn);

    expect(screen.getByText("Paste / Batch Metadata Update")).not.toBeNull();

    const textarea = screen.getByPlaceholderText(/DM_AGE/i);

    // 1. Test INVALID paste payload (invalid variable name format and column span > 12)
    const invalidTsv = `123_INVALID_VAR\tTest Label\tnumber\ttrue\t99\t\tkg\thard_stop\tBad Data`;
    fireEvent.change(textarea, { target: { value: invalidTsv } });

    const validateBtn = screen.getByRole("button", {
      name: /Validate & Preview Batch/i,
    });
    fireEvent.click(validateBtn);

    // Verify validation errors in preview table
    await waitFor(() => {
      expect(screen.getByText(/Invalid batch payload/i)).not.toBeNull();
    });

    const commitBtn = screen.getByRole("button", {
      name: /Commit Batch Update/i,
    });
    expect((commitBtn as HTMLButtonElement).disabled).toBe(true);

    // 2. Test VALID paste payload
    const validTsv = `VAR_A\tUpdated Question Label\tnumber\ttrue\t6\t\tmmHg\thard_stop\tValid hint text`;
    fireEvent.change(textarea, { target: { value: validTsv } });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText(/All fields valid/i)).not.toBeNull();
    });

    expect((commitBtn as HTMLButtonElement).disabled).toBe(false);

    // Commit batch
    fireEvent.click(commitBtn);

    expect(onBatchUpdateFields).toHaveBeenCalledTimes(1);
    const batchArg = onBatchUpdateFields.mock.calls[0][0];
    expect(batchArg).toHaveLength(1);
    expect(batchArg[0].newVariableName).toBe("VAR_A");
    expect(batchArg[0].updates.label).toBe("Updated Question Label");
  });

  it("switches back to Canvas mode on clicking Canvas button", () => {
    const onSelectField = vi.fn();
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();
    const onRenameFieldEverywhere = vi.fn();
    const onSwitchMode = vi.fn();

    render(
      <ActiveFormGridEditor
        study={sampleStudy}
        activeForm={sampleForm}
        selectedFieldId={null}
        codelists={sampleStudy.codelists}
        onSelectField={onSelectField}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
        onRenameFieldEverywhere={onRenameFieldEverywhere}
        onSwitchMode={onSwitchMode}
      />
    );

    const canvasBtn = screen.getByTitle("Return to Canvas");
    fireEvent.click(canvasBtn);

    expect(onSwitchMode).toHaveBeenCalledWith("designer");
  });
});
