// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FormCanvas } from "@/components/crf/CenterCanvas/FormCanvas";
import { CRFForm, CodelistDefinition } from "@/lib/crf/types";

describe("Adaptive-Span Indicator & Row-Boundary Splice Integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockForm: CRFForm = {
    id: "form_adaptive_span_test",
    name: "Adaptive Span Form",
    domain: "VS",
    description: "Testing adaptive drop indicators and row boundaries",
    version: "1.0",
    rules: [],
    sections: [
      {
        id: "sec_multi_col",
        title: "Multi-Column Section",
        fields: [
          {
            id: "f_col3_a",
            variableName: "FIELD_A",
            label: "Field A (3 Cols)",
            dataType: "text",
            columnSpan: 3,
            required: false,
          },
          {
            id: "f_col3_b",
            variableName: "FIELD_B",
            label: "Field B (3 Cols)",
            dataType: "text",
            columnSpan: 3,
            required: false,
          },
          {
            id: "f_col6_c",
            variableName: "FIELD_C",
            label: "Field C (6 Cols)",
            dataType: "text",
            columnSpan: 6,
            required: false,
          },
          {
            id: "f_col12_d",
            variableName: "FIELD_D",
            label: "Field D (12 Cols)",
            dataType: "text",
            columnSpan: 12,
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

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1;
    });
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

  it("renders drop indicator matching column span of dragged field (3 columns)", async () => {
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

    const fieldA = container.querySelector('[data-field-id="f_col3_a"]');
    const fieldB = container.querySelector('[data-field-id="f_col3_b"]');
    expect(fieldA).not.toBeNull();
    expect(fieldB).not.toBeNull();

    // Trigger drag start on field A (3 cols)
    await act(async () => {
      const dragStartEvent = new Event("dragstart", { bubbles: true, cancelable: true });
      Object.assign(dragStartEvent, {
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn(),
        },
      });
      fieldA?.dispatchEvent(dragStartEvent);
    });

    // Trigger drag over on field B
    await act(async () => {
      const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true });
      fieldB?.dispatchEvent(dragOverEvent);
    });

    const dropIndicator = container.querySelector('[data-testid="drop-indicator"]');
    expect(dropIndicator).not.toBeNull();
    // Verify drop indicator uses 3-column span class
    expect(dropIndicator?.className).toContain("sm:col-span-3");
    expect(dropIndicator?.textContent).toContain("Drop Here (3 Cols)");
  });

  it("throttles drag hover updates using requestAnimationFrame", async () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");

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

    const fieldB = container.querySelector('[data-field-id="f_col3_b"]');

    await act(async () => {
      const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true });
      fieldB?.dispatchEvent(dragOverEvent);
    });

    expect(rafSpy).toHaveBeenCalled();
  });

  it("directional controls trigger cumulative row boundary reordering", async () => {
    const onUpdateFormMeta = vi.fn();

    await act(async () => {
      root.render(
        <FormCanvas
          form={mockForm}
          selectedFieldId="f_col12_d"
          viewport="desktop"
          codelists={mockCodelists}
          onChangeViewport={vi.fn()}
          onSelectField={vi.fn()}
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

    const moveUpBtns = container.querySelectorAll('button[title="Move Field Up"]');
    expect(moveUpBtns.length).toBeGreaterThan(0);

    await act(async () => {
      moveUpBtns[moveUpBtns.length - 1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onUpdateFormMeta).toHaveBeenCalled();
  });
});
