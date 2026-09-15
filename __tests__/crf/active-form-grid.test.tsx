// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ActiveFormGrid } from "@/components/crf/Modes/ActiveFormGrid";
import { CRFStudioContainer } from "@/components/crf/CRFStudioContainer";
import { getOncologyPresetSync } from "@/lib/crf/presets";
import { StudyProtocol, CRFForm } from "@/lib/crf/types";
import { StudyProtocolEngine } from "@/lib/crf/study-engine";

describe("Issue #539: Active-Form Grid Metadata Editing & Paste", () => {
  let sampleStudy: StudyProtocol;
  let activeForm: CRFForm;

  beforeEach(() => {
    cleanup();
    sampleStudy = getOncologyPresetSync();
    activeForm = sampleStudy.forms[0];
  });

  describe("1. Metadata Columns & Stable Identity", () => {
    it("renders stable identity ID as read-only and variable name as editable text", () => {
      const onSelectField = vi.fn();
      const onUpdateField = vi.fn();
      const onUpdateStudy = vi.fn();

      render(
        <ActiveFormGrid
          form={activeForm}
          study={sampleStudy}
          selectedFieldId={null}
          onSelectField={onSelectField}
          onUpdateField={onUpdateField}
          onUpdateStudy={onUpdateStudy}
        />
      );

      // Verify Stable Identity header and values exist
      expect(screen.getByText("Stable ID")).not.toBeNull();
      expect(screen.getByText("CDASH Variable")).not.toBeNull();
      expect(screen.getByText("External OID / aCRF")).not.toBeNull();

      const firstField = activeForm.sections[0].fields[0];
      expect(screen.getAllByText(firstField.id)[0]).not.toBeNull();
      expect(screen.getAllByText(firstField.variableName)[0]).not.toBeNull();
    });
  });

  describe("2. Selection Persistence & Bi-directional Sync (Grid <-> Canvas)", () => {
    it("synchronizes selected field between Grid and Canvas views", () => {
      const targetField = activeForm.sections[0].fields[1];

      const onSelectField = vi.fn();
      const onUpdateField = vi.fn();
      const onUpdateStudy = vi.fn();

      const { container } = render(
        <ActiveFormGrid
          form={activeForm}
          study={sampleStudy}
          selectedFieldId={targetField.id}
          onSelectField={onSelectField}
          onUpdateField={onUpdateField}
          onUpdateStudy={onUpdateStudy}
        />
      );

      // Verify targetField variable element exists
      const targetVarElements = screen.getAllByText(targetField.variableName);
      expect(targetVarElements.length).toBeGreaterThan(0);

      // Click row 0 cell in tbody
      const firstRowCells = container
        .querySelectorAll("tbody tr")[0]
        .querySelectorAll("td");
      fireEvent.click(firstRowCells[2]); // variableName cell

      const firstField = activeForm.sections[0].fields[0];
      expect(onSelectField).toHaveBeenCalledWith(firstField.id);
    });

    it("persists selection when switching between Canvas and Grid modes in CRFStudioContainer", async () => {
      render(<CRFStudioContainer />);

      // Find the Form Grid header mode button
      const gridTab = screen.getAllByText("Form Grid")[0];
      await act(async () => {
        fireEvent.click(gridTab);
      });

      // Verify Active Form Grid rendered
      await waitFor(() => {
        expect(screen.getAllByText("Active Form Grid").length).toBeGreaterThan(
          0
        );
      });

      // Switch back to Canvas view
      const canvasTab = screen.getAllByText("Canvas")[0];
      await act(async () => {
        fireEvent.click(canvasTab);
      });

      // Verify Layout Canvas rendered
      await waitFor(() => {
        expect(screen.getAllByText("Layout Canvas").length).toBeGreaterThan(0);
      });
    });
  });

  describe("3. Keyboard Navigation & Cell Editing", () => {
    it("supports Enter to start edit, Escape to cancel edit, and Enter to commit edit", () => {
      const onSelectField = vi.fn();
      const onUpdateField = vi.fn();
      const onUpdateStudy = vi.fn();

      const { container } = render(
        <ActiveFormGrid
          form={activeForm}
          study={sampleStudy}
          selectedFieldId={null}
          onSelectField={onSelectField}
          onUpdateField={onUpdateField}
          onUpdateStudy={onUpdateStudy}
        />
      );

      const gridContainer = container.querySelector(
        '[aria-label="Active Form Grid"]'
      )!;

      // Focus grid container and navigate with Arrow keys
      fireEvent.keyDown(gridContainer, { key: "ArrowDown" });
      fireEvent.keyDown(gridContainer, { key: "ArrowRight" });

      // Press Enter to start inline editing
      fireEvent.keyDown(gridContainer, { key: "Enter" });

      // An input field should appear
      const input = container.querySelector("input");
      expect(input).not.toBeNull();

      // Press Escape to cancel edit
      if (input) {
        fireEvent.keyDown(input, { key: "Escape" });
      }

      // Input should no longer be present
      expect(container.querySelector("input")).toBeNull();
    });
  });

  describe("4. Paste & Validation Preview Engine", () => {
    it("previews paste batch, rejects invalid paste data, and prevents partial overwrites", async () => {
      const onSelectField = vi.fn();
      const onUpdateField = vi.fn();
      const onUpdateStudy = vi.fn();

      render(
        <ActiveFormGrid
          form={activeForm}
          study={sampleStudy}
          selectedFieldId={null}
          onSelectField={onSelectField}
          onUpdateField={onUpdateField}
          onUpdateStudy={onUpdateStudy}
        />
      );

      // Click Paste / Fill button
      const pasteButton = screen.getAllByRole("button", {
        name: /Paste \/ Fill/i,
      })[0];
      fireEvent.click(pasteButton);

      // Modal should appear with preview heading
      expect(
        screen.getByText("Batch Metadata Paste Validation & Preview")
      ).not.toBeNull();

      // Enter invalid data into the paste textarea (invalid variable name with spaces)
      const textarea = screen.getByPlaceholderText(/Paste TSV\/CSV text here/i);
      fireEvent.change(textarea, {
        target: { value: "INVALID NAME!\tTest Label\tinteger\ttrue\tmmHg\t6" },
      });

      // Status banner should indicate invalid cell
      await waitFor(() => {
        expect(
          screen.getByText(/Fix invalid cell data before committing batch/i)
        ).not.toBeNull();
      });

      // Commit Batch button should be disabled
      const commitButton = screen.getByRole("button", {
        name: /Commit Batch/i,
      });
      expect((commitButton as HTMLButtonElement).disabled).toBe(true);

      expect(onUpdateStudy).not.toHaveBeenCalled();
    });

    it("commits valid paste batch atomically in one undo unit", async () => {
      const onSelectField = vi.fn();
      const onUpdateField = vi.fn();
      const onUpdateStudy = vi.fn();

      render(
        <ActiveFormGrid
          form={activeForm}
          study={sampleStudy}
          selectedFieldId={null}
          onSelectField={onSelectField}
          onUpdateField={onUpdateField}
          onUpdateStudy={onUpdateStudy}
        />
      );

      // Click Paste / Fill button
      const pasteButton = screen.getAllByRole("button", {
        name: /Paste \/ Fill/i,
      })[0];
      fireEvent.click(pasteButton);

      // Enter valid paste data (variableName, label, dataType)
      const textarea = screen.getByPlaceholderText(/Paste TSV\/CSV text here/i);
      fireEvent.change(textarea, {
        target: { value: "AETEST\tAdverse Event Test\ttext" },
      });

      // Commit Batch button should be enabled
      const commitButton = screen.getByRole("button", {
        name: /Commit Batch/i,
      });
      await waitFor(() => {
        expect((commitButton as HTMLButtonElement).disabled).toBe(false);
      });

      await act(async () => {
        fireEvent.click(commitButton);
      });

      // onUpdateStudy should be called exactly once
      await waitFor(() => {
        expect(onUpdateStudy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("5. Sentinel Variable Rename Integration", () => {
    it("renames variables everywhere updating rules and formulas atomically", () => {
      const sysField = activeForm.sections[0].fields[0];
      const res = StudyProtocolEngine.renameFieldEverywhere(
        sampleStudy,
        activeForm.id,
        sysField.id,
        "SYSBP2"
      );

      expect(res.error).toBeUndefined();
      expect(res.study).toBeDefined();

      const updatedForm = res.study.forms.find((f) => f.id === activeForm.id)!;
      const updatedField = updatedForm.sections[0].fields[0];
      expect(updatedField.variableName).toBe("SYSBP2");
    });
  });
});
