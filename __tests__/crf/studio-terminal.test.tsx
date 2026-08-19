// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { StudioTerminal } from "@/components/crf/Terminal/StudioTerminal";
import { getOncologyPresetSync } from "@/lib/crf/presets/loader";

describe("StudioTerminal In-Browser Console Component", () => {
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
        <StudioTerminal
          isOpen={false}
          study={sampleStudy}
          onClose={vi.fn()}
          onUpdateStudy={vi.fn()}
        />
      );
    });

    expect(container.textContent).toBe("");
  });

  it("renders terminal header, initial history, and quick chips when isOpen is true", async () => {
    await act(async () => {
      root.render(
        <StudioTerminal
          isOpen={true}
          study={sampleStudy}
          onClose={vi.fn()}
          onUpdateStudy={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain("CRF Studio Terminal Console");
    expect(container.textContent).toContain("Live Bidirectional Studio Sync");
    expect(container.textContent).toContain("crf validate");
  });

  it("executes CLI command and calls onUpdateStudy when adding a form", async () => {
    const handleUpdateStudy = vi.fn();

    await act(async () => {
      root.render(
        <StudioTerminal
          isOpen={true}
          study={sampleStudy}
          onClose={vi.fn()}
          onUpdateStudy={handleUpdateStudy}
        />
      );
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();

    await act(async () => {
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(input, "crf add form PE");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }
    });

    expect(handleUpdateStudy).toHaveBeenCalled();
    expect(container.textContent).toContain("ADD FORM — PE");
  });

  it("clears terminal output when 'clear' command is typed", async () => {
    await act(async () => {
      root.render(
        <StudioTerminal
          isOpen={true}
          study={sampleStudy}
          onClose={vi.fn()}
          onUpdateStudy={vi.fn()}
        />
      );
    });

    const input = container.querySelector("input");
    await act(async () => {
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(input, "clear");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }
    });

    expect(container.querySelectorAll("pre")).toHaveLength(0);
  });
});
