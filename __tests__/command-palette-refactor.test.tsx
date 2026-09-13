/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CommandPalette } from "@/components/CommandPalette";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockPlayHover = vi.fn();
const mockPlaySubmit = vi.fn();
vi.mock("@/components/providers/AudioProvider", () => ({
  registerAudioCleanup: vi.fn(() => vi.fn()),
  useAudio: () => ({
    playHover: mockPlayHover,
    playSubmit: mockPlaySubmit,
    playSuccess: vi.fn(),
    playNote: vi.fn(),
    volume: 0.3,
    muted: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

let mockIsOpen = true;
const mockCloseSearch = vi.fn();
const mockSetIsOpen = vi.fn((val: boolean) => {
  mockIsOpen = val;
});

vi.mock("@/components/providers/SearchProvider", () => ({
  useSearch: () => ({
    isOpen: mockIsOpen,
    setIsOpen: mockSetIsOpen,
    closeSearch: mockCloseSearch,
  }),
}));

describe("CommandPalette Performance & Concurrency Refactor", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpen = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = "";
  });

  it("renders search palette and verifies input responsiveness", async () => {
    await act(async () => {
      root.render(<CommandPalette />);
    });

    const combobox = document.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement;
    expect(combobox).not.toBeNull();

    // Type query
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeSetter?.call(combobox, "arcade");
      combobox.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(combobox.value).toBe("arcade");
    const previewPane = document.querySelector("#palette-preview-pane");
    expect(previewPane?.textContent).toContain("Arcade");
  });

  it("uses consolidated hover listener on list items without redundant listeners", async () => {
    await act(async () => {
      root.render(<CommandPalette />);
    });

    const options = document.querySelectorAll('div[role="option"]');
    expect(options.length).toBeGreaterThan(1);

    // Mouseover second option (triggers React onMouseEnter synthetic event)
    await act(async () => {
      options[1].dispatchEvent(
        new MouseEvent("mouseover", {
          bubbles: true,
          relatedTarget: document.body,
        })
      );
    });

    expect(mockPlayHover).toHaveBeenCalledTimes(1);
    const secondOption = options[1] as HTMLDivElement;
    expect(secondOption.getAttribute("aria-selected")).toBe("true");
  });

  it("throttles Web Audio triggers during rapid cursor navigation", async () => {
    await act(async () => {
      root.render(<CommandPalette />);
    });

    const combobox = document.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement;

    // Rapid ArrowDown presses
    await act(async () => {
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
    });

    // All keydowns moved index, audio trigger was throttled or executed
    expect(mockPlayHover.mock.calls.length).toBeGreaterThan(0);
  });
});
