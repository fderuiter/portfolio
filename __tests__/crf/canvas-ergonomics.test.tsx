// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FieldRenderer } from "@/components/crf/CenterCanvas/FieldRenderer";
import { CRFField } from "@/lib/crf/types";

describe("Canvas Field Ergonomics & Micro-Interactions", () => {
  let container: HTMLDivElement;
  let root: Root;

  const sampleField: CRFField = {
    id: "f_test_ergo",
    variableName: "SYSBP",
    label: "Systolic Blood Pressure",
    dataType: "number",
    columnSpan: 6,
    required: false,
    unit: "mmHg",
  };

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

  it("allows 1-click column span adjustment via presets (3c, 4c, 6c, 12c)", async () => {
    const handleUpdate = vi.fn();

    await act(async () => {
      root.render(
        <FieldRenderer
          field={sampleField}
          isSelected={true}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateField={handleUpdate}
          codelists={[]}
        />
      );
    });

    const span12Btn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "12c"
    );
    expect(span12Btn).toBeDefined();

    await act(async () => {
      span12Btn?.click();
    });

    expect(handleUpdate).toHaveBeenCalledWith({ columnSpan: 12 });
  });

  it("toggles required question status via 1-click asterisk badge", async () => {
    const handleUpdate = vi.fn();

    await act(async () => {
      root.render(
        <FieldRenderer
          field={sampleField}
          isSelected={true}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateField={handleUpdate}
          codelists={[]}
        />
      );
    });

    const reqBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Opt")
    );
    expect(reqBtn).toBeDefined();

    await act(async () => {
      reqBtn?.click();
    });

    expect(handleUpdate).toHaveBeenCalledWith({ required: true });
  });

  it("supports quick inline label editing", async () => {
    const handleUpdate = vi.fn();

    await act(async () => {
      root.render(
        <FieldRenderer
          field={sampleField}
          isSelected={true}
          onSelect={vi.fn()}
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
          onUpdateField={handleUpdate}
          codelists={[]}
        />
      );
    });

    const editBtn = container.querySelector("button[title='Quick Edit']");
    expect(editBtn).toBeDefined();

    await act(async () => {
      (editBtn as HTMLButtonElement)?.click();
    });

    expect(container.textContent).toContain("Prompt / Label");
    expect(container.textContent).toContain("SDTM Variable");

    const saveBtn = container.querySelector("button[title='Save Inline Edit']");
    expect(saveBtn).toBeDefined();

    await act(async () => {
      (saveBtn as HTMLButtonElement)?.click();
    });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Systolic Blood Pressure",
        variableName: "SYSBP",
      })
    );
  });

  it("triggers onDuplicate and onDelete handlers", async () => {
    const handleDuplicate = vi.fn();
    const handleDelete = vi.fn();

    await act(async () => {
      root.render(
        <FieldRenderer
          field={sampleField}
          isSelected={true}
          onSelect={vi.fn()}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          codelists={[]}
        />
      );
    });

    const dupBtn = container.querySelector("button[title='Duplicate Field']");
    const delBtn = container.querySelector("button[title='Delete Field']");

    await act(async () => {
      (dupBtn as HTMLButtonElement)?.click();
    });
    expect(handleDuplicate).toHaveBeenCalled();

    await act(async () => {
      (delBtn as HTMLButtonElement)?.click();
    });
    expect(handleDelete).toHaveBeenCalled();
  });
});
