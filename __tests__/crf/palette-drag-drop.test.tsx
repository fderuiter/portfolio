// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { WidgetPalette, validateFieldPayload } from "@/components/crf/LeftSidebar/WidgetPalette";
import { FormCanvas } from "@/components/crf/CenterCanvas/FormCanvas";
import { CRFForm, CodelistDefinition } from "@/lib/crf/types";

describe("Palette Drag-and-Drop Field Creation Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockForm: CRFForm = {
    id: "form_palette_test",
    name: "Oncology Baseline Evaluation",
    domain: "ONC",
    description: "Baseline clinical evaluation",
    version: "1.0",
    rules: [],
    sections: [
      {
        id: "sec_1",
        title: "Clinical Observations",
        fields: [
          {
            id: "f_existing_1",
            variableName: "OBS_VAL",
            label: "Initial Observation",
            dataType: "text",
            columnSpan: 6,
            required: false,
          },
        ],
      },
    ],
  };

  const mockCodelists: CodelistDefinition[] = [];

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    if (container.parentNode) {document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("validates payload metadata correctly before form insertion", () => {
    // Valid palette widget payload
    const validWidgetPayload = {
      type: "palette_widget",
      widgetType: "number",
      label: "Decimal Number",
      defaultField: {
        label: "Systolic Blood Pressure",
        variableName: "SYS_BP",
        columnSpan: 4,
        required: true,
        unit: "mmHg",
      },
    };

    const validField = validateFieldPayload(validWidgetPayload);
    expect(validField).not.toBeNull();
    expect(validField?.dataType).toBe("number");
    expect(validField?.label).toBe("Systolic Blood Pressure");
    expect(validField?.variableName).toBe("SYS_BP");
    expect(validField?.columnSpan).toBe(4);
    expect(validField?.required).toBe(true);
    expect(validField?.unit).toBe("mmHg");
    expect(validField?.id).toMatch(/^f_number[-_]/);

    // Invalid / corrupted payloads
    expect(validateFieldPayload(null)).toBeNull();
    expect(validateFieldPayload("corrupted string")).toBeNull();
    expect(validateFieldPayload({ type: "palette_widget", widgetType: "nonexistent_type" })).toBeNull();
    expect(validateFieldPayload({ foo: "bar" })).toBeNull();
  });

  it("initiates HTML5 drag operation on palette widget buttons with serialized payload", async () => {
    const onAddField = vi.fn();

    await act(async () => {
      root.render(<WidgetPalette onAddField={onAddField} />);
    });

    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.getAttribute("draggable")).toBe("true");

    const setDataMock = vi.fn();
    const dragEvent = new Event("dragstart", { bubbles: true, cancelable: true });
    Object.defineProperty(dragEvent, "dataTransfer", {
      value: {
        setData: setDataMock,
        effectAllowed: "",
      },
    });

    await act(async () => {
      button.dispatchEvent(dragEvent);
    });

    expect(setDataMock).toHaveBeenCalledWith("application/json", expect.stringContaining('"type":"palette_widget"'));
    expect(setDataMock).toHaveBeenCalledWith("text/plain", expect.stringContaining('"type":"palette_widget"'));
  });

  it("adds field via click without triggering drag handlers (Requirement 5)", async () => {
    const onAddField = vi.fn();

    await act(async () => {
      root.render(<WidgetPalette onAddField={onAddField} />);
    });

    // Find the single-line text button
    const buttons = Array.from(container.querySelectorAll("button"));
    const textButton = buttons.find((btn) => btn.textContent?.includes("Single-Line Text"));
    expect(textButton).not.toBeUndefined();

    await act(async () => {
      textButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onAddField).toHaveBeenCalledTimes(1);
    const addedField = onAddField.mock.calls[0][0];
    expect(addedField.dataType).toBe("text");
    expect(addedField.variableName).toBe("TEXT_Q");
  });

  it("renders drop indicator line when dragging a palette item over canvas slot (Requirement 3)", async () => {
    await act(async () => {
      root.render(
        <FormCanvas
          form={mockForm}
          selectedFieldId={null}
          viewport="desktop"
          codelists={mockCodelists}
          onChangeViewport={vi.fn()}
          onSelectField={vi.fn()}
          onUpdateFormMeta={vi.fn()}
          onAddSection={vi.fn()}
          onDeleteSection={vi.fn()}
          onUpdateSectionTitle={vi.fn()}
          onDuplicateField={vi.fn()}
          onDeleteField={vi.fn()}
          onOpenPalette={vi.fn()}
        />
      );
    });

    const existingFieldCard = container.querySelector('[data-field-id="f_existing_1"]');
    expect(existingFieldCard).not.toBeNull();

    // Trigger dragover at slot 0
    const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true });
    Object.defineProperty(dragOverEvent, "dataTransfer", {
      value: { dropEffect: "" },
    });

    await act(async () => {
      existingFieldCard?.dispatchEvent(dragOverEvent);
    });

    // Indicator line rendered
    const indicator = container.querySelector(".bg-brand-cyan.animate-pulse");
    expect(indicator).not.toBeNull();
  });

  it("inserts new field at target slot on drop and selects newly created field (Requirement 2 & 3)", async () => {
    const onUpdateFormMeta = vi.fn();
    const onSelectField = vi.fn();

    await act(async () => {
      root.render(
        <FormCanvas
          form={mockForm}
          selectedFieldId={null}
          viewport="desktop"
          codelists={mockCodelists}
          onChangeViewport={vi.fn()}
          onSelectField={onSelectField}
          onUpdateFormMeta={onUpdateFormMeta}
          onAddSection={vi.fn()}
          onDeleteSection={vi.fn()}
          onUpdateSectionTitle={vi.fn()}
          onDuplicateField={vi.fn()}
          onDeleteField={vi.fn()}
          onOpenPalette={vi.fn()}
        />
      );
    });

    const existingFieldCard = container.querySelector('[data-field-id="f_existing_1"]');

    const widgetPayload = {
      type: "palette_widget",
      widgetType: "date",
      label: "Standard Date",
      defaultField: {
        label: "Assessment Date",
        variableName: "ASS_DAT",
        columnSpan: 4,
        required: true,
      },
    };

    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        getData: (format: string) => (format === "application/json" ? JSON.stringify(widgetPayload) : ""),
      },
    });

    await act(async () => {
      existingFieldCard?.dispatchEvent(dropEvent);
    });

    expect(onUpdateFormMeta).toHaveBeenCalledTimes(1);
    const updatedForm = onUpdateFormMeta.mock.calls[0][0];
    const fields = updatedForm.sections[0].fields;

    expect(fields.length).toBe(2);
    expect(fields[0].variableName).toBe("ASS_DAT");
    expect(fields[0].dataType).toBe("date");
    expect(fields[1].id).toBe("f_existing_1");

    expect(onSelectField).toHaveBeenCalledWith(fields[0].id);
  });

  it("clears visual drop indicators immediately upon drag completion, drop, or cancellation (Requirement 4)", async () => {
    await act(async () => {
      root.render(
        <FormCanvas
          form={mockForm}
          selectedFieldId={null}
          viewport="desktop"
          codelists={mockCodelists}
          onChangeViewport={vi.fn()}
          onSelectField={vi.fn()}
          onUpdateFormMeta={vi.fn()}
          onAddSection={vi.fn()}
          onDeleteSection={vi.fn()}
          onUpdateSectionTitle={vi.fn()}
          onDuplicateField={vi.fn()}
          onDeleteField={vi.fn()}
          onOpenPalette={vi.fn()}
        />
      );
    });

    const existingFieldCard = container.querySelector('[data-field-id="f_existing_1"]');

    // Hover over field slot
    const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true });
    Object.defineProperty(dragOverEvent, "dataTransfer", { value: { dropEffect: "" } });

    await act(async () => {
      existingFieldCard?.dispatchEvent(dragOverEvent);
    });

    expect(container.querySelector(".bg-brand-cyan.animate-pulse")).not.toBeNull();

    // Trigger global dragend (e.g. cancelled off-canvas or ESC key)
    await act(async () => {
      window.dispatchEvent(new Event("dragend"));
    });

    // Drop indicator line cleared completely
    expect(container.querySelector(".bg-brand-cyan.animate-pulse")).toBeNull();
  });
});
